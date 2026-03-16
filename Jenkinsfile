pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    booleanParam(
      name: 'DEPLOY',
      defaultValue: false,
      description: 'Deploy the built frontend to S3 after build'
    )
    string(
      name: 'AWS_REGION',
      defaultValue: 'us-east-2',
      description: 'AWS region for S3 deployment'
    )
    string(
      name: 'S3_BUCKET',
      defaultValue: '',
      description: 'Target S3 bucket name (no s3:// prefix)'
    )
    string(
      name: 'CLOUDFRONT_DIST_ID',
      defaultValue: '',
      description: 'Optional CloudFront distribution ID to invalidate'
    )
    string(
      name: 'AWS_CREDENTIALS_ID',
      defaultValue: 'aws-jenkins',
      description: 'Jenkins credential ID for AWS'
    )
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Install') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm ci'
          } else {
            bat 'npm ci'
          }
        }
      }
    }

    stage('Lint') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run lint'
          } else {
            bat 'npm run lint'
          }
        }
      }
    }

    stage('Build') {
      steps {
        script {
          if (isUnix()) {
            sh 'npm run build'
          } else {
            bat 'npm run build'
          }
        }
      }
    }

    stage('Archive Build') {
      steps {
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }

    stage('Deploy Frontend') {
      when {
        expression { return params.DEPLOY && params.S3_BUCKET?.trim() }
      }
      steps {
        withCredentials([[
          $class: 'AmazonWebServicesCredentialsBinding',
          credentialsId: params.AWS_CREDENTIALS_ID
        ]]) {
          script {
            if (isUnix()) {
              sh '''
                chmod +x scripts/deploy-frontend.sh
                S3_BUCKET="${S3_BUCKET}" AWS_REGION="${AWS_REGION}" CLOUDFRONT_DIST_ID="${CLOUDFRONT_DIST_ID}" scripts/deploy-frontend.sh
              '''
            } else {
              powershell '.\\scripts\\deploy-frontend.ps1'
            }
          }
        }
      }
    }
  }
}
