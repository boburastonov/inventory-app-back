import { Router } from "express";

import { inventoryController } from "../controllers/inventory.controller";
import {
  isAuthenticated,
  isInventoryOwner,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/latest", inventoryController.getLatest);
router.get("/top", inventoryController.getTop5);
router.get("/tags/search", inventoryController.searchTags);
router.get("/by-tag/:tagName", inventoryController.getByTag);
router.get("/:inventoryId", inventoryController.getById);
router.get("/:inventoryId/stats", inventoryController.getStats);

router.get("/my", isAuthenticated, inventoryController.getMy);
router.get("/accessible", isAuthenticated, inventoryController.getAccessible);
router.post("/", isAuthenticated, inventoryController.create);

router.patch(
  "/:inventoryId",
  isAuthenticated,
  isInventoryOwner,
  inventoryController.update,
);
router.delete(
  "/:inventoryId",
  isAuthenticated,
  isInventoryOwner,
  inventoryController.delete,
);
router.post(
  "/:inventoryId/access",
  isAuthenticated,
  isInventoryOwner,
  inventoryController.addAccess,
);
router.delete(
  "/:inventoryId/access/:userId",
  isAuthenticated,
  isInventoryOwner,
  inventoryController.removeAccess,
);

export default router;
