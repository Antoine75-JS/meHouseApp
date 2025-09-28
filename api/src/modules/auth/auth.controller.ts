import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schemas";
import { validateData } from "../../shared/utils/validation";
import { AuthRequest } from "../../shared/middleware/auth.middleware";

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = validateData(registerSchema, req.body);

  // Create user and generate token
  const result = await registerUser(validatedData);

  res.status(201).json({
    success: true,
    data: result,
  });
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  // Validate request body
  const validatedData = validateData(loginSchema, req.body);

  // Authenticate user and generate token
  const result = await loginUser(validatedData);

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 * Protected route - requires authentication
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  // User is already attached to request by authenticate middleware
  if (!req.user) {
    // This should never happen if middleware is working correctly
    throw new Error("User not found in request");
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
