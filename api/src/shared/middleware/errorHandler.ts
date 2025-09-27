import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

/**
 * Global error handling middleware
 * Catches all errors and formats them according to our API response structure
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 Internal Server Error for unexpected errors
  let statusCode = 500;
  let message = "An unexpected error occurred";
  let fields: Record<string, string> | undefined;

  // Handle operational errors (our custom AppError instances)
  if (err instanceof AppError) {
    statusCode = err.code;
    message = err.message;
    fields = err.fields;
  } else {
    // Log unexpected errors for debugging (these are bugs we need to fix)
    console.error("Unexpected error:", err);
  }

  // Build error response
  const errorResponse: {
    success: false;
    error: {
      message: string;
      code: number;
      fields?: Record<string, string>;
      stack?: string;
    };
  } = {
    success: false,
    error: {
      message,
      code: statusCode,
      ...(fields && { fields }), // Include fields only if present
    },
  };

  // Include stack trace ONLY in development mode
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
