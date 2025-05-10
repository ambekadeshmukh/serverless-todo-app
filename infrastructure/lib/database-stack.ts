// infrastructure/lib/database-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseStack extends cdk.Stack {
  public readonly tasksTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for tasks
    this.tasksTable = new dynamodb.Table(this, 'TasksTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - use RETAIN for production
      pointInTimeRecovery: true, // Enable point-in-time recovery
    });

    // Create secondary indexes if needed
    // For example, to search by user ID if your app expands to multi-user
    // this.tasksTable.addGlobalSecondaryIndex({
    //   indexName: 'userIdIndex',
    //   partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    //   sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    // });

    // Output the table name for reference
    new cdk.CfnOutput(this, 'TasksTableName', {
      value: this.tasksTable.tableName,
      description: 'The name of the tasks DynamoDB table',
      exportName: 'TasksTableName',
    });

    // Output the table ARN for reference
    new cdk.CfnOutput(this, 'TasksTableArn', {
      value: this.tasksTable.tableArn,
      description: 'The ARN of the tasks DynamoDB table',
      exportName: 'TasksTableArn',
    });
  }
}