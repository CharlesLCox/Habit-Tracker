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
5. `Deploy Frontend` (optional)

### Jenkins Job Type

- Create a **Pipeline** job (or Multibranch Pipeline)
- Set pipeline source to **Pipeline script from SCM**
- Point to this repo root so Jenkins can find `Jenkinsfile`

### Required Jenkins Plugins

- Pipeline
- Credentials Binding
- AWS Credentials plugin (`AmazonWebServicesCredentialsBinding`)

### Optional Deploy Parameters

The pipeline supports deployment when `DEPLOY=true` and `S3_BUCKET` is set:

- `DEPLOY` (bool): enable deployment stage
- `S3_BUCKET` (string): S3 bucket for static frontend hosting
- `AWS_REGION` (string): defaults to `us-east-2`
- `CLOUDFRONT_DIST_ID` (string): optional invalidation target
- `AWS_CREDENTIALS_ID` (string): Jenkins AWS credential id (default `aws-jenkins`)

### AWS Credentials in Jenkins

Create AWS credentials in Jenkins with id `aws-jenkins` (or update pipeline parameter):

- Type: AWS Credentials
- Permissions needed:
  - `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` on target bucket
  - `cloudfront:CreateInvalidation` (if using CloudFront invalidation)

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
