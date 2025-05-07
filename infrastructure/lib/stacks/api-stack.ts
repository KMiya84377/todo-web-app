import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  usersTable: dynamodb.Table;
  todosTable: dynamodb.Table;
}

export class ApiStack extends cdk.Stack {
  // Public property to export the API endpoint for frontend integration
  public readonly apiEndpoint: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create Lambda execution role with permissions for CloudWatch logs
    const lambdaExecutionRole = new iam.Role(this, 'TodoAppLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant permissions to read/write to DynamoDB tables
    props.usersTable.grantReadWriteData(lambdaExecutionRole);
    props.todosTable.grantReadWriteData(lambdaExecutionRole);

    // Define common environment variables for Lambda functions
    const commonEnvVars = {
      USERS_TABLE_NAME: props.usersTable.tableName,
      TODOS_TABLE_NAME: props.todosTable.tableName,
      USER_POOL_ID: props.userPool.userPoolId,
      USER_POOL_CLIENT_ID: props.userPoolClient.userPoolClientId,
      REGION: this.region,
    };

    // Define common Lambda function props
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: commonEnvVars,
      role: lambdaExecutionRole,
    };

    // Create REST API
    const api = new apigateway.RestApi(this, 'TodoAppApi', {
      restApiName: `${this.stackName}-api`,
      description: 'API for Todo application',
      deployOptions: {
        stageName: 'api', // Use 'api' instead of 'prod' to support multiple environments
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // For development; restrict in production
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Create authorizer using Cognito User Pool
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'TodoAppAuthorizer', {
      cognitoUserPools: [props.userPool],
      identitySource: 'method.request.header.Authorization',
    });

    // Common auth settings for protected resources
    const authSettings = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Create Lambda functions for different API operations
    
    // --- User Management Functions ---

    // Get User Profile
    const getUserProfileLambda = new lambda.Function(this, 'GetUserProfileHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-getUserProfile`,
      handler: 'handlers/user/get-profile.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Get user profile information',
    });

    // Update User Profile
    const updateUserProfileLambda = new lambda.Function(this, 'UpdateUserProfileHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-updateUserProfile`,
      handler: 'handlers/user/update-profile.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Update user profile information',
    });

    // --- Todo Management Functions ---

    // Get All Todos
    const getAllTodosLambda = new lambda.Function(this, 'GetAllTodosHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-getAllTodos`,
      handler: 'handlers/todos/get-all.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Get all todos for a user',
    });

    // Get Todo by ID
    const getTodoLambda = new lambda.Function(this, 'GetTodoHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-getTodo`,
      handler: 'handlers/todos/get-todo.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Get a specific todo by ID',
    });

    // Create Todo
    const createTodoLambda = new lambda.Function(this, 'CreateTodoHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-createTodo`,
      handler: 'handlers/todos/create.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Create a new todo item',
    });

    // Update Todo
    const updateTodoLambda = new lambda.Function(this, 'UpdateTodoHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-updateTodo`,
      handler: 'handlers/todos/update.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Update an existing todo item',
    });

    // Delete Todo
    const deleteTodoLambda = new lambda.Function(this, 'DeleteTodoHandler', {
      ...commonLambdaProps,
      functionName: `${this.stackName}-deleteTodo`,
      handler: 'handlers/todos/delete.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend/dist')),
      description: 'Delete a todo item',
    });

    // --- API Resources and Methods ---

    // User resource
    const userResource = api.root.addResource('user');
    
    // User Profile resource
    const profileResource = userResource.addResource('profile');
    profileResource.addMethod('GET', new apigateway.LambdaIntegration(getUserProfileLambda), authSettings);
    profileResource.addMethod('PUT', new apigateway.LambdaIntegration(updateUserProfileLambda), authSettings);

    // Todos resource
    const todosResource = api.root.addResource('todos');
    
    // Get all todos
    todosResource.addMethod('GET', new apigateway.LambdaIntegration(getAllTodosLambda), authSettings);
    
    // Create todo
    todosResource.addMethod('POST', new apigateway.LambdaIntegration(createTodoLambda), authSettings);
    
    // Todo item resource (with ID)
    const todoResource = todosResource.addResource('{todoId}');
    
    // Get specific todo
    todoResource.addMethod('GET', new apigateway.LambdaIntegration(getTodoLambda), authSettings);
    
    // Update todo
    todoResource.addMethod('PUT', new apigateway.LambdaIntegration(updateTodoLambda), authSettings);
    
    // Delete todo
    todoResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodoLambda), authSettings);

    // Store API endpoint URL in SSM Parameter Store
    new cdk.aws_ssm.StringParameter(this, 'ApiUrlParam', {
      parameterName: `/${this.stackName}/ApiUrl`,
      stringValue: api.url,
    });

    // Export API endpoint for use in the frontend
    this.apiEndpoint = api.url;

    // CloudFormation outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: `${this.stackName}-ApiEndpoint`,
    });
  }
}