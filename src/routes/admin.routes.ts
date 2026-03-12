import { Router } from "express";

import { adminController } from "../controllers/admin.controller";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get("/users", adminController.getAllUsers);
router.patch("/users/:userId/block", adminController.blockUser);
router.patch("/users/:userId/unblock", adminController.unblockUser);
router.patch("/users/:userId/make-admin", adminController.makeAdmin);
router.patch("/users/:userId/remove-admin", adminController.removeAdmin);
router.delete("/users/:userId", adminController.deleteUser);

export default router;
