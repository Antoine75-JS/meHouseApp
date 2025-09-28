import express, { Request, Response } from "express";
import cors from "cors";
import "express-async-errors"; // Must be imported early to catch async errors
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./shared/middleware/errorHandler";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "MeHouse API",
    },
  });
});

// Auth routes
app.use("/api/v1/auth", authRoutes);

// Error handling middleware - MUST be registered AFTER all routes
app.use(errorHandler);

export default app;
