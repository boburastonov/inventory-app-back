import { Router } from "express";

import { fieldController } from "../controllers/field.controller";
import {
  isAuthenticated,
  isInventoryOwner,
} from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(isAuthenticated, isInventoryOwner);

router.post("/", fieldController.create);
router.patch("/reorder", fieldController.reorder);
router.patch("/:fieldId", fieldController.update);
router.delete("/:fieldId", fieldController.delete);

export default router;
