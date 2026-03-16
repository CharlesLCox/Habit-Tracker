#!/usr/bin/env bash
set -euo pipefail

S3_BUCKET="${S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-2}"
CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID:-}"
BUILD_DIR="${BUILD_DIR:-dist}"

if [[ -z "${S3_BUCKET}" ]]; then
  echo "Error: S3_BUCKET is required."
  exit 1
fi

if [[ ! -d "${BUILD_DIR}" ]]; then
  echo "Error: Build directory '${BUILD_DIR}' does not exist."
  exit 1
fi

echo "Syncing '${BUILD_DIR}' to s3://${S3_BUCKET} ..."
aws s3 sync "${BUILD_DIR}/" "s3://${S3_BUCKET}/" --delete --region "${AWS_REGION}"

if [[ -n "${CLOUDFRONT_DIST_ID}" ]]; then
  echo "Invalidating CloudFront distribution ${CLOUDFRONT_DIST_ID} ..."
  aws cloudfront create-invalidation \
    --distribution-id "${CLOUDFRONT_DIST_ID}" \
    --paths "/*" >/dev/null
fi

echo "Frontend deployment finished."
