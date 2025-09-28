import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/AppError";

/**
 * JWT Payload structure
 * Contains user identification data encoded in the token
 */
export interface JwtPayload {
  userId: string; // UUID from users table
  email: string; // For convenience in middleware
}

/**
 * Generates a JWT access token for authenticated user
 *
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export const generateToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  } as jwt.SignOptions);
};

/**
 * Verifies and decodes a JWT token
 *
 * @param token - JWT token string to verify
 * @returns Decoded JWT payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    // Unexpected error
    throw new UnauthorizedError("Token verification failed");
  }
};
