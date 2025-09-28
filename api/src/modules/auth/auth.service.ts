import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { RegisterInput, LoginInput } from "./auth.schemas";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../../shared/errors/AppError";
import { generateToken } from "../../shared/utils/jwt";
import { AuthResponse, UserResponse } from "../../shared/types/auth";
const prisma = new PrismaClient();

/**
 * Registers a new user account
 *
 * @param data - Validated registration data
 * @returns User object and JWT token
 * @throws ConflictError if email already exists
 */
export const registerUser = async (
  data: RegisterInput
): Promise<AuthResponse> => {
  const { email, password, firstName, lastName } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError("Email already registered", {
      email: "This email is already in use",
    });
  }

  // Hash password (salt rounds: 10)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    token,
  };
};

/**
 * Authenticates user and returns JWT token
 *
 * @param data - Validated login credentials
 * @returns User object and JWT token
 * @throws UnauthorizedError if credentials are invalid
 */
export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const { email, password } = data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    token,
  };
};

/**
 * Gets user by ID (for /me endpoint and auth middleware)
 *
 * @param userId - User UUID
 * @returns User object without password
 * @throws NotFoundError if user doesn't exist
 */
export const getUserById = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  };
};
