import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, getUserId, getPathParameter, parseBody } from '../../lib/apiGateway';
import { validateUpdateTodoRequest } from '../../lib/validators';
import todoRepository from '../../repositories/todoRepository';

/**
 * Handler for updating an existing todo
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the user ID from the authorizer context
    const userId = getUserId(event);

    // Get the todo ID from path parameters
    const todoId = getPathParameter(event, 'id');

    // Parse and validate the request body
    const rawData = parseBody<unknown>(event);
    const updateData = validateUpdateTodoRequest(rawData);

    // Update the todo
    const updatedTodo = await todoRepository.updateTodo(userId, todoId, updateData);

    // Return 404 if todo not found or belongs to another user
    if (!updatedTodo) {
      return formatErrorResponse(
        new Error('Todo not found'),
        404
      );
    }

    // Return the updated todo
    return formatJSONResponse(updatedTodo);
  } catch (error) {
    console.error('Error in updateTodo handler:', error);

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

    // Handle validation errors
    if ((error as Error).message.includes('Validation error')) {
      return formatErrorResponse(error as Error, 400);
    }

    // Handle missing or invalid request body
    if ((error as Error).message.includes('Missing request body') ||
        (error as Error).message.includes('Invalid request body')) {
      return formatErrorResponse(error as Error, 400);
    }

    return formatErrorResponse(error as Error, 500);
  }
};