import { z } from "zod";

/**
 * Register request validation schema
 * Creates a new user account with email, password, and profile info
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z.string().min(8, "Password must be at least 8 characters"),

  firstName: z.string().min(1, "First name is required").trim(),

  lastName: z.string().min(1, "Last name is required").trim(),
});

/**
 * Login request validation schema
 * Authenticates user with email and password
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z.string().min(1, "Password is required"),
});

// Export types for TypeScript usage
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
