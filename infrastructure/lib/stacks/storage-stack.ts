import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

export class StorageStack extends cdk.Stack {
  // Public properties to be used by other stacks
  public readonly usersTable: dynamodb.Table;
  public readonly todosTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users Table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: `${this.stackName}-users`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // RETAIN for production data
      pointInTimeRecovery: true, // Enable point-in-time recovery for data protection
    });

    // Users Table stream for synchronization if needed
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Todos Table
    this.todosTable = new dynamodb.Table(this, 'TodosTable', {
      tableName: `${this.stackName}-todos`,
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'todoId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, 
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // GSI for todos by status - to efficiently query todos by status for a user
    this.todosTable.addGlobalSecondaryIndex({
      indexName: 'UserStatusIndex',
      partitionKey: {
        name: 'userId', 
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for todos by due date - to efficiently query todos by due date for a user
    this.todosTable.addGlobalSecondaryIndex({
      indexName: 'UserDueDateIndex',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'dueDate',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Create SSM parameters to share table names across stacks and environments
    new cdk.aws_ssm.StringParameter(this, 'UsersTableNameParam', {
      parameterName: `/${this.stackName}/UsersTableName`,
      stringValue: this.usersTable.tableName,
    });

    new cdk.aws_ssm.StringParameter(this, 'TodosTableNameParam', {
      parameterName: `/${this.stackName}/TodosTableName`,
      stringValue: this.todosTable.tableName,
    });

    // Output the table names and ARNs for reference
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'The name of the users table',
      exportName: `${this.stackName}-UsersTableName`,
    });

    new cdk.CfnOutput(this, 'TodosTableName', {
      value: this.todosTable.tableName,
      description: 'The name of the todos table',
      exportName: `${this.stackName}-TodosTableName`,
    });

    new cdk.CfnOutput(this, 'UsersTableArn', {
      value: this.usersTable.tableArn,
      description: 'The ARN of the users table',
      exportName: `${this.stackName}-UsersTableArn`,
    });

    new cdk.CfnOutput(this, 'TodosTableArn', {
      value: this.todosTable.tableArn,
      description: 'The ARN of the todos table',
      exportName: `${this.stackName}-TodosTableArn`,
    });
  }
}