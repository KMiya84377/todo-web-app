import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface FrontendStackProps extends cdk.StackProps {
  apiEndpoint: string;
  userPoolId: string;
  userPoolClientId: string;
}

export class FrontendStack extends cdk.Stack {
  public readonly distributionUrl: string;
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    // Create a bucket to store the static website content
    const websiteBucket = new s3.Bucket(this, 'XXXXXXXXXXXXX', {
      bucketName: `${this.stackName}-website`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html', // SPA fallback
      publicReadAccess: false, // Don't allow direct public access, only via CloudFront
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Use RETAIN for production
      encryption: s3.BucketEncryption.S3_MANAGED, // Enable server-side encryption
      versioned: true, // Enable versioning for rollbacks
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'], // Will be restricted by CloudFront distribution
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Create an origin access identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'TodoAppOriginAccessIdentity', {
      comment: `OAI for ${this.stackName} website`,
    });

    // Grant read access to the bucket from CloudFront
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject'],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [websiteBucket.arnForObjects('*')],
      })
    );

    // Create a CloudFront distribution to serve the website
    const distribution = new cloudfront.Distribution(this, 'TodoAppDistribution', {
      defaultRootObject: 'index.html',
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // For SPA routing
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // For SPA routing
        },
      ],
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Cheapest option for development/testing
    });

    // Create a config file that will be stored in S3 for the frontend app
    const appConfig = {
      apiEndpoint: props.apiEndpoint,
      userPoolId: props.userPoolId,
      userPoolClientId: props.userPoolClientId,
      region: this.region,
    };

    // Create a stack parameter with the CloudFront URL for reference
    this.distributionUrl = `https://${distribution.distributionDomainName}`;
    this.bucketName = websiteBucket.bucketName;

    // Store the distribution URL in SSM Parameter Store for reference
    new cdk.aws_ssm.StringParameter(this, 'DistributionUrlParam', {
      parameterName: `/${this.stackName}/DistributionUrl`,
      stringValue: this.distributionUrl,
    });

    // Store the S3 bucket name in SSM Parameter Store for reference
    new cdk.aws_ssm.StringParameter(this, 'WebsiteBucketNameParam', {
      parameterName: `/${this.stackName}/WebsiteBucketName`,
      stringValue: websiteBucket.bucketName,
    });

    // Store the frontend configuration in SSM Parameter Store
    new cdk.aws_ssm.StringParameter(this, 'FrontendConfigParam', {
      parameterName: `/${this.stackName}/FrontendConfig`,
      stringValue: JSON.stringify(appConfig),
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distributionUrl,
      description: 'The domain name of the CloudFront distribution',
      exportName: `${this.stackName}-DistributionUrl`,
    });

    // Output the S3 bucket name
    new cdk.CfnOutput(this, 'WebsiteBucketName', {
      value: websiteBucket.bucketName,
      description: 'The name of the S3 bucket hosting the website',
      exportName: `${this.stackName}-WebsiteBucketName`,
    });

    // Optional: Deploy a placeholder index.html if the frontend code isn't available yet
    // This helps verify that the infrastructure is working properly
    new s3deploy.BucketDeployment(this, 'XXXXXXXXXXXXXXXXX', {
      sources: [
        s3deploy.Source.data('index.html', `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Todo Application</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            </style>
          </head>
          <body>
            <h1>Todo Application</h1>
            <p>The infrastructure has been successfully deployed!</p>
            <p>API Endpoint: ${props.apiEndpoint}</p>
          </body>
          </html>
        `),
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}