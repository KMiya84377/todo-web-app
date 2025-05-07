import { App } from 'aws-cdk-lib';

export interface EnvironmentConfig {
  appName: string;
  domainName: string;
  environmentName: string;
  region: string;
}

/**
 * Retrieves configuration for the specified environment.
 * Config values are sourced from cdk.json context.
 * 
 * @param app CDK App instance
 * @param envName Environment name (e.g., 'dev', 'prod')
 * @returns Environment-specific configuration
 */
export function getConfig(app: App, envName: string): EnvironmentConfig {
  // Default region from context or fallback to ap-northeast-1 as specified in requirements
  const region = app.node.tryGetContext('region') || 'ap-northeast-1';
  
  // Get environment-specific configuration from context
  const envConfig = app.node.tryGetContext(envName);
  
  if (!envConfig) {
    throw new Error(`Configuration for environment '${envName}' not found in cdk.json context`);
  }
  
  return {
    appName: envConfig.appName,
    domainName: envConfig.domainName,
    environmentName: envConfig.environmentName,
    region,
  };
}