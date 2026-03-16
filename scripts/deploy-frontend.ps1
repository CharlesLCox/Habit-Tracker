$ErrorActionPreference = "Stop"

$S3Bucket = $env:S3_BUCKET
$AwsRegion = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-2" }
$CloudFrontDistributionId = $env:CLOUDFRONT_DIST_ID
$BuildDir = if ($env:BUILD_DIR) { $env:BUILD_DIR } else { "dist" }

if ([string]::IsNullOrWhiteSpace($S3Bucket)) {
  throw "S3_BUCKET is required."
}

if (-not (Test-Path $BuildDir)) {
  throw "Build directory '$BuildDir' does not exist."
}

Write-Host "Syncing '$BuildDir' to s3://$S3Bucket ..."
aws s3 sync "$BuildDir/" "s3://$S3Bucket/" --delete --region $AwsRegion

if (-not [string]::IsNullOrWhiteSpace($CloudFrontDistributionId)) {
  Write-Host "Invalidating CloudFront distribution $CloudFrontDistributionId ..."
  aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*" | Out-Null
}

Write-Host "Frontend deployment finished."
