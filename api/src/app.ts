import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    message: "MeHouse API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;
// Note: The server listening code is moved to a separate file (e.g., server.ts) for better modularity.
