import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, getUserId, parseBody } from '../../lib/apiGateway';
import { validateCreateTodoRequest } from '../../lib/validators';
import todoRepository from '../../repositories/todoRepository';

/**
 * Handler for creating a new todo
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the user ID from the authorizer context
    const userId = getUserId(event);

    // Parse and validate the request body
    const rawData = parseBody<unknown>(event);
    const todoData = validateCreateTodoRequest(rawData);

    // Create the todo
    const createdTodo = await todoRepository.createTodo(userId, todoData);

    // Return the created todo
    return formatJSONResponse(createdTodo, 201);
  } catch (error) {
    console.error('Error in createTodo handler:', error);

    // Handle authentication errors
    if ((error as Error).message.includes('User ID not found')) {
      return formatErrorResponse(
        new Error('Authentication required'),
        401
      );
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