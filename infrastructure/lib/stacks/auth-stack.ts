import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class AuthStack extends cdk.Stack {
  // Public properties to be used by other stacks
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create User Pool with standard configurations
    this.userPool = new cognito.UserPool(this, 'TodoAppUserPool', {
      userPoolName: `${this.stackName}-user-pool`,
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: {
        email: true, // Automatically verify email addresses
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true, // Allow users to update their email
        },
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // RETAIN for production to avoid accidental deletion
    });

    // Create User Pool Client (App Client)
    this.userPoolClient = new cognito.UserPoolClient(this, 'TodoAppUserPoolClient', {
      userPool: this.userPool,
      generateSecret: false, // Don't generate a client secret since this is for a browser app
      authFlows: {
        userPassword: true, // Enable username/password authentication
        userSrp: true, // Enable SRP (Secure Remote Password) authentication
      },
      preventUserExistenceErrors: true, // Prevent user enumeration attacks
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      oAuth: {
        callbackUrls: [
          'http://localhost:3000', // Local development
          'https://example.com', // Production URL - replace with actual domain
        ],
        logoutUrls: [
          'http://localhost:3000', // Local development
          'https://example.com', // Production URL - replace with actual domain
        ],
        flows: {
          authorizationCodeGrant: true, // Enable authorization code grant flow
          implicitCodeGrant: true, // Enable implicit code grant flow for SPA
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
    });

    // Create domain for hosted UI (optional)
    const domain = this.userPool.addDomain('TodoAppUserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `todo-app-${this.node.addr.substring(0, 8).toLowerCase()}`, // Generate unique prefix
      },
    });

    // Store User Pool ID and Client ID in SSM Parameter Store for reference by other services
    new cdk.aws_ssm.StringParameter(this, 'UserPoolIdParam', {
      parameterName: `/${this.stackName}/UserPoolId`,
      stringValue: this.userPool.userPoolId,
    });

    new cdk.aws_ssm.StringParameter(this, 'UserPoolClientIdParam', {
      parameterName: `/${this.stackName}/UserPoolClientId`,
      stringValue: this.userPoolClient.userPoolClientId,
    });

    new cdk.aws_ssm.StringParameter(this, 'UserPoolDomainParam', {
      parameterName: `/${this.stackName}/UserPoolDomain`,
      stringValue: domain.baseUrl(),
    });

    // Outputs for easier reference
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'The ID of the User Pool',
      exportName: `${this.stackName}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'The ID of the User Pool Client',
      exportName: `${this.stackName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: domain.baseUrl(),
      description: 'The base URL of the User Pool domain',
      exportName: `${this.stackName}-UserPoolDomain`,
    });
  }
}