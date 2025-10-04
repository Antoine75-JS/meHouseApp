import { Router } from "express";
import { TaskController } from "./tasks.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import { requireHouseMember } from "../../shared/middleware/houses.middleware";

const router = Router();

// All task routes require authentication and house membership
// House ID is passed as :id parameter, task ID as :taskId

// Task CRUD routes
router.post(
  "/:id/tasks",
  authenticate,
  requireHouseMember,
  TaskController.createTask
);

router.get(
  "/:id/tasks",
  authenticate,
  requireHouseMember,
  TaskController.getHouseTasks
);

router.get(
  "/:id/tasks/:taskId",
  authenticate,
  requireHouseMember,
  TaskController.getTaskById
);

router.put(
  "/:id/tasks/:taskId",
  authenticate,
  requireHouseMember,
  TaskController.updateTask
);

router.delete(
  "/:id/tasks/:taskId",
  authenticate,
  requireHouseMember,
  TaskController.deleteTask
);

// Task action routes
router.put(
  "/:id/tasks/:taskId/status",
  authenticate,
  requireHouseMember,
  TaskController.updateTaskStatus
);

router.put(
  "/:id/tasks/:taskId/assignees",
  authenticate,
  requireHouseMember,
  TaskController.updateTaskAssignees
);

export default router;