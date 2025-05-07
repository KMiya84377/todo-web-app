import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, getUserId, getPathParameter } from '../../lib/apiGateway';
import todoRepository from '../../repositories/todoRepository';

/**
 * Handler for deleting a todo by ID
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the user ID from the authorizer context
    const userId = getUserId(event);

    // Get the todo ID from path parameters
    const todoId = getPathParameter(event, 'id');

    // Delete the todo
    const success = await todoRepository.deleteTodo(userId, todoId);

    // Return 404 if todo not found or belongs to another user
    if (!success) {
      return formatErrorResponse(
        new Error('Todo not found'),
        404
      );
    }

    // Return success response with no content
    return formatJSONResponse({
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteTodo handler:', error);

    // Handle authentication errors
    if ((error as Error).message.includes('User ID not found')) {
      return formatErrorResponse(
        new Error('Authentication required'),
        401
      );
    }

    // Handle missing path parameter error
    if ((error as Error).message.includes('Missing path parameter')) {
      return formatErrorResponse(error as Error, 400);
    }

    return formatErrorResponse(error as Error, 500);
  }
};