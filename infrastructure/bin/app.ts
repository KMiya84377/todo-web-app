#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { AuthStack } from '../lib/stacks/auth-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { getConfig } from '../lib/utils/config';

// Load environment variables from .env file
dotenv.config();

const app = new cdk.App();

// Determine environment from .env or default to 'dev'
const envName = process.env.ENVIRONMENT || 'dev';
const config = getConfig(app, envName);

// Create and tag all stacks
const storageStack = new StorageStack(app, `${config.appName}-StorageStack`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region },
  stackName: `${config.appName}-storage`,
  description: 'DynamoDB tables for Todo application',
  tags: {
    Environment: config.environmentName,
    Project: 'Todo Web Application',
    ManagedBy: 'CDK'
  }
});

const authStack = new AuthStack(app, `${config.appName}-AuthStack`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region },
  stackName: `${config.appName}-auth`,
  description: 'Authentication resources for Todo application',
  tags: {
    Environment: config.environmentName,
    Project: 'Todo Web Application',
    ManagedBy: 'CDK'
  }
});

const apiStack = new ApiStack(app, `${config.appName}-ApiStack`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region },
  stackName: `${config.appName}-api`,
  description: 'API resources for Todo application',
  tags: {
    Environment: config.environmentName,
    Project: 'Todo Web Application',
    ManagedBy: 'CDK'
  },
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  usersTable: storageStack.usersTable,
  todosTable: storageStack.todosTable,
});

const frontendStack = new FrontendStack(app, `${config.appName}-FrontendStack`, {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region },
  stackName: `${config.appName}-frontend`,
  description: 'Frontend hosting resources for Todo application',
  tags: {
    Environment: config.environmentName,
    Project: 'Todo Web Application',
    ManagedBy: 'CDK'
  },
  apiEndpoint: apiStack.apiEndpoint,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
});