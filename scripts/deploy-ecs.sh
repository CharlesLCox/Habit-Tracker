#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-2}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
ECR_REPOSITORY="${ECR_REPOSITORY:-}"
ECS_CLUSTER="${ECS_CLUSTER:-}"
ECS_SERVICE="${ECS_SERVICE:-}"
ECS_TASK_FAMILY="${ECS_TASK_FAMILY:-}"
ECS_CONTAINER_NAME="${ECS_CONTAINER_NAME:-}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
WAIT_FOR_STABILITY="${WAIT_FOR_STABILITY:-true}"

require_var() {
  local var_name="$1"
  local value="$2"
  if [[ -z "${value}" ]]; then
    echo "Error: ${var_name} is required."
    exit 1
  fi
}

require_var "ECR_REPOSITORY" "${ECR_REPOSITORY}"
require_var "ECS_CLUSTER" "${ECS_CLUSTER}"
require_var "ECS_SERVICE" "${ECS_SERVICE}"
require_var "ECS_TASK_FAMILY" "${ECS_TASK_FAMILY}"

if [[ -z "${AWS_ACCOUNT_ID}" ]]; then
  AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
fi

ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "Logging in to ECR: ${ECR_REGISTRY}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "Building Docker image: ${IMAGE_URI}"
docker build -t "${IMAGE_URI}" .

echo "Pushing Docker image: ${IMAGE_URI}"
docker push "${IMAGE_URI}"

tmp_dir="$(mktemp -d)"
current_task_def="${tmp_dir}/current-task-def.json"
new_task_def="${tmp_dir}/new-task-def.json"
trap 'rm -rf "${tmp_dir}"' EXIT

echo "Reading current task definition: ${ECS_TASK_FAMILY}"
aws ecs describe-task-definition --task-definition "${ECS_TASK_FAMILY}" --output json > "${current_task_def}"

render_args=(
  --input "${current_task_def}"
  --output "${new_task_def}"
  --image-uri "${IMAGE_URI}"
)

if [[ -n "${ECS_CONTAINER_NAME}" ]]; then
  render_args+=(--container-name "${ECS_CONTAINER_NAME}")
fi

node scripts/render-ecs-task-def.mjs "${render_args[@]}"

echo "Registering updated task definition"
new_task_def_arn="$(aws ecs register-task-definition --cli-input-json "file://${new_task_def}" --query 'taskDefinition.taskDefinitionArn' --output text)"

echo "Updating ECS service: ${ECS_SERVICE}"
aws ecs update-service \
  --cluster "${ECS_CLUSTER}" \
  --service "${ECS_SERVICE}" \
  --task-definition "${new_task_def_arn}" >/dev/null

if [[ "${WAIT_FOR_STABILITY}" == "true" ]]; then
  echo "Waiting for service stability"
  aws ecs wait services-stable --cluster "${ECS_CLUSTER}" --services "${ECS_SERVICE}"
fi

echo "ECS deployment finished. Service now uses: ${new_task_def_arn}"
