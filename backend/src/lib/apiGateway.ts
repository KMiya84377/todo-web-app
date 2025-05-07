import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ErrorResponse } from '../types';

/**
 * Common headers for all API responses
 */
export const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

/**
 * Format successful API response
 */
export function formatJSONResponse<T>(response: T, statusCode: number = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers,
    body: JSON.stringify(response)
  };
}

/**
 * Format error API response
 */
export function formatErrorResponse(error: Error, statusCode: number = 500): APIGatewayProxyResult {
  // Default error response
  const errorResponse: ErrorResponse = {
    message: error.message || 'An unexpected error occurred',
    code: error.name || 'INTERNAL_SERVER_ERROR'
  };

  // Log the error for debugging
  console.error(`Error [${statusCode}]: ${error.message}`, error);

  return {
    statusCode,
    headers,
    body: JSON.stringify(errorResponse)
  };
}

/**
 * Extract user ID from the Cognito authorizer context
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  // If using Cognito authorizer, the claims are available in the event.requestContext.authorizer.claims
  const claims = event.requestContext?.authorizer?.claims;
  
  if (claims && typeof claims === 'object' && 'sub' in claims) {
    return claims.sub as string;
  }
  
  throw new Error('User ID not found in request context');
}

/**
 * Parse and validate request body
 */
export function parseBody<T>(event: APIGatewayProxyEvent): T {
  try {
    // Parse the request body
    if (!event.body) {
      throw new Error('Missing request body');
    }
    
    return JSON.parse(event.body) as T;
  } catch (error) {
    console.error('Error parsing request body:', error);
    throw new Error('Invalid request body');
  }
}

/**
 * Get path parameter value
 */
export function getPathParameter(event: APIGatewayProxyEvent, paramName: string): string {
  const value = event.pathParameters?.[paramName];
  if (!value) {
    throw new Error(`Missing path parameter: ${paramName}`);
  }
  return value;
}