import { Router } from "express";

import { customIdController } from '../controllers/customId.controller'
import {
  isAuthenticated,
  isInventoryOwner,
} from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(isAuthenticated, isInventoryOwner);

router.post("/", customIdController.save);
router.get("/preview", customIdController.preview);

export default router;
