import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { getUserById } from "../../modules/auth/auth.service";
import { UnauthorizedError } from "../errors/AppError";

/**
 * Extends Express Request to include authenticated user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 *
 * @throws UnauthorizedError if token is missing, invalid, or user not found
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    // Check for Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Invalid authorization format. Use: Bearer <token>"
      );
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    if (!token) {
      throw new UnauthorizedError("Token is required");
    }

    // Verify token and extract payload
    const payload = verifyToken(token); // Throws UnauthorizedError if invalid/expired

    // Fetch user from database
    const user = await getUserById(payload.userId); // Throws NotFoundError if user doesn't exist

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    next(error); // Pass error to error handler middleware
  }
};
