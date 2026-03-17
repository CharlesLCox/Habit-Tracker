# Task Tracker

## Run Locally

```bash
npm ci
npm run dev
```

## Build Frontend

```bash
npm run build
```

Build output goes to `dist/`.

## Jenkins CI/CD Setup

This repo includes a root `Jenkinsfile` with these stages:

1. `Install` (`npm ci`)
2. `Lint` (`npm run lint`)
3. `Build` (`npm run build`)
4. `Archive Build` (`dist/**`)
5. `Deploy Frontend` (optional, S3/CloudFront)
6. `Deploy to ECS` (optional, ECR + ECS rolling deployment)

### Jenkins Job Type

- Create a **Pipeline** job (or Multibranch Pipeline)
- Set pipeline source to **Pipeline script from SCM**
- Point to this repo root so Jenkins can find `Jenkinsfile`

### New ECS Pipeline Job (Recommended)

If you want a dedicated ECS pipeline, use:

- Script Path: `jenkins/Jenkinsfile.ecs`
- Job type: **Pipeline** (or **Multibranch Pipeline**)
- SCM: this repository

Run with these minimum parameters:

- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_TASK_FAMILY`

Optional parameters:

- `AWS_REGION` (default `us-east-2`)
- `AWS_ACCOUNT_ID` (auto-detected if blank)
- `ECS_CONTAINER_NAME` (required for multi-container task definitions)
- `IMAGE_TAG` (defaults to Jenkins build number)
- `WAIT_FOR_STABILITY` (default `true`)
- `RUN_FRONTEND_LINT` (default `false`)
- `ENABLE_GITHUB_STATUS` (default `true`)
- `GITHUB_STATUS_CONTEXT` (default `ci/jenkins/ecs`)

### Required Jenkins Plugins

- Pipeline
- Credentials Binding
- AWS Credentials plugin (`AmazonWebServicesCredentialsBinding`)
- GitHub plugin (for `githubNotify` status updates)

### GitHub Real-Time Build Status

The dedicated ECS pipeline (`jenkins/Jenkinsfile.ecs`) can publish commit/PR status updates:

- `PENDING` when build starts
- `SUCCESS` when build passes
- `FAILURE` when build fails

To enable this in Jenkins/GitHub:

1. Install Jenkins `GitHub` plugin.
2. Configure Jenkins GitHub connection/credentials.
3. Use a Multibranch Pipeline or Pipeline from SCM pointing to this repo.
4. Set `ENABLE_GITHUB_STATUS=true` (default).
5. Optionally customize `GITHUB_STATUS_CONTEXT` (for example `ci/jenkins/ecs`).

### Optional S3 Deploy Parameters

The pipeline supports deployment when `DEPLOY=true` and `S3_BUCKET` is set:

- `DEPLOY` (bool): enable deployment stage
- `S3_BUCKET` (string): S3 bucket for static frontend hosting
- `AWS_REGION` (string): defaults to `us-east-2`
- `CLOUDFRONT_DIST_ID` (string): optional invalidation target
- `AWS_CREDENTIALS_ID` (string): Jenkins AWS credential id (default `aws-jenkins`)

### Optional ECS Deploy Parameters

The pipeline supports ECS deployment when `DEPLOY_ECS=true` and required ECS values are set:

- `DEPLOY_ECS` (bool): enable ECS deployment stage
- `AWS_REGION` (string): defaults to `us-east-2`
- `AWS_ACCOUNT_ID` (string): optional account id (auto-detected when blank)
- `ECR_REPOSITORY` (string): ECR repo name
- `ECS_CLUSTER` (string): ECS cluster name
- `ECS_SERVICE` (string): ECS service name
- `ECS_TASK_FAMILY` (string): task definition family currently used by the service
- `ECS_CONTAINER_NAME` (string): optional; required if task definition has multiple containers
- `IMAGE_TAG` (string): optional image tag (defaults to Jenkins `BUILD_NUMBER`)
- `WAIT_FOR_STABILITY` (bool): wait for ECS steady state before finishing build
- `AWS_CREDENTIALS_ID` (string): Jenkins AWS credential id (default `aws-jenkins`)

### AWS Credentials in Jenkins

Create AWS credentials in Jenkins with id `aws-jenkins` (or update pipeline parameter):

- Type: AWS Credentials
- Permissions needed:
  - `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` on target bucket
  - `cloudfront:CreateInvalidation` (if using CloudFront invalidation)
  - `ecr:GetAuthorizationToken`, `ecr:BatchCheckLayerAvailability`, `ecr:CompleteLayerUpload`, `ecr:InitiateLayerUpload`, `ecr:PutImage`, `ecr:UploadLayerPart`
  - `ecs:DescribeTaskDefinition`, `ecs:RegisterTaskDefinition`, `ecs:UpdateService`, `ecs:DescribeServices`
  - `iam:PassRole` for roles attached to your ECS task definition
  - `sts:GetCallerIdentity` (only needed when `AWS_ACCOUNT_ID` parameter is blank)

## Container Files (for ECS)

- `Dockerfile`: multi-stage build (Node + Nginx), serves Vite `dist/`
- `nginx/default.conf`: SPA fallback (`/index.html`) so React routes work on refresh
- `.dockerignore`: keeps image build context lean

## Manual ECS Deploy Script

Linux/macOS agent:

```bash
AWS_REGION=us-east-2 \
ECR_REPOSITORY=task-tracker-frontend \
ECS_CLUSTER=my-cluster \
ECS_SERVICE=my-frontend-service \
ECS_TASK_FAMILY=my-frontend-task \
IMAGE_TAG=manual-001 \
./scripts/deploy-ecs.sh
```

Windows agent:

```powershell
$env:AWS_REGION="us-east-2"
$env:ECR_REPOSITORY="task-tracker-frontend"
$env:ECS_CLUSTER="my-cluster"
$env:ECS_SERVICE="my-frontend-service"
$env:ECS_TASK_FAMILY="my-frontend-task"
$env:IMAGE_TAG="manual-001"
.\scripts\deploy-ecs.ps1
```

## First-Time AWS ECS Setup (One-Time)

Use the bootstrap script to create:

- ECR repository
- ECS cluster
- IAM roles for ECS task execution
- Security groups
- Application Load Balancer + target group + listener
- ECS task definition + ECS service

Linux/macOS:

```bash
AWS_REGION=us-east-2 APP_NAME=task-tracker ./scripts/bootstrap-ecs.sh
```

Windows PowerShell:

```powershell
$env:AWS_REGION="us-east-2"
$env:APP_NAME="task-tracker"
.\scripts\bootstrap-ecs.ps1
```

Optional overrides:

- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_TASK_FAMILY`
- `ECS_CONTAINER_NAME`
- `VPC_ID` and `SUBNET_IDS` (`"subnet-a subnet-b"`) if you do not want default VPC/subnets

After it finishes, copy printed values into Jenkins parameters.
Run Jenkins with `DEPLOY_ECS=true` (for root `Jenkinsfile`) or use `jenkins/Jenkinsfile.ecs`.

On each deploy, Jenkins will:

1. Build/push a new Docker image to ECR.
2. Read the current ECS task definition.
3. Replace only the frontend container image.
4. Register a new task definition revision.
5. Update ECS service to the new revision and optionally wait for stability.

## Manual Frontend Deploy Script

Linux/macOS agent:

```bash
S3_BUCKET=my-frontend-bucket AWS_REGION=us-east-2 ./scripts/deploy-frontend.sh
```

Windows agent:

```powershell
$env:S3_BUCKET="my-frontend-bucket"
$env:AWS_REGION="us-east-2"
./scripts/deploy-frontend.ps1
```
