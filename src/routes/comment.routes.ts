import { Router } from "express";

import { commentController } from "../controllers/comment.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/", commentController.getByInventory);
router.post("/", isAuthenticated, commentController.create);

export default router;
