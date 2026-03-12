import { Router } from "express";

import { itemController } from "../controllers/item.controller";
import { isAuthenticated, hasWriteAccess } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/", itemController.getByInventory);
router.get("/:itemId", itemController.getById);

router.get("/:itemId/like", isAuthenticated, itemController.getLikeStatus);
router.post("/:itemId/like", isAuthenticated, itemController.like);
router.delete("/:itemId/like", isAuthenticated, itemController.unlike);

router.post("/", isAuthenticated, hasWriteAccess, itemController.create);
router.patch(
  "/:itemId",
  isAuthenticated,
  hasWriteAccess,
  itemController.update,
);
router.delete(
  "/:itemId",
  isAuthenticated,
  hasWriteAccess,
  itemController.delete,
);

export default router;
