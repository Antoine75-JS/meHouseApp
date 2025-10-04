import { Router } from "express";
import { HouseController } from "./houses.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";
import {
  requireHouseMember,
  requireOwner,
} from "../../shared/middleware/houses.middleware";
import taskRoutes from "../tasks/tasks.routes";

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
  requireOwner,
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
  requireOwner,
  HouseController.removeMember
);

router.put(
  "/:id/members/:userId/role",
  authenticate,
  requireHouseMember,
  requireOwner,
  HouseController.updateMemberRole
);

// Task routes (nested under houses)
router.use("/", taskRoutes);

export default router;
