import { PrismaClient, Role } from "@prisma/client";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../../shared/errors/AppError";
import { CreateHouseInput, UpdateHouseInput } from "./houses.schema";

const prisma = new PrismaClient();

export class HouseService {
  /**
   * Create a new house with the user as OWNER
   */
  static async createHouse(
    userId: string,
    data: CreateHouseInput,
    displayName: string
  ) {
    // Create house and add creator as OWNER in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the house
      const house = await tx.house.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      // Add creator as OWNER member
      const houseMember = await tx.houseMember.create({
        data: {
          userId,
          houseId: house.id,
          displayName,
          role: "OWNER",
        },
      });

      return { house, houseMember };
    });

    return result.house;
  }

  /**
   * Get all houses where user is a member
   */
  static async getUserHouses(userId: string) {
    const houseMembers = await prisma.houseMember.findMany({
      where: { userId },
      include: {
        house: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return houseMembers.map((member) => ({
      ...member.house,
      memberInfo: {
        displayName: member.displayName,
        role: member.role,
        joinedAt: member.createdAt,
      },
    }));
  }

  /**
   * Get specific house by ID (user must be member)
   */
  static async getHouseById(houseId: string) {
    const house = await prisma.house.findUnique({
      where: { id: houseId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });

    if (!house) {
      throw new NotFoundError("House not found");
    }

    return house;
  }

  /**
   * Update house details (admin+ required)
   */
  static async updateHouse(houseId: string, data: UpdateHouseInput) {
    // Check if house exists
    const existingHouse = await prisma.house.findUnique({
      where: { id: houseId },
    });

    if (!existingHouse) {
      throw new NotFoundError("House not found");
    }

    // Update house
    const updatedHouse = await prisma.house.update({
      where: { id: houseId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });

    return updatedHouse;
  }

  /**
   * Delete house (owner required)
   */
  static async deleteHouse(houseId: string) {
    // Check if house exists
    const house = await prisma.house.findUnique({
      where: { id: houseId },
    });

    if (!house) {
      throw new NotFoundError("House not found");
    }

    // Delete house (cascade will handle members, tasks, etc.)
    await prisma.house.delete({
      where: { id: houseId },
    });

    return { success: true };
  }

  /**
   * Get all members of a house
   */
  static async getHouseMembers(houseId: string) {
    const members = await prisma.houseMember.findMany({
      where: { houseId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { role: "desc" }, // OWNER first, then MEMBER
        { createdAt: "asc" },
      ],
    });

    return members;
  }

  /**
   * Remove member from house (admin+ required)
   */
  static async removeMember(houseId: string, targetUserId: string) {
    // Check if target user is a member
    const targetMember = await prisma.houseMember.findUnique({
      where: {
        userId_houseId: {
          userId: targetUserId,
          houseId,
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundError("User is not a member of this house");
    }

    // Check if trying to remove the last OWNER
    if (targetMember.role === "OWNER") {
      const ownerCount = await prisma.houseMember.count({
        where: {
          houseId,
          role: "OWNER",
        },
      });

      if (ownerCount <= 1) {
        throw new UnprocessableEntityError(
          "Cannot remove the last owner of the house"
        );
      }
    }

    // Remove member
    await prisma.houseMember.delete({
      where: {
        userId_houseId: {
          userId: targetUserId,
          houseId,
        },
      },
    });

    return { success: true };
  }

  /**
   * Update member role (owner required)
   */
  static async updateMemberRole(
    houseId: string,
    targetUserId: string,
    newRole: Role
  ) {
    // Check if target user is a member
    const targetMember = await prisma.houseMember.findUnique({
      where: {
        userId_houseId: {
          userId: targetUserId,
          houseId,
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundError("User is not a member of this house");
    }

    // Check if trying to demote the last OWNER
    if (targetMember.role === "OWNER" && newRole !== "OWNER") {
      const ownerCount = await prisma.houseMember.count({
        where: {
          houseId,
          role: "OWNER",
        },
      });

      if (ownerCount <= 1) {
        throw new UnprocessableEntityError(
          "Cannot demote the last owner of the house"
        );
      }
    }

    // Update role
    const updatedMember = await prisma.houseMember.update({
      where: {
        userId_houseId: {
          userId: targetUserId,
          houseId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return updatedMember;
  }

  /**
   * Check if display name is available in a house
   */
  static async isDisplayNameAvailable(
    houseId: string,
    displayName: string,
    excludeUserId?: string
  ) {
    const existingMember = await prisma.houseMember.findUnique({
      where: {
        displayName_houseId: {
          displayName,
          houseId,
        },
      },
    });

    // If no existing member, name is available
    if (!existingMember) return true;

    // If excluding a specific user (for updates), check if it's the same user
    if (excludeUserId && existingMember.userId === excludeUserId) return true;

    return false;
  }
}
