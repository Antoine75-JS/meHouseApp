import { Response } from "express";
import { AuthRequest } from "../../shared/middleware/auth.middleware";
import { TaskService } from "./tasks.service";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskAssigneesSchema,
  taskFilterSchema,
  taskIdParamSchema,
  houseIdParamSchema,
} from "./tasks.schema";

export class TaskController {
  /**
   * POST /api/v1/houses/:id/tasks
   * Create a new task in a house
   */
  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const taskData = createTaskSchema.parse(req.body);
    const currentMemberId = req.houseMember!.id;

    const task = await TaskService.createTask(
      houseId,
      currentMemberId,
      taskData
    );

    res.status(201).json({
      success: true,
      data: { task },
    });
  }

  /**
   * GET /api/v1/houses/:id/tasks
   * Get tasks in a house with filtering
   */
  static async getHouseTasks(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const filters = taskFilterSchema.parse(req.query);
    const currentUserId = req.user!.id;

    const result = await TaskService.getHouseTasks(
      houseId,
      currentUserId,
      filters
    );

    res.json({
      success: true,
      data: result,
    });
  }

  /**
   * GET /api/v1/houses/:id/tasks/:taskId
   * Get specific task by ID
   */
  static async getTaskById(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const { taskId } = taskIdParamSchema.parse(req.params);

    const task = await TaskService.getTaskById(taskId, houseId);

    res.json({
      success: true,
      data: { task },
    });
  }

  /**
   * PUT /api/v1/houses/:id/tasks/:taskId
   * Update a task
   */
  static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const { taskId } = taskIdParamSchema.parse(req.params);
    const updateData = updateTaskSchema.parse(req.body);
    const currentMemberId = req.houseMember!.id;

    const task = await TaskService.updateTask(
      taskId,
      houseId,
      currentMemberId,
      updateData
    );

    res.json({
      success: true,
      data: { task },
    });
  }

  /**
   * PUT /api/v1/houses/:id/tasks/:taskId/status
   * Update task status (mark complete/incomplete)
   */
  static async updateTaskStatus(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const { taskId } = taskIdParamSchema.parse(req.params);
    const statusData = updateTaskStatusSchema.parse(req.body);
    const currentMemberId = req.houseMember!.id;

    const task = await TaskService.updateTaskStatus(
      taskId,
      houseId,
      currentMemberId,
      statusData
    );

    res.json({
      success: true,
      data: { task },
    });
  }

  /**
   * PUT /api/v1/houses/:id/tasks/:taskId/assignees
   * Update task assignees
   */
  static async updateTaskAssignees(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const { taskId } = taskIdParamSchema.parse(req.params);
    const assigneeData = updateTaskAssigneesSchema.parse(req.body);
    const currentMemberId = req.houseMember!.id;

    const task = await TaskService.updateTaskAssignees(
      taskId,
      houseId,
      currentMemberId,
      assigneeData
    );

    res.json({
      success: true,
      data: { task },
    });
  }

  /**
   * DELETE /api/v1/houses/:id/tasks/:taskId
   * Delete a task
   */
  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    const { id: houseId } = houseIdParamSchema.parse(req.params);
    const { taskId } = taskIdParamSchema.parse(req.params);
    const currentMemberId = req.houseMember!.id;

    await TaskService.deleteTask(taskId, houseId, currentMemberId);

    res.json({
      success: true,
      data: { message: "Task deleted successfully" },
    });
  }
}