import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, parseBody } from '../../lib/apiGateway';
import { validateLoginRequest } from '../../lib/validators';
import { LoginRequest } from '../../types';
import authRepository from '../../repositories/authRepository';

/**
 * Handler for user login
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate the request body
    const rawData = parseBody<unknown>(event);
    const credentials = validateLoginRequest(rawData);

    // Authenticate the user
    const authResponse = await authRepository.login(credentials);

    // Return authentication result
    return formatJSONResponse({
      token: authResponse.token,
      refreshToken: authResponse.refreshToken,
      expiresIn: authResponse.expiresIn,
      userId: authResponse.userId,
      username: authResponse.username,
    });
  } catch (error) {
    console.error('Error in login handler:', error);
    
    // Handle validation errors
    if ((error as Error).message.includes('Validation error')) {
      return formatErrorResponse(error as Error, 400);
    }
    
    // Handle user not found or invalid credentials
    if (
      (error as Error).name === 'UserNotFoundException' ||
      (error as Error).name === 'NotAuthorizedException'
    ) {
      return formatErrorResponse(
        new Error('Invalid username or password'),
        401
      );
    }

    // Handle other Cognito errors
    if ((error as Error).name === 'TooManyRequestsException') {
      return formatErrorResponse(
        new Error('Too many login attempts, please try again later'),
        429
      );
    }

    return formatErrorResponse(error as Error, 500);
  }
};