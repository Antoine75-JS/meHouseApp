import { Request, Response } from "express";
import { HouseService } from "./houses.service";
import {
  createHouseSchema,
  updateHouseSchema,
  updateMemberRoleSchema,
  setDisplayNameSchema,
  houseIdParamSchema,
  userIdParamSchema,
} from "./houses.schema";

export class HouseController {
  /**
   * POST /api/v1/houses
   * Create a new house
   */
  static async createHouse(req: Request, res: Response): Promise<void> {
    // Validate request body (house data + displayName)
    const houseData = createHouseSchema.parse(req.body);
    const { displayName } = setDisplayNameSchema.parse(req.body);

    const userId = req.user!.id;

    const house = await HouseService.createHouse(
      userId,
      houseData,
      displayName
    );

    res.status(201).json({
      success: true,
      data: { house },
    });
  }

  /**
   * GET /api/v1/houses
   * Get user's houses
   */
  static async getUserHouses(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const houses = await HouseService.getUserHouses(userId);

    res.json({
      success: true,
      data: { houses },
    });
  }

  /**
   * GET /api/v1/houses/:id
   * Get specific house details
   */
  static async getHouseById(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);

    const house = await HouseService.getHouseById(id);

    res.json({
      success: true,
      data: { house },
    });
  }

  /**
   * PUT /api/v1/houses/:id
   * Update house details (admin+ required)
   */
  static async updateHouse(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);
    const updateData = updateHouseSchema.parse(req.body);

    const house = await HouseService.updateHouse(id, updateData);

    res.json({
      success: true,
      data: { house },
    });
  }

  /**
   * DELETE /api/v1/houses/:id
   * Delete house (owner required)
   */
  static async deleteHouse(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);

    await HouseService.deleteHouse(id);

    res.json({
      success: true,
      data: { message: "House deleted successfully" },
    });
  }

  /**
   * GET /api/v1/houses/:id/members
   * Get house members
   */
  static async getHouseMembers(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);

    const members = await HouseService.getHouseMembers(id);

    res.json({
      success: true,
      data: { members },
    });
  }

  /**
   * DELETE /api/v1/houses/:id/members/:userId
   * Remove member from house (admin+ required)
   */
  static async removeMember(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);
    const { userId } = userIdParamSchema.parse(req.params);

    await HouseService.removeMember(id, userId);

    res.json({
      success: true,
      data: { message: "Member removed successfully" },
    });
  }

  /**
   * PUT /api/v1/houses/:id/members/:userId/role
   * Update member role (owner required)
   */
  static async updateMemberRole(req: Request, res: Response): Promise<void> {
    const { id } = houseIdParamSchema.parse(req.params);
    const { userId } = userIdParamSchema.parse(req.params);
    const { role } = updateMemberRoleSchema.parse(req.body);

    const member = await HouseService.updateMemberRole(id, userId, role);

    res.json({
      success: true,
      data: { member },
    });
  }
}
