import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, parseBody } from '../../lib/apiGateway';
import { validateSignUpRequest } from '../../lib/validators';
import { SignUpRequest } from '../../types';
import authRepository from '../../repositories/authRepository';

/**
 * Handler for user registration
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate the request body
    const rawData = parseBody<unknown>(event);
    const userData = validateSignUpRequest(rawData);

    // Check if username already exists
    const existingUser = await authRepository.getUserByUsername(userData.username);
    if (existingUser) {
      return formatErrorResponse(
        new Error('Username is already taken'),
        409 // Conflict
      );
    }

    // Register user in Cognito
    const user = await authRepository.signUp(userData);

    // Return the created user (without password)
    return formatJSONResponse({
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email
      }
    }, 201);
  } catch (error) {
    console.error('Error in signUp handler:', error);
    
    // Handle validation errors
    if ((error as Error).message.includes('Validation error')) {
      return formatErrorResponse(error as Error, 400);
    }
    
    // Handle Cognito specific errors
    if ((error as Error).name === 'UsernameExistsException') {
      return formatErrorResponse(
        new Error('Username is already taken'),
        409
      );
    }
    
    if ((error as Error).name === 'InvalidPasswordException') {
      return formatErrorResponse(
        new Error('Password does not meet complexity requirements'),
        400
      );
    }

    return formatErrorResponse(error as Error, 500);
  }
};