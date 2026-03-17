$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $global:PSNativeCommandUseErrorActionPreference = $false
}

$AwsRegion = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-2" }
$AppName = if ($env:APP_NAME) { $env:APP_NAME } else { "task-tracker" }
$EcrRepository = if ($env:ECR_REPOSITORY) { $env:ECR_REPOSITORY } else { "$AppName-frontend" }
$EcsCluster = if ($env:ECS_CLUSTER) { $env:ECS_CLUSTER } else { "$AppName-cluster" }
$EcsService = if ($env:ECS_SERVICE) { $env:ECS_SERVICE } else { "$AppName-service" }
$EcsTaskFamily = if ($env:ECS_TASK_FAMILY) { $env:ECS_TASK_FAMILY } else { "$AppName-task" }
$EcsContainerName = if ($env:ECS_CONTAINER_NAME) { $env:ECS_CONTAINER_NAME } else { "frontend" }
$AlbName = if ($env:ALB_NAME) { $env:ALB_NAME } else { "$AppName-alb" }
$TargetGroupName = if ($env:TARGET_GROUP_NAME) { $env:TARGET_GROUP_NAME } else { "$AppName-tg" }
$AlbSgName = if ($env:ALB_SG_NAME) { $env:ALB_SG_NAME } else { "$AppName-alb-sg" }
$TaskSgName = if ($env:TASK_SG_NAME) { $env:TASK_SG_NAME } else { "$AppName-task-sg" }
$TaskCpu = if ($env:TASK_CPU) { $env:TASK_CPU } else { "256" }
$TaskMemory = if ($env:TASK_MEMORY) { $env:TASK_MEMORY } else { "512" }
$ContainerPort = if ($env:CONTAINER_PORT) { [int]$env:CONTAINER_PORT } else { 80 }
$DesiredCount = if ($env:DESIRED_COUNT) { [int]$env:DESIRED_COUNT } else { 1 }
$WaitForStability = if ($env:WAIT_FOR_STABILITY) { $env:WAIT_FOR_STABILITY } else { "true" }
$CreateIamRoles = if ($env:CREATE_IAM_ROLES) { $env:CREATE_IAM_ROLES } else { "true" }
$TaskExecutionRoleName = if ($env:TASK_EXECUTION_ROLE_NAME) { $env:TASK_EXECUTION_ROLE_NAME } else { "$AppName-ecsTaskExecutionRole" }
$TaskRoleName = if ($env:TASK_ROLE_NAME) { $env:TASK_ROLE_NAME } else { "$AppName-ecsTaskRole" }
$TaskExecutionRoleArn = $env:TASK_EXECUTION_ROLE_ARN
$TaskRoleArn = $env:TASK_ROLE_ARN
$VpcId = $env:VPC_ID
$SubnetIdsRaw = $env:SUBNET_IDS

function Normalize-AwsValue {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $null }
  $trimmed = $Value.Trim()
  if ($trimmed -eq "None" -or $trimmed -eq "MISSING") { return $null }
  return $trimmed
}

function Invoke-Aws {
  param(
    [string[]]$CommandArgs,
    [switch]$AllowFailure
  )

  $safeArgs = @($CommandArgs | Where-Object { $_ -ne $null -and -not [string]::IsNullOrWhiteSpace([string]$_) })
  if ($safeArgs.Count -eq 0) {
    return @{
      ExitCode = 1
      StdOut   = $null
      StdErr   = "No AWS CLI arguments were supplied."
    }
  }

  $stdoutPath = Join-Path ([System.IO.Path]::GetTempPath()) ("aws-out-" + [Guid]::NewGuid().ToString("N") + ".txt")
  $stderrPath = Join-Path ([System.IO.Path]::GetTempPath()) ("aws-err-" + [Guid]::NewGuid().ToString("N") + ".txt")
  try {
    $process = Start-Process -FilePath "aws" -ArgumentList $safeArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
    $stdout = if (Test-Path $stdoutPath) { Normalize-AwsValue -Value (Get-Content -Raw -Path $stdoutPath) } else { $null }
    $stderr = if (Test-Path $stderrPath) { Normalize-AwsValue -Value (Get-Content -Raw -Path $stderrPath) } else { $null }

    if ($process.ExitCode -ne 0 -and -not $AllowFailure) {
      $message = if ($stderr) { $stderr } else { "aws command failed with exit code $($process.ExitCode)." }
      throw "AWS CLI command failed. $message"
    }

    return @{
      ExitCode = $process.ExitCode
      StdOut   = $stdout
      StdErr   = $stderr
    }
  }
  finally {
    if (Test-Path $stdoutPath) { Remove-Item -Path $stdoutPath -Force }
    if (Test-Path $stderrPath) { Remove-Item -Path $stderrPath -Force }
  }
}

function Try-AwsText {
  param([string[]]$CommandArgs)
  $result = Invoke-Aws -CommandArgs $CommandArgs -AllowFailure
  if ($result.ExitCode -ne 0) { return $null }
  return $result.StdOut
}

function Ensure-EcrRepository {
  param([string]$RepositoryName)
  $repoArn = Try-AwsText -CommandArgs @(
    "ecr", "describe-repositories",
    "--repository-names", $RepositoryName,
    "--region", $AwsRegion,
    "--query", "repositories[0].repositoryArn",
    "--output", "text"
  )
  if (-not $repoArn) {
    Write-Host "Creating ECR repository: $RepositoryName"
    $createResult = Invoke-Aws -CommandArgs @("ecr", "create-repository", "--repository-name", $RepositoryName, "--region", $AwsRegion) -AllowFailure
    if ($createResult.ExitCode -ne 0 -and -not ($createResult.StdErr -match "RepositoryAlreadyExistsException")) {
      throw "Failed creating ECR repository '$RepositoryName'. $($createResult.StdErr)"
    }
  }
  else {
    Write-Host "Reusing ECR repository: $RepositoryName"
  }
}

function Ensure-IamRole {
  param(
    [string]$RoleName,
    [string]$TrustPolicyPath
  )
  $roleArn = Try-AwsText -CommandArgs @("iam", "get-role", "--role-name", $RoleName, "--query", "Role.Arn", "--output", "text")
  if (-not $roleArn) {
    Write-Host "Creating IAM role: $RoleName"
    $stdoutPath = Join-Path ([System.IO.Path]::GetTempPath()) ("aws-out-" + [Guid]::NewGuid().ToString("N") + ".txt")
    $stderrPath = Join-Path ([System.IO.Path]::GetTempPath()) ("aws-err-" + [Guid]::NewGuid().ToString("N") + ".txt")
    try {
      $createArgs = @(
        "iam", "create-role",
        "--role-name", $RoleName,
        "--assume-role-policy-document", "file://$TrustPolicyPath"
      )
      $process = Start-Process -FilePath "aws" -ArgumentList $createArgs -NoNewWindow -Wait -PassThru -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath
      if ($process.ExitCode -ne 0) {
        $errorText = Normalize-AwsValue -Value (Get-Content -Raw -Path $stderrPath)
        if (-not $errorText) {
          $errorText = "aws iam create-role failed with exit code $($process.ExitCode)."
        }
        throw "Failed creating IAM role '$RoleName'. $errorText"
      }
    }
    finally {
      if (Test-Path $stdoutPath) { Remove-Item -Path $stdoutPath -Force }
      if (Test-Path $stderrPath) { Remove-Item -Path $stderrPath -Force }
    }

    $roleArn = Try-AwsText -CommandArgs @("iam", "get-role", "--role-name", $RoleName, "--query", "Role.Arn", "--output", "text")
    if (-not $roleArn) {
      throw "IAM role '$RoleName' was created but could not be retrieved."
    }
  }
  else {
    Write-Host "Reusing IAM role: $RoleName"
  }
  return ([string]$roleArn).Trim()
}

function Ensure-SecurityGroup {
  param(
    [string]$GroupName,
    [string]$Description
  )
  $groupId = Try-AwsText -CommandArgs @(
    "ec2", "describe-security-groups",
    "--filters", "Name=group-name,Values=$GroupName", "Name=vpc-id,Values=$VpcId",
    "--query", "SecurityGroups[0].GroupId",
    "--output", "text",
    "--region", $AwsRegion
  )

  if (-not $groupId) {
    $groupId = & aws ec2 create-security-group `
      --group-name $GroupName `
      --description $Description `
      --vpc-id $VpcId `
      --region $AwsRegion `
      --query "GroupId" `
      --output text
    Write-Host "Created security group: $GroupName ($groupId)"
  }
  else {
    Write-Host "Reusing security group: $GroupName ($groupId)"
  }
  return $groupId.Trim()
}

$AwsAccountId = & aws sts get-caller-identity --query Account --output text
Write-Host "Using account: $AwsAccountId"
Write-Host "Using region: $AwsRegion"

if (-not $VpcId) {
  $VpcId = Try-AwsText -CommandArgs @("ec2", "describe-vpcs", "--filters", "Name=isDefault,Values=true", "--query", "Vpcs[0].VpcId", "--output", "text")
}
if (-not $VpcId) {
  $VpcId = Try-AwsText -CommandArgs @("ec2", "describe-vpcs", "--query", "Vpcs[0].VpcId", "--output", "text")
}
if (-not $VpcId) {
  throw "Could not resolve VPC_ID. Set VPC_ID and rerun."
}

if (-not $SubnetIdsRaw) {
  $SubnetIdsRaw = & aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VpcId" --query "Subnets[].SubnetId" --output text
}
$SubnetIds = @($SubnetIdsRaw -split "\s+" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($SubnetIds.Count -lt 2) {
  throw "Need at least two subnets. Pass SUBNET_IDS='subnet-a subnet-b'."
}
$Subnet1 = $SubnetIds[0]
$Subnet2 = $SubnetIds[1]
$SubnetCsv = "$Subnet1,$Subnet2"

Write-Host "Using VPC: $VpcId"
Write-Host "Using subnets: $Subnet1, $Subnet2"

Ensure-EcrRepository -RepositoryName $EcrRepository

$clusterArn = Try-AwsText -CommandArgs @("ecs", "describe-clusters", "--clusters", $EcsCluster, "--region", $AwsRegion, "--query", "clusters[0].clusterArn", "--output", "text")
if (-not $clusterArn) {
  Write-Host "Creating ECS cluster: $EcsCluster"
  & aws ecs create-cluster --cluster-name $EcsCluster --region $AwsRegion > $null
}
else {
  Write-Host "Reusing ECS cluster: $EcsCluster"
}

$LogGroup = "/ecs/$EcsTaskFamily"
$createLogGroupResult = Invoke-Aws -CommandArgs @("logs", "create-log-group", "--log-group-name", $LogGroup, "--region", $AwsRegion) -AllowFailure
if ($createLogGroupResult.ExitCode -ne 0 -and -not ($createLogGroupResult.StdErr -match "ResourceAlreadyExistsException")) {
  throw "Failed creating log group '$LogGroup'. $($createLogGroupResult.StdErr)"
}
Invoke-Aws -CommandArgs @("logs", "put-retention-policy", "--log-group-name", $LogGroup, "--retention-in-days", "14", "--region", $AwsRegion) | Out-Null

$trustPolicyPath = Join-Path ([System.IO.Path]::GetTempPath()) ("ecs-trust-" + [Guid]::NewGuid().ToString("N") + ".json")
@'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
'@ | Set-Content -Path $trustPolicyPath -Encoding ascii

try {
  if ($CreateIamRoles -eq "true") {
    $TaskExecutionRoleArn = Ensure-IamRole -RoleName $TaskExecutionRoleName -TrustPolicyPath $trustPolicyPath
    $TaskRoleArn = Ensure-IamRole -RoleName $TaskRoleName -TrustPolicyPath $trustPolicyPath
    & aws iam attach-role-policy `
      --role-name $TaskExecutionRoleName `
      --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" > $null 2>&1
  }
  elseif (-not $TaskExecutionRoleArn -or -not $TaskRoleArn) {
    throw "Set TASK_EXECUTION_ROLE_ARN and TASK_ROLE_ARN when CREATE_IAM_ROLES=false."
  }
}
finally {
  if (Test-Path $trustPolicyPath) {
    Remove-Item -Path $trustPolicyPath -Force
  }
}

$AlbSgId = Ensure-SecurityGroup -GroupName $AlbSgName -Description "ALB security group for $AppName"
$TaskSgId = Ensure-SecurityGroup -GroupName $TaskSgName -Description "ECS task security group for $AppName"

& aws ec2 authorize-security-group-ingress `
  --group-id $AlbSgId `
  --ip-permissions "IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]" `
  --region $AwsRegion > $null 2>&1

& aws ec2 authorize-security-group-ingress `
  --group-id $TaskSgId `
  --ip-permissions "IpProtocol=tcp,FromPort=$ContainerPort,ToPort=$ContainerPort,UserIdGroupPairs=[{GroupId=$AlbSgId}]" `
  --region $AwsRegion > $null 2>&1

$AlbArn = Try-AwsText -CommandArgs @("elbv2", "describe-load-balancers", "--names", $AlbName, "--region", $AwsRegion, "--query", "LoadBalancers[0].LoadBalancerArn", "--output", "text")
if (-not $AlbArn) {
  Write-Host "Creating ALB: $AlbName"
  $AlbArn = & aws elbv2 create-load-balancer `
    --name $AlbName `
    --subnets $Subnet1 $Subnet2 `
    --security-groups $AlbSgId `
    --scheme internet-facing `
    --type application `
    --region $AwsRegion `
    --query "LoadBalancers[0].LoadBalancerArn" `
    --output text
}
else {
  Write-Host "Reusing ALB: $AlbName"
}
$AlbArn = $AlbArn.Trim()
$AlbDns = & aws elbv2 describe-load-balancers --load-balancer-arns $AlbArn --region $AwsRegion --query "LoadBalancers[0].DNSName" --output text

$TargetGroupArn = Try-AwsText -CommandArgs @("elbv2", "describe-target-groups", "--names", $TargetGroupName, "--region", $AwsRegion, "--query", "TargetGroups[0].TargetGroupArn", "--output", "text")
if (-not $TargetGroupArn) {
  Write-Host "Creating target group: $TargetGroupName"
  $TargetGroupArn = & aws elbv2 create-target-group `
    --name $TargetGroupName `
    --protocol HTTP `
    --port $ContainerPort `
    --vpc-id $VpcId `
    --target-type ip `
    --health-check-path "/" `
    --region $AwsRegion `
    --query "TargetGroups[0].TargetGroupArn" `
    --output text
}
else {
  Write-Host "Reusing target group: $TargetGroupName"
}
$TargetGroupArn = $TargetGroupArn.Trim()

$ListenerArn = Try-AwsText -CommandArgs @("elbv2", "describe-listeners", "--load-balancer-arn", $AlbArn, "--region", $AwsRegion, "--query", "Listeners[?Port==`80`].ListenerArn | [0]", "--output", "text")
if (-not $ListenerArn) {
  Write-Host "Creating ALB listener on port 80"
  & aws elbv2 create-listener `
    --load-balancer-arn $AlbArn `
    --protocol HTTP `
    --port 80 `
    --default-actions "Type=forward,TargetGroupArn=$TargetGroupArn" `
    --region $AwsRegion > $null
}
else {
  Write-Host "Reusing ALB listener on port 80"
}

$TaskDefPayload = @{
  family                   = $EcsTaskFamily
  networkMode              = "awsvpc"
  requiresCompatibilities  = @("FARGATE")
  cpu                      = "$TaskCpu"
  memory                   = "$TaskMemory"
  executionRoleArn         = $TaskExecutionRoleArn
  taskRoleArn              = $TaskRoleArn
  containerDefinitions     = @(
    @{
      name             = $EcsContainerName
      image            = "public.ecr.aws/nginx/nginx:stable-alpine"
      essential        = $true
      portMappings     = @(
        @{
          containerPort = $ContainerPort
          protocol      = "tcp"
        }
      )
      logConfiguration = @{
        logDriver = "awslogs"
        options   = @{
          "awslogs-group"         = $LogGroup
          "awslogs-region"        = $AwsRegion
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  )
}

$TaskDefFile = Join-Path ([System.IO.Path]::GetTempPath()) ("ecs-taskdef-" + [Guid]::NewGuid().ToString("N") + ".json")
try {
  $TaskDefPayload | ConvertTo-Json -Depth 20 | Set-Content -Path $TaskDefFile -Encoding ascii
  $TaskDefArn = & aws ecs register-task-definition --cli-input-json "file://$TaskDefFile" --region $AwsRegion --query "taskDefinition.taskDefinitionArn" --output text
}
finally {
  if (Test-Path $TaskDefFile) {
    Remove-Item -Path $TaskDefFile -Force
  }
}

$ServiceStatus = Try-AwsText -CommandArgs @("ecs", "describe-services", "--cluster", $EcsCluster, "--services", $EcsService, "--region", $AwsRegion, "--query", "services[0].status", "--output", "text")
$NetworkConfig = "awsvpcConfiguration={subnets=[$SubnetCsv],securityGroups=[$TaskSgId],assignPublicIp=ENABLED}"
$LoadBalancerConfig = "targetGroupArn=$TargetGroupArn,containerName=$EcsContainerName,containerPort=$ContainerPort"

if (-not $ServiceStatus -or $ServiceStatus -eq "INACTIVE") {
  Write-Host "Creating ECS service: $EcsService"
  & aws ecs create-service `
    --cluster $EcsCluster `
    --service-name $EcsService `
    --task-definition $TaskDefArn `
    --desired-count $DesiredCount `
    --launch-type FARGATE `
    --network-configuration $NetworkConfig `
    --load-balancers $LoadBalancerConfig `
    --region $AwsRegion > $null
}
else {
  Write-Host "Updating ECS service: $EcsService"
  & aws ecs update-service `
    --cluster $EcsCluster `
    --service $EcsService `
    --task-definition $TaskDefArn `
    --desired-count $DesiredCount `
    --region $AwsRegion > $null
}

if ($WaitForStability -eq "true") {
  Write-Host "Waiting for ECS service stability..."
  & aws ecs wait services-stable --cluster $EcsCluster --services $EcsService --region $AwsRegion
}

Write-Host ""
Write-Host "Bootstrap complete."
Write-Host ""
Write-Host "Use these Jenkins pipeline values:"
Write-Host "AWS_REGION=$AwsRegion"
Write-Host "ECR_REPOSITORY=$EcrRepository"
Write-Host "ECS_CLUSTER=$EcsCluster"
Write-Host "ECS_SERVICE=$EcsService"
Write-Host "ECS_TASK_FAMILY=$EcsTaskFamily"
Write-Host "ECS_CONTAINER_NAME=$EcsContainerName"
Write-Host ""
Write-Host "Frontend URL:"
Write-Host "http://$($AlbDns.Trim())"
Write-Host ""
Write-Host "Note:"
Write-Host "- The initial task uses a placeholder nginx image."
Write-Host "- Your next Jenkins deploy will update the service to your app image from ECR."
