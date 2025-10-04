import { PrismaClient, TaskStatus } from "@prisma/client";
import {
  NotFoundError,
  UnprocessableEntityError,
  ForbiddenError,
} from "../../shared/errors/AppError";
import {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  UpdateTaskAssigneesInput,
  TaskFilterInput,
} from "./tasks.schema";

const prisma = new PrismaClient();

export class TaskService {
  /**
   * Create a new task in a house
   */
  static async createTask(
    houseId: string,
    createdById: string,
    data: CreateTaskInput
  ) {
    // Verify all assignees are members of the house
    if (data.assigneeIds && data.assigneeIds.length > 0) {
      const validAssignees = await prisma.houseMember.findMany({
        where: {
          id: { in: data.assigneeIds },
          houseId,
        },
      });

      if (validAssignees.length !== data.assigneeIds.length) {
        throw new UnprocessableEntityError(
          "Some assignees are not members of this house"
        );
      }
    }

    // Verify category belongs to house if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.houseId !== houseId) {
        throw new UnprocessableEntityError(
          "Category does not belong to this house"
        );
      }
    }

    // Create task with assignees in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          houseId,
          categoryId: data.categoryId,
          createdById,
        },
        include: {
          assignees: {
            include: {
              houseMember: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          category: true,
          createdBy: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      // Create task assignments if assignees provided
      if (data.assigneeIds && data.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: data.assigneeIds.map((assigneeId) => ({
            taskId: task.id,
            houseMemberId: assigneeId,
          })),
        });

        // Fetch updated task with assignees
        return await tx.task.findUnique({
          where: { id: task.id },
          include: {
            assignees: {
              include: {
                houseMember: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
            category: true,
            createdBy: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });
      }

      return task;
    });

    return result;
  }

  /**
   * Get tasks in a house with filtering
   */
  static async getHouseTasks(
    houseId: string,
    currentUserId: string,
    filters: TaskFilterInput
  ) {
    const {
      status,
      priority,
      assignedToMe,
      createdByMe,
      categoryId,
      overdue,
      page = 1,
      limit = 20,
    } = filters;

    // Get current user's house member ID for filtering
    const currentMember = await prisma.houseMember.findUnique({
      where: {
        userId_houseId: {
          userId: currentUserId,
          houseId,
        },
      },
    });

    if (!currentMember) {
      throw new ForbiddenError("You are not a member of this house");
    }

    const where: any = {
      houseId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(categoryId && { categoryId }),
      ...(createdByMe && { createdById: currentMember.id }),
      ...(overdue && {
        dueDate: {
          lt: new Date(),
        },
        status: "PENDING",
      }),
    };

    // Handle assignedToMe filter
    if (assignedToMe) {
      where.assignees = {
        some: {
          houseMemberId: currentMember.id,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignees: {
            include: {
              houseMember: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          category: true,
          createdBy: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific task by ID
   */
  static async getTaskById(taskId: string, houseId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        houseId,
      },
      include: {
        assignees: {
          include: {
            houseMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        category: true,
        createdBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  /**
   * Update a task (only creator, assignees, or house owner can update)
   */
  static async updateTask(
    taskId: string,
    houseId: string,
    currentMemberId: string,
    data: UpdateTaskInput
  ) {
    const task = await this.getTaskById(taskId, houseId);

    // Check if user can update this task
    const canUpdate = this.canUserModifyTask(task, currentMemberId);
    if (!canUpdate) {
      throw new ForbiddenError(
        "Only task creator, assignees, or house owner can update this task"
      );
    }

    // Verify category belongs to house if provided
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.houseId !== houseId) {
        throw new UnprocessableEntityError(
          "Category does not belong to this house"
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priority && { priority: data.priority }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      include: {
        assignees: {
          include: {
            houseMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        category: true,
        createdBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return updatedTask;
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    taskId: string,
    houseId: string,
    currentMemberId: string,
    data: UpdateTaskStatusInput
  ) {
    const task = await this.getTaskById(taskId, houseId);

    // Check if user can update this task
    const canUpdate = this.canUserModifyTask(task, currentMemberId);
    if (!canUpdate) {
      throw new ForbiddenError(
        "Only task creator, assignees, or house owner can update task status"
      );
    }

    const updateData: any = {
      status: data.status,
    };

    // Set completedAt when marking as completed
    if (data.status === "COMPLETED") {
      updateData.completedAt = new Date();
    } else if (data.status === "PENDING") {
      updateData.completedAt = null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignees: {
          include: {
            houseMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        category: true,
        createdBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return updatedTask;
  }

  /**
   * Update task assignees
   */
  static async updateTaskAssignees(
    taskId: string,
    houseId: string,
    currentMemberId: string,
    data: UpdateTaskAssigneesInput
  ) {
    const task = await this.getTaskById(taskId, houseId);

    // Check if user can update this task
    const canUpdate = this.canUserModifyTask(task, currentMemberId);
    if (!canUpdate) {
      throw new ForbiddenError(
        "Only task creator, assignees, or house owner can update task assignees"
      );
    }

    // Verify all assignees are members of the house
    if (data.assigneeIds.length > 0) {
      const validAssignees = await prisma.houseMember.findMany({
        where: {
          id: { in: data.assigneeIds },
          houseId,
        },
      });

      if (validAssignees.length !== data.assigneeIds.length) {
        throw new UnprocessableEntityError(
          "Some assignees are not members of this house"
        );
      }
    }

    // Update assignees in a transaction
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Remove existing assignments
      await tx.taskAssignee.deleteMany({
        where: { taskId },
      });

      // Add new assignments
      if (data.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: data.assigneeIds.map((assigneeId) => ({
            taskId,
            houseMemberId: assigneeId,
          })),
        });
      }

      // Return updated task
      return await tx.task.findUnique({
        where: { id: taskId },
        include: {
          assignees: {
            include: {
              houseMember: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          category: true,
          createdBy: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });
    });

    return updatedTask;
  }

  /**
   * Delete a task
   */
  static async deleteTask(
    taskId: string,
    houseId: string,
    currentMemberId: string
  ) {
    const task = await this.getTaskById(taskId, houseId);

    // Check if user can delete this task (only creator or house owner)
    const currentMember = await prisma.houseMember.findUnique({
      where: { id: currentMemberId },
    });

    const canDelete =
      task.createdById === currentMemberId ||
      currentMember?.role === "OWNER";

    if (!canDelete) {
      throw new ForbiddenError(
        "Only task creator or house owner can delete this task"
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  }

  /**
   * Helper method to check if user can modify a task
   */
  private static canUserModifyTask(task: any, currentMemberId: string): boolean {
    // Task creator can always modify
    if (task.createdById === currentMemberId) {
      return true;
    }

    // Assignees can modify
    const isAssignee = task.assignees.some(
      (assignment: any) => assignment.houseMemberId === currentMemberId
    );
    if (isAssignee) {
      return true;
    }

    // House owner can modify (this would need to be checked at controller level)
    return false;
  }
}