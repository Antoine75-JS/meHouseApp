import { Response, NextFunction } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";
import { ForbiddenError, NotFoundError } from "../errors/AppError";

const prisma = new PrismaClient();

// Extend Request interface to include house member info
declare global {
  namespace Express {
    interface Request {
      houseMember?: {
        id: string;
        userId: string;
        houseId: string;
        displayName: string;
        role: Role;
        createdAt: Date;
      };
    }
  }
}

/**
 * Middleware to check if user is a member of the house
 * Requires auth middleware to run first (req.user must exist)
 * Attaches house member info to req.houseMember
 */
export const requireHouseMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id: houseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new ForbiddenError("Authentication required");
    }

    if (!houseId) {
      throw new NotFoundError("House ID is required");
    }

    // Check if user is a member of this house
    const houseMember = await prisma.houseMember.findUnique({
      where: {
        userId_houseId: {
          userId,
          houseId,
        },
      },
    });

    if (!houseMember) {
      throw new ForbiddenError("You are not a member of this house");
    }

    // Attach house member info to request
    req.houseMember = houseMember;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware factory to check if user has required role or higher
 * Role hierarchy: OWNER > ADMIN > MEMBER
 */
export const requireHouseRole = (requiredRole: Role) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // requireHouseMember should run before this middleware
      if (!req.houseMember) {
        throw new ForbiddenError("House membership check required");
      }

      const userRole = req.houseMember.role;

      // Check if user has required role or higher
      if (!hasRequiredRole(userRole, requiredRole)) {
        throw new ForbiddenError(`${requiredRole} role or higher required`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Helper function to check role hierarchy
 * OWNER > ADMIN > MEMBER
 */
function hasRequiredRole(
  userRole: Role,
  requiredRole: Role
): boolean {
  const roleHierarchy = {
    OWNER: 2,
    MEMBER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Convenience middleware exports for common role checks
export const requireOwner = requireHouseRole("OWNER");
export const requireMember = requireHouseRole("MEMBER");
