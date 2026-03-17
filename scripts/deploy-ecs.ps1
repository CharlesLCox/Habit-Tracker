$ErrorActionPreference = "Stop"

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
  $AwsAccountId = aws sts get-caller-identity --query Account --output text
}

$EcrRegistry = "$AwsAccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ImageUri = "{0}/{1}:{2}" -f $EcrRegistry, $EcrRepository, $ImageTag

Write-Host "Logging in to ECR: $EcrRegistry"
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry

Write-Host "Building Docker image: $ImageUri"
docker build -t $ImageUri .

Write-Host "Pushing Docker image: $ImageUri"
docker push $ImageUri

$tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ("ecs-deploy-" + [guid]::NewGuid().ToString("N"))
New-Item -Path $tmpDir -ItemType Directory | Out-Null

try {
  $currentTaskDef = Join-Path $tmpDir "current-task-def.json"
  $newTaskDef = Join-Path $tmpDir "new-task-def.json"

  Write-Host "Reading current task definition: $EcsTaskFamily"
  $taskDefJson = aws ecs describe-task-definition --task-definition $EcsTaskFamily --output json
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

  node @nodeArgs

  Write-Host "Registering updated task definition"
  $newTaskDefArn = aws ecs register-task-definition --cli-input-json "file://$newTaskDef" --query "taskDefinition.taskDefinitionArn" --output text

  Write-Host "Updating ECS service: $EcsService"
  aws ecs update-service --cluster $EcsCluster --service $EcsService --task-definition $newTaskDefArn | Out-Null

  if ($WaitForStability -eq "true") {
    Write-Host "Waiting for service stability"
    aws ecs wait services-stable --cluster $EcsCluster --services $EcsService
  }

  Write-Host "ECS deployment finished. Service now uses: $newTaskDefArn"
}
finally {
  if (Test-Path $tmpDir) {
    Remove-Item -Path $tmpDir -Recurse -Force
  }
}
