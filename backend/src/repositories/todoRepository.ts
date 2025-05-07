import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuid } from 'uuid';
import { CreateTodoDto, Todo, UpdateTodoDto } from '../types';

// Initialize the DynamoDB client
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const TODO_TABLE = process.env.TODO_TABLE || 'todo-app-backend-dev-todos';

export class TodoRepository {
  /**
   * Get all todos for a specific user
   */
  async getAllTodos(userId: string): Promise<Todo[]> {
    try {
      const params = {
        TableName: TODO_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      };

      const { Items } = await docClient.send(new QueryCommand(params));
      return (Items as Todo[]) || [];
    } catch (error) {
      console.error('Error getting all todos:', error);
      throw error;
    }
  }

  /**
   * Get a single todo by its ID for a specific user
   */
  async getTodoById(userId: string, todoId: string): Promise<Todo | null> {
    try {
      const params = {
        TableName: TODO_TABLE,
        Key: {
          userId,
          todoId,
        },
      };

      const { Item } = await docClient.send(new GetCommand(params));
      return (Item as Todo) || null;
    } catch (error) {
      console.error(`Error getting todo with ID ${todoId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new todo for a user
   */
  async createTodo(userId: string, todoData: CreateTodoDto): Promise<Todo> {
    try {
      const timestamp = new Date().toISOString();
      const todoId = uuid();
      
      const todo: Todo = {
        todoId,
        userId,
        title: todoData.title,
        description: todoData.description || '',
        completed: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const params = {
        TableName: TODO_TABLE,
        Item: todo,
      };

      await docClient.send(new PutCommand(params));
      return todo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  /**
   * Update an existing todo
   */
  async updateTodo(
    userId: string,
    todoId: string,
    updates: UpdateTodoDto
  ): Promise<Todo | null> {
    try {
      // First check if the todo exists and belongs to this user
      const existingTodo = await this.getTodoById(userId, todoId);
      if (!existingTodo) {
        return null;
      }

      const timestamp = new Date().toISOString();
      
      // Build the update expression dynamically based on provided updates
      let updateExpression = 'set updatedAt = :updatedAt';
      const expressionAttributeValues: { [key: string]: any } = {
        ':updatedAt': timestamp,
      };

      if (updates.title !== undefined) {
        updateExpression += ', title = :title';
        expressionAttributeValues[':title'] = updates.title;
      }

      if (updates.description !== undefined) {
        updateExpression += ', description = :description';
        expressionAttributeValues[':description'] = updates.description;
      }

      if (updates.completed !== undefined) {
        updateExpression += ', completed = :completed';
        expressionAttributeValues[':completed'] = updates.completed;
      }

      const params = {
        TableName: TODO_TABLE,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      };

      const { Attributes } = await docClient.send(new UpdateCommand(params));
      return Attributes as Todo;
    } catch (error) {
      console.error(`Error updating todo with ID ${todoId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(userId: string, todoId: string): Promise<boolean> {
    try {
      // First check if the todo exists and belongs to this user
      const existingTodo = await this.getTodoById(userId, todoId);
      if (!existingTodo) {
        return false;
      }

      const params = {
        TableName: TODO_TABLE,
        Key: {
          userId,
          todoId,
        },
      };

      await docClient.send(new DeleteCommand(params));
      return true;
    } catch (error) {
      console.error(`Error deleting todo with ID ${todoId}:`, error);
      throw error;
    }
  }

  /**
   * Batch delete multiple todos
   */
  async batchDeleteTodos(userId: string, todoIds: string[]): Promise<{ deleted: string[], failed: string[] }> {
    try {
      const deleted: string[] = [];
      const failed: string[] = [];

      // DynamoDB BatchWrite can only handle 25 items at a time
      const chunkSize = 25;
      for (let i = 0; i < todoIds.length; i += chunkSize) {
        const chunk = todoIds.slice(i, i + chunkSize);
        
        // Create delete requests for each todo in the chunk
        const deleteRequests = chunk.map(todoId => ({
          DeleteRequest: {
            Key: {
              userId,
              todoId,
            },
          },
        }));

        const params = {
          RequestItems: {
            [TODO_TABLE]: deleteRequests,
          },
        };

        try {
          const result = await docClient.send(new BatchWriteCommand(params));
          
          // Check for unprocessed items
          const unprocessedItems = result.UnprocessedItems?.[TODO_TABLE] || [];
          const unprocessedIds = unprocessedItems.map(item => 
            (item.DeleteRequest?.Key as { todoId: string })?.todoId
          );
          
          // Track successful and failed deletions
          chunk.forEach(todoId => {
            if (unprocessedIds.includes(todoId)) {
              failed.push(todoId);
            } else {
              deleted.push(todoId);
            }
          });
        } catch (error) {
          console.error('Error in batch delete chunk:', error);
          // If the entire chunk fails, add all IDs to failed
          failed.push(...chunk);
        }
      }

      return { deleted, failed };
    } catch (error) {
      console.error('Error in batch delete todos:', error);
      throw error;
    }
  }
}

export default new TodoRepository();