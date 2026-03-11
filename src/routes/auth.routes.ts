import { Router } from "express";

import { authController } from "../controllers/auth.controller.js";

const router = Router();

router.get("/me", authController.getMe);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/resend-verification", authController.resendVerification);
router.get("/confirm-email", authController.confirmEmail);

router.get("/google", authController.googleAuth);
router.get("/google/callback", authController.googleCallback);

export default router;
