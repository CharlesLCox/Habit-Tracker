$ErrorActionPreference = "Stop"

function Invoke-External {
  param(
    [string]$Exe,
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FailureMessage (exit code $LASTEXITCODE)."
  }
}

function Get-ExternalText {
  param(
    [string]$Exe,
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  $result = & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FailureMessage (exit code $LASTEXITCODE)."
  }

  if ($null -eq $result) {
    return ""
  }

  if ($result -is [System.Array]) {
    return (($result | ForEach-Object { [string]$_ }) -join "`n").Trim()
  }

  return ([string]$result).Trim()
}

$AwsRegion = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-2" }
$AwsAccountId = $env:AWS_ACCOUNT_ID
$EcrRepository = $env:ECR_REPOSITORY
$EcsCluster = $env:ECS_CLUSTER
$EcsService = $env:ECS_SERVICE
$EcsTaskFamily = $env:ECS_TASK_FAMILY
$EcsContainerName = $env:ECS_CONTAINER_NAME
$ImageTag = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" }
$WaitForStability = if ($env:WAIT_FOR_STABILITY) { $env:WAIT_FOR_STABILITY } else { "true" }

function Require-Env {
  param(
    [string]$Name,
    [string]$Value
  )
  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "$Name is required."
  }
}

Require-Env -Name "ECR_REPOSITORY" -Value $EcrRepository
Require-Env -Name "ECS_CLUSTER" -Value $EcsCluster
Require-Env -Name "ECS_SERVICE" -Value $EcsService
Require-Env -Name "ECS_TASK_FAMILY" -Value $EcsTaskFamily

if ([string]::IsNullOrWhiteSpace($AwsAccountId)) {
  $AwsAccountId = Get-ExternalText -Exe "aws" -Arguments @("sts", "get-caller-identity", "--query", "Account", "--output", "text") -FailureMessage "Failed to resolve AWS account id"
}

$EcrRegistry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ImageUri = "{0}/{1}:{2}" -f $EcrRegistry, $EcrRepository, $ImageTag

Write-Host "Logging in to ECR: $EcrRegistry"
$ecrPassword = Get-ExternalText -Exe "aws" -Arguments @("ecr", "get-login-password", "--region", $AwsRegion) -FailureMessage "Failed to get ECR login password"
$ecrPassword | docker login --username AWS --password-stdin $EcrRegistry
if ($LASTEXITCODE -ne 0) {
  throw "Docker login to ECR failed. Ensure repository/account/region are correct and AWS user has ECR permissions."
}

Write-Host "Building Docker image: $ImageUri"
Invoke-External -Exe "docker" -Arguments @("build", "-t", $ImageUri, ".") -FailureMessage "Docker build failed"

Write-Host "Pushing Docker image: $ImageUri"
Invoke-External -Exe "docker" -Arguments @("push", $ImageUri) -FailureMessage "Docker push failed"

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("ecs-deploy-" + [guid]::NewGuid().ToString("N"))
New-Item -Path $tmpDir -ItemType Directory | Out-Null

try {
  $currentTaskDef = Join-Path $tmpDir "current-task-def.json"
  $newTaskDef = Join-Path $tmpDir "new-task-def.json"

  Write-Host "Reading current task definition: $EcsTaskFamily"
  $taskDefJson = Get-ExternalText -Exe "aws" -Arguments @("ecs", "describe-task-definition", "--task-definition", $EcsTaskFamily, "--output", "json") -FailureMessage "Failed to describe ECS task definition '$EcsTaskFamily'"
  $taskDefJson | Set-Content -Path $currentTaskDef -Encoding utf8

  $nodeArgs = @(
    "scripts/render-ecs-task-def.mjs",
    "--input", $currentTaskDef,
    "--output", $newTaskDef,
    "--image-uri", $ImageUri
  )

  if (-not [string]::IsNullOrWhiteSpace($EcsContainerName)) {
    $nodeArgs += @("--container-name", $EcsContainerName)
  }

  Invoke-External -Exe "node" -Arguments $nodeArgs -FailureMessage "Failed to render new ECS task definition JSON"

  Write-Host "Registering updated task definition"
  $newTaskDefArn = Get-ExternalText -Exe "aws" -Arguments @("ecs", "register-task-definition", "--cli-input-json", "file://$newTaskDef", "--query", "taskDefinition.taskDefinitionArn", "--output", "text") -FailureMessage "Failed to register updated ECS task definition"
  if ([string]::IsNullOrWhiteSpace($newTaskDefArn)) {
    throw "register-task-definition returned an empty task definition ARN."
  }

  Write-Host "Updating ECS service: $EcsService"
  Invoke-External -Exe "aws" -Arguments @("ecs", "update-service", "--cluster", $EcsCluster, "--service", $EcsService, "--task-definition", $newTaskDefArn) -FailureMessage "Failed to update ECS service '$EcsService'"

  if ($WaitForStability -eq "true") {
    Write-Host "Waiting for service stability"
    Invoke-External -Exe "aws" -Arguments @("ecs", "wait", "services-stable", "--cluster", $EcsCluster, "--services", $EcsService) -FailureMessage "ECS service did not reach stable state"
  }

  Write-Host "ECS deployment finished. Service now uses: $newTaskDefArn"
}
finally {
  if (Test-Path $tmpDir) {
    Remove-Item -Path $tmpDir -Recurse -Force
  }
}
