import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get("/:userId", userController.getById);
router.patch("/preferences", isAuthenticated, userController.updatePreferences);

export default router;
