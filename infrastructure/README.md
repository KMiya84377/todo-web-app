# Infrastructure for TODO Web Application

This directory contains AWS CDK code for deploying the serverless infrastructure of the TODO Web Application.

## Prerequisites

- [Node.js](https://nodejs.org/) v20.x or later
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK](https://aws.amazon.com/cdk/) v2.x

## Directory Structure

```
infrastructure/
├── bin/                     # CDK app entry point
├── lib/                     # Main code directory
│   ├── constructs/          # Reusable constructs
│   ├── stacks/              # CDK stacks
│   └── utils/               # Utility functions
├── test/                    # Test code
├── cdk.json                 # CDK configuration
├── package.json             # Node.js package configuration
└── tsconfig.json            # TypeScript configuration
```

## Deployment Instructions

1. Install dependencies:
   ```
   cd infrastructure
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the infrastructure directory with the following variables:
     ```
     ENVIRONMENT=dev  # or 'prod' for production
     ```

3. Deploy the stacks:
   ```
   npx cdk deploy --all
   ```
   Or deploy specific stacks:
   ```
   npx cdk deploy AuthStack ApiStack StorageStack FrontendStack
   ```

4. To destroy the deployed resources:
   ```
   npx cdk destroy --all
   ```

## Stack Description

The infrastructure is divided into the following stacks:

1. **AuthStack**: Authentication resources including Amazon Cognito User Pool and Client
2. **ApiStack**: API Gateway, Lambda functions, and IAM roles for backend API
3. **StorageStack**: DynamoDB tables for Users and Todos data
4. **FrontendStack**: S3 bucket and CloudFront distribution for hosting the frontend application

## Environment Variables and Secrets Management

- The application uses AWS Secrets Manager for sensitive information
- Environment variables are passed to Lambda functions through CDK deployment
- Stage-specific configurations are managed through context variables in the CDK app

## Testing

Run tests with:
```
npm test
```