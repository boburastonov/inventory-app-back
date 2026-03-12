import { Router } from "express";

import { searchController } from "../controllers/search.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get("/", searchController.search);
router.get("/users", isAuthenticated, searchController.searchUsers);

export default router;
