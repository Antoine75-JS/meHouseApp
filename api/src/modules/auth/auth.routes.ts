import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current authenticated user
 * @access  Protected (requires JWT)
 */
router.get("/me", authenticate, authController.getMe);

export default router;
