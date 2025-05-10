// infrastructure/lib/backend-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

interface BackendStackProps extends cdk.StackProps {
  tasksTable: dynamodb.Table;
}

export class BackendStack extends cdk.Stack {
  public readonly apiEndpoint: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // Common environment variables for Lambda functions
    const lambdaEnv = {
      TASKS_TABLE: props.tasksTable.tableName,
    };

    // Common Lambda configuration for all functions
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_16_X,
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    };

    // Create Lambda functions
    const getTasksFunction = new lambda.Function(this, 'GetTasksFunction', {
      ...commonLambdaProps,
      handler: 'getTasks.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
    });

    const createTaskFunction = new lambda.Function(this, 'CreateTaskFunction', {
      ...commonLambdaProps,
      handler: 'createTask.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
    });

    const updateTaskFunction = new lambda.Function(this, 'UpdateTaskFunction', {
      ...commonLambdaProps,
      handler: 'updateTask.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
    });

    const deleteTaskFunction = new lambda.Function(this, 'DeleteTaskFunction', {
      ...commonLambdaProps,
      handler: 'deleteTask.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/functions')),
    });

    // Grant Lambda functions permissions to DynamoDB
    props.tasksTable.grantReadData(getTasksFunction);
    props.tasksTable.grantWriteData(createTaskFunction);
    props.tasksTable.grantReadWriteData(updateTaskFunction);
    props.tasksTable.grantReadWriteData(deleteTaskFunction);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo Service API',
      description: 'API for managing todo tasks',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: 'prod',
        // Add logging, metrics, and other deployment options here
      },
    });

    // Create API resources and methods
    const tasksResource = api.root.addResource('tasks');

    // GET /tasks - Get all tasks
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(getTasksFunction));

    // POST /tasks - Create a new task
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(createTaskFunction));

    // Create task/{id} resource
    const taskResource = tasksResource.addResource('{id}');

    // PUT /tasks/{id} - Update a task
    taskResource.addMethod('PUT', new apigateway.LambdaIntegration(updateTaskFunction));

    // DELETE /tasks/{id} - Delete a task
    taskResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskFunction));

    // Store the API endpoint for output and use in the frontend
    this.apiEndpoint = api.url;

    // Output the API Gateway endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'The URL of the API Gateway endpoint',
      exportName: 'ApiGatewayEndpoint',
    });
  }
}