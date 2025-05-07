import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, getUserId } from '../../lib/apiGateway';
import todoRepository from '../../repositories/todoRepository';

/**
 * Handler for listing all todos of the current user
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the user ID from the authorizer context
    const userId = getUserId(event);

    // Get all todos for this user
    const todos = await todoRepository.getAllTodos(userId);

    return formatJSONResponse({
      items: todos,
      count: todos.length,
    });
  } catch (error) {
    console.error('Error in listTodos handler:', error);

    // Handle authentication errors
    if ((error as Error).message.includes('User ID not found')) {
      return formatErrorResponse(
        new Error('Authentication required'),
        401
      );
    }

    return formatErrorResponse(error as Error, 500);
  }
};