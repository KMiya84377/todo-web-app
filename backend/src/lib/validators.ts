import Joi from 'joi';
import { SignUpRequest, LoginRequest, CreateTodoDto, UpdateTodoDto } from '../types';

/**
 * Validate signup request data
 */
export function validateSignUpRequest(data: unknown): SignUpRequest {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required()
      .message({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 50 characters',
        'any.required': 'Username is required',
      }),
    email: Joi.string().email().required()
      .message({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string().min(8).required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
      .message({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
  });

  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }

  return value as SignUpRequest;
}

/**
 * Validate login request data
 */
export function validateLoginRequest(data: unknown): LoginRequest {
  const schema = Joi.object({
    username: Joi.string().required()
      .message({
        'any.required': 'Username is required',
      }),
    password: Joi.string().required()
      .message({
        'any.required': 'Password is required',
      }),
  });

  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }

  return value as LoginRequest;
}

/**
 * Validate create todo request data
 */
export function validateCreateTodoRequest(data: unknown): CreateTodoDto {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required()
      .message({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required',
      }),
    description: Joi.string().max(500).allow('').optional(),
  });

  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }

  return value as CreateTodoDto;
}

/**
 * Validate update todo request data
 */
export function validateUpdateTodoRequest(data: unknown): UpdateTodoDto {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).optional()
      .message({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 100 characters',
      }),
    description: Joi.string().max(500).allow('').optional(),
    completed: Joi.boolean().optional(),
  }).min(1).message('At least one field must be provided for update');

  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }

  return value as UpdateTodoDto;
}

/**
 * Validate batch delete request (array of todo IDs)
 */
export function validateBatchDeleteRequest(data: unknown): string[] {
  const schema = Joi.array().items(Joi.string().required()).min(1).required()
    .message({
      'array.min': 'At least one todo ID must be provided',
      'any.required': 'Todo IDs are required',
    });

  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }

  return value as string[];
}