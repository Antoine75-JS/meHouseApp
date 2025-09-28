import { Router } from "express";
import { HouseController } from "./houses.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import {
  requireHouseMember,
  requireAdmin,
  requireOwner,
} from "../../shared/middleware/houses.middleware";

const router = Router();

// House CRUD routes
router.post("/", authenticate, HouseController.createHouse);

router.get("/", authenticate, HouseController.getUserHouses);

router.get(
  "/:id",
  authenticate,
  requireHouseMember,
  HouseController.getHouseById
);

router.put(
  "/:id",
  authenticate,
  requireHouseMember,
  requireAdmin,
  HouseController.updateHouse
);

router.delete(
  "/:id",
  authenticate,
  requireHouseMember,
  requireOwner,
  HouseController.deleteHouse
);

// House member management routes
router.get(
  "/:id/members",
  authenticate,
  requireHouseMember,
  HouseController.getHouseMembers
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  requireHouseMember,
  requireAdmin,
  HouseController.removeMember
);

router.put(
  "/:id/members/:userId/role",
  authenticate,
  requireHouseMember,
  requireOwner,
  HouseController.updateMemberRole
);

export default router;
