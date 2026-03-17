#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-2}"
APP_NAME="${APP_NAME:-task-tracker}"
ECR_REPOSITORY="${ECR_REPOSITORY:-${APP_NAME}-frontend}"
ECS_CLUSTER="${ECS_CLUSTER:-${APP_NAME}-cluster}"
ECS_SERVICE="${ECS_SERVICE:-${APP_NAME}-service}"
ECS_TASK_FAMILY="${ECS_TASK_FAMILY:-${APP_NAME}-task}"
ECS_CONTAINER_NAME="${ECS_CONTAINER_NAME:-frontend}"
ALB_NAME="${ALB_NAME:-${APP_NAME}-alb}"
TARGET_GROUP_NAME="${TARGET_GROUP_NAME:-${APP_NAME}-tg}"
ALB_SG_NAME="${ALB_SG_NAME:-${APP_NAME}-alb-sg}"
TASK_SG_NAME="${TASK_SG_NAME:-${APP_NAME}-task-sg}"
TASK_CPU="${TASK_CPU:-256}"
TASK_MEMORY="${TASK_MEMORY:-512}"
CONTAINER_PORT="${CONTAINER_PORT:-80}"
DESIRED_COUNT="${DESIRED_COUNT:-1}"
WAIT_FOR_STABILITY="${WAIT_FOR_STABILITY:-true}"
CREATE_IAM_ROLES="${CREATE_IAM_ROLES:-true}"
TASK_EXECUTION_ROLE_NAME="${TASK_EXECUTION_ROLE_NAME:-${APP_NAME}-ecsTaskExecutionRole}"
TASK_ROLE_NAME="${TASK_ROLE_NAME:-${APP_NAME}-ecsTaskRole}"
TASK_EXECUTION_ROLE_ARN="${TASK_EXECUTION_ROLE_ARN:-}"
TASK_ROLE_ARN="${TASK_ROLE_ARN:-}"
VPC_ID="${VPC_ID:-}"
SUBNET_IDS="${SUBNET_IDS:-}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed."
    exit 1
  fi
}

clean_value() {
  local value="${1:-}"
  if [[ -z "${value}" || "${value}" == "None" || "${value}" == "MISSING" ]]; then
    echo ""
    return
  fi
  echo "${value}"
}

require_cmd aws

AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"

echo "Using account: ${AWS_ACCOUNT_ID}"
echo "Using region: ${AWS_REGION}"

if [[ -z "${VPC_ID}" ]]; then
  VPC_ID="$(clean_value "$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true --query 'Vpcs[0].VpcId' --output text)")"
fi
if [[ -z "${VPC_ID}" ]]; then
  VPC_ID="$(clean_value "$(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)")"
fi

if [[ -z "${VPC_ID}" ]]; then
  echo "Error: could not resolve VPC_ID. Set VPC_ID and rerun."
  exit 1
fi

if [[ -z "${SUBNET_IDS}" ]]; then
  SUBNET_IDS="$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[].SubnetId' --output text)"
fi

read -r -a subnet_array <<< "${SUBNET_IDS}"
if [[ "${#subnet_array[@]}" -lt 2 ]]; then
  echo "Error: need at least two subnets. Pass SUBNET_IDS=\"subnet-a subnet-b\"."
  exit 1
fi

SUBNET_1="${subnet_array[0]}"
SUBNET_2="${subnet_array[1]}"
SUBNET_CSV="${SUBNET_1},${SUBNET_2}"

echo "Using VPC: ${VPC_ID}"
echo "Using subnets: ${SUBNET_1}, ${SUBNET_2}"

if ! aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_REGION}" >/dev/null 2>&1; then
  echo "Creating ECR repository: ${ECR_REPOSITORY}"
  aws ecr create-repository --repository-name "${ECR_REPOSITORY}" --region "${AWS_REGION}" >/dev/null
else
  echo "Reusing ECR repository: ${ECR_REPOSITORY}"
fi

cluster_arn="$(clean_value "$(aws ecs describe-clusters --clusters "${ECS_CLUSTER}" --region "${AWS_REGION}" --query 'clusters[0].clusterArn' --output text)")"
if [[ -z "${cluster_arn}" ]]; then
  echo "Creating ECS cluster: ${ECS_CLUSTER}"
  aws ecs create-cluster --cluster-name "${ECS_CLUSTER}" --region "${AWS_REGION}" >/dev/null
else
  echo "Reusing ECS cluster: ${ECS_CLUSTER}"
fi

LOG_GROUP="/ecs/${ECS_TASK_FAMILY}"
aws logs create-log-group --log-group-name "${LOG_GROUP}" --region "${AWS_REGION}" >/dev/null 2>&1 || true
aws logs put-retention-policy --log-group-name "${LOG_GROUP}" --retention-in-days 14 --region "${AWS_REGION}" >/dev/null

trust_policy_file="$(mktemp)"
cat > "${trust_policy_file}" <<'JSON'
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
JSON

ensure_role() {
  local role_name="$1"
  local role_arn
  role_arn="$(clean_value "$(aws iam get-role --role-name "${role_name}" --query 'Role.Arn' --output text 2>/dev/null || true)")"
  if [[ -z "${role_arn}" ]]; then
    echo "Creating IAM role: ${role_name}" >&2
    aws iam create-role --role-name "${role_name}" --assume-role-policy-document "file://${trust_policy_file}" >/dev/null
    role_arn="$(aws iam get-role --role-name "${role_name}" --query 'Role.Arn' --output text)"
  else
    echo "Reusing IAM role: ${role_name}" >&2
  fi
  echo "${role_arn}"
}

if [[ "${CREATE_IAM_ROLES}" == "true" ]]; then
  TASK_EXECUTION_ROLE_ARN="$(ensure_role "${TASK_EXECUTION_ROLE_NAME}")"
  TASK_ROLE_ARN="$(ensure_role "${TASK_ROLE_NAME}")"
  aws iam attach-role-policy \
    --role-name "${TASK_EXECUTION_ROLE_NAME}" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy" >/dev/null 2>&1 || true
else
  if [[ -z "${TASK_EXECUTION_ROLE_ARN}" || -z "${TASK_ROLE_ARN}" ]]; then
    echo "Error: set TASK_EXECUTION_ROLE_ARN and TASK_ROLE_ARN when CREATE_IAM_ROLES=false."
    exit 1
  fi
fi

rm -f "${trust_policy_file}"

get_or_create_sg() {
  local sg_name="$1"
  local description="$2"
  local sg_id
  sg_id="$(clean_value "$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${sg_name}" "Name=vpc-id,Values=${VPC_ID}" \
    --query 'SecurityGroups[0].GroupId' --output text --region "${AWS_REGION}")")"
  if [[ -z "${sg_id}" ]]; then
    sg_id="$(aws ec2 create-security-group \
      --group-name "${sg_name}" \
      --description "${description}" \
      --vpc-id "${VPC_ID}" \
      --region "${AWS_REGION}" \
      --query 'GroupId' --output text)"
    echo "Created security group: ${sg_name} (${sg_id})" >&2
  else
    echo "Reusing security group: ${sg_name} (${sg_id})" >&2
  fi
  echo "${sg_id}"
}

ALB_SG_ID="$(get_or_create_sg "${ALB_SG_NAME}" "ALB security group for ${APP_NAME}")"
TASK_SG_ID="$(get_or_create_sg "${TASK_SG_NAME}" "ECS task security group for ${APP_NAME}")"

aws ec2 authorize-security-group-ingress \
  --group-id "${ALB_SG_ID}" \
  --ip-permissions "IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}]" \
  --region "${AWS_REGION}" >/dev/null 2>&1 || true

aws ec2 authorize-security-group-ingress \
  --group-id "${TASK_SG_ID}" \
  --ip-permissions "IpProtocol=tcp,FromPort=${CONTAINER_PORT},ToPort=${CONTAINER_PORT},UserIdGroupPairs=[{GroupId=${ALB_SG_ID}}]" \
  --region "${AWS_REGION}" >/dev/null 2>&1 || true

ALB_ARN="$(clean_value "$(aws elbv2 describe-load-balancers --names "${ALB_NAME}" --region "${AWS_REGION}" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || true)")"
if [[ -z "${ALB_ARN}" ]]; then
  echo "Creating ALB: ${ALB_NAME}"
  ALB_ARN="$(aws elbv2 create-load-balancer \
    --name "${ALB_NAME}" \
    --subnets "${SUBNET_1}" "${SUBNET_2}" \
    --security-groups "${ALB_SG_ID}" \
    --scheme internet-facing \
    --type application \
    --region "${AWS_REGION}" \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)"
else
  echo "Reusing ALB: ${ALB_NAME}"
fi

ALB_DNS="$(aws elbv2 describe-load-balancers --load-balancer-arns "${ALB_ARN}" --region "${AWS_REGION}" --query 'LoadBalancers[0].DNSName' --output text)"

TG_ARN="$(clean_value "$(aws elbv2 describe-target-groups --names "${TARGET_GROUP_NAME}" --region "${AWS_REGION}" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || true)")"
if [[ -z "${TG_ARN}" ]]; then
  echo "Creating target group: ${TARGET_GROUP_NAME}"
  TG_ARN="$(aws elbv2 create-target-group \
    --name "${TARGET_GROUP_NAME}" \
    --protocol HTTP \
    --port "${CONTAINER_PORT}" \
    --vpc-id "${VPC_ID}" \
    --target-type ip \
    --health-check-path "/" \
    --region "${AWS_REGION}" \
    --query 'TargetGroups[0].TargetGroupArn' --output text)"
else
  echo "Reusing target group: ${TARGET_GROUP_NAME}"
fi

LISTENER_ARN="$(clean_value "$(aws elbv2 describe-listeners --load-balancer-arn "${ALB_ARN}" --region "${AWS_REGION}" --query 'Listeners[?Port==`80`].ListenerArn | [0]' --output text)")"
if [[ -z "${LISTENER_ARN}" ]]; then
  echo "Creating ALB listener on port 80"
  aws elbv2 create-listener \
    --load-balancer-arn "${ALB_ARN}" \
    --protocol HTTP \
    --port 80 \
    --default-actions "Type=forward,TargetGroupArn=${TG_ARN}" \
    --region "${AWS_REGION}" >/dev/null
else
  echo "Reusing ALB listener on port 80"
fi

task_def_file="$(mktemp)"
cat > "${task_def_file}" <<JSON
{
  "family": "${ECS_TASK_FAMILY}",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "${TASK_CPU}",
  "memory": "${TASK_MEMORY}",
  "executionRoleArn": "${TASK_EXECUTION_ROLE_ARN}",
  "taskRoleArn": "${TASK_ROLE_ARN}",
  "containerDefinitions": [
    {
      "name": "${ECS_CONTAINER_NAME}",
      "image": "public.ecr.aws/nginx/nginx:stable-alpine",
      "essential": true,
      "portMappings": [
        {
          "containerPort": ${CONTAINER_PORT},
          "protocol": "tcp"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "${LOG_GROUP}",
          "awslogs-region": "${AWS_REGION}",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
JSON

TASK_DEF_ARN="$(aws ecs register-task-definition --cli-input-json "file://${task_def_file}" --region "${AWS_REGION}" --query 'taskDefinition.taskDefinitionArn' --output text)"
rm -f "${task_def_file}"

SERVICE_STATUS="$(clean_value "$(aws ecs describe-services --cluster "${ECS_CLUSTER}" --services "${ECS_SERVICE}" --region "${AWS_REGION}" --query 'services[0].status' --output text 2>/dev/null || true)")"
NETWORK_CONFIG="awsvpcConfiguration={subnets=[${SUBNET_CSV}],securityGroups=[${TASK_SG_ID}],assignPublicIp=ENABLED}"
LB_CONFIG="targetGroupArn=${TG_ARN},containerName=${ECS_CONTAINER_NAME},containerPort=${CONTAINER_PORT}"

if [[ -z "${SERVICE_STATUS}" || "${SERVICE_STATUS}" == "INACTIVE" ]]; then
  echo "Creating ECS service: ${ECS_SERVICE}"
  aws ecs create-service \
    --cluster "${ECS_CLUSTER}" \
    --service-name "${ECS_SERVICE}" \
    --task-definition "${TASK_DEF_ARN}" \
    --desired-count "${DESIRED_COUNT}" \
    --launch-type FARGATE \
    --network-configuration "${NETWORK_CONFIG}" \
    --load-balancers "${LB_CONFIG}" \
    --region "${AWS_REGION}" >/dev/null
else
  echo "Updating ECS service: ${ECS_SERVICE}"
  aws ecs update-service \
    --cluster "${ECS_CLUSTER}" \
    --service "${ECS_SERVICE}" \
    --task-definition "${TASK_DEF_ARN}" \
    --desired-count "${DESIRED_COUNT}" \
    --region "${AWS_REGION}" >/dev/null
fi

if [[ "${WAIT_FOR_STABILITY}" == "true" ]]; then
  echo "Waiting for ECS service stability..."
  aws ecs wait services-stable --cluster "${ECS_CLUSTER}" --services "${ECS_SERVICE}" --region "${AWS_REGION}"
fi

cat <<EOF

Bootstrap complete.

Use these Jenkins pipeline values:
AWS_REGION=${AWS_REGION}
ECR_REPOSITORY=${ECR_REPOSITORY}
ECS_CLUSTER=${ECS_CLUSTER}
ECS_SERVICE=${ECS_SERVICE}
ECS_TASK_FAMILY=${ECS_TASK_FAMILY}
ECS_CONTAINER_NAME=${ECS_CONTAINER_NAME}

Frontend URL:
http://${ALB_DNS}

Note:
- The initial task uses a placeholder nginx image.
- Your next Jenkins deploy will update the service to your app image from ECR.
EOF
