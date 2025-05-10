
!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Get environment from context or use default
const env = { 
  account: app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT, 
  region: app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Add tags to all resources
const tags = {
  Project: 'ServerlessTodoApp',
  Environment: app.node.tryGetContext('environment') || 'dev',
  Owner: 'YourName',
};

// Create the stacks
const databaseStack = new DatabaseStack(app, 'TodoDatabaseStack', { env, tags });

const backendStack = new BackendStack(app, 'TodoBackendStack', {
  env,
  tags,
  tasksTable: databaseStack.tasksTable,
});

const frontendStack = new FrontendStack(app, 'TodoFrontendStack', {
  env,
  tags,
  apiEndpoint: backendStack.apiEndpoint,
});

// Add dependencies
backendStack.addDependency(databaseStack);
frontendStack.addDependency(backendStack);