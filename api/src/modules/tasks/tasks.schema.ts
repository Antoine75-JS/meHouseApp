import { z } from "zod";

// Task status enum validation
const taskStatusSchema = z.enum(["PENDING", "COMPLETED"]);

// Task priority enum validation
const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Task title validation: 1-100 chars
const taskTitleSchema = z
  .string()
  .min(1, "Task title is required")
  .max(100, "Task title must be at most 100 characters")
  .trim();

// Task description validation: optional, max 500 chars
const taskDescriptionSchema = z
  .string()
  .max(500, "Task description must be at most 500 characters")
  .trim()
  .optional();

// Due date validation: must be in the future
const dueDateSchema = z
  .string()
  .datetime({ message: "Invalid date format" })
  .refine((date) => new Date(date) > new Date(), {
    message: "Due date must be in the future",
  })
  .optional();

// Assignee IDs validation: array of UUIDs
const assigneeIdsSchema = z
  .array(z.string().uuid({ message: "Invalid assignee ID" }))
  .max(10, "Cannot assign more than 10 members to a task")
  .optional();

// Schema for creating a new task
export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: taskPrioritySchema.default("MEDIUM"),
  dueDate: dueDateSchema,
  categoryId: z.string().uuid({ message: "Invalid category ID" }).optional(),
  assigneeIds: assigneeIdsSchema,
});

// Schema for updating a task
export const updateTaskSchema = z.object({
  title: taskTitleSchema.optional(),
  description: taskDescriptionSchema,
  priority: taskPrioritySchema.optional(),
  dueDate: dueDateSchema,
  categoryId: z.string().uuid({ message: "Invalid category ID" }).optional(),
});

// Schema for updating task status
export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

// Schema for updating task assignees
export const updateTaskAssigneesSchema = z.object({
  assigneeIds: assigneeIdsSchema.default([]),
});

// Schema for task filtering/query parameters
export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignedToMe: z.string().transform(val => val === "true").optional(),
  createdByMe: z.string().transform(val => val === "true").optional(),
  categoryId: z.string().uuid({ message: "Invalid category ID" }).optional(),
  overdue: z.string().transform(val => val === "true").optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 20, 100)).optional(),
});

// Schema for task ID parameter validation
export const taskIdParamSchema = z.object({
  taskId: z.string().uuid({ message: "Invalid task ID format" }),
});

// Schema for house ID parameter validation
export const houseIdParamSchema = z.object({
  id: z.string().uuid({ message: "Invalid house ID format" }),
});

// Type exports for TypeScript
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskAssigneesInput = z.infer<typeof updateTaskAssigneesSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type HouseIdParam = z.infer<typeof houseIdParamSchema>;