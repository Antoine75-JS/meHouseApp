/**
 * Base application error class
 * All custom errors extend this class to ensure consistent error handling
 */
export class AppError extends Error {
  public readonly code: number;
  public readonly fields?: Record<string, string>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: number,
    fields?: Record<string, string>,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.fields = fields;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - General validation errors with field-specific messages
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    fields?: Record<string, string>
  ) {
    super(message, 400, fields);
  }
}

/**
 * 401 Unauthorized - Authentication failures (missing/invalid credentials or token)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Authorization failures (authenticated but insufficient permissions)
 * CRITICAL: Used when user lacks permission for a resource they're trying to access
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "You do not have permission to perform this action"
  ) {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Resource already exists (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Resource already exists",
    fields?: Record<string, string>
  ) {
    super(message, 409, fields);
  }
}

/**
 * 422 Unprocessable Entity - Request is well-formed but semantically incorrect
 * Used for business logic validation failures that aren't simple field validation
 */
export class UnprocessableEntityError extends AppError {
  constructor(
    message: string = "Cannot process request",
    fields?: Record<string, string>
  ) {
    super(message, 422, fields);
  }
}

/**
 * 500 Internal Server Error - Unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "An unexpected error occurred",
    isOperational: boolean = false
  ) {
    super(message, 500, undefined, isOperational);
  }
}
