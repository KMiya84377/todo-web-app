import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse, formatErrorResponse, getUserId, parseBody } from '../../lib/apiGateway';
import { validateBatchDeleteRequest } from '../../lib/validators';
import todoRepository from '../../repositories/todoRepository';

/**
 * Handler for batch deleting multiple todos
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the user ID from the authorizer context
    const userId = getUserId(event);

    // Parse and validate the request body (array of todo IDs)
    const rawData = parseBody<unknown>(event);
    const todoIds = validateBatchDeleteRequest(rawData);

    // Batch delete the todos
    const result = await todoRepository.batchDeleteTodos(userId, todoIds);

    // Return results including successfully deleted and failed items
    return formatJSONResponse({
      message: 'Batch delete completed',
      summary: {
        total: todoIds.length,
        successful: result.deleted.length,
        failed: result.failed.length
      },
      deleted: result.deleted,
      failed: result.failed
    });
  } catch (error) {
    console.error('Error in batchDeleteTodos handler:', error);

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