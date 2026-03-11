import passport from "passport";
import { Request, Response, NextFunction } from "express";

import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  getMe(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ message: "unauthorized" });
    res.json(req.user);
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ message: "missingFields" });
      }

      await authService.register(email, password, name);

      res.status(201).json({ message: "emailSent" });
    } catch (err: any) {
      if (err.message === "emailAlreadyExists") {
        return res.status(409).json({ message: err.message });
      }
      next(err);
    }
  },

  login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ message: info?.message || "invalidCredentials" });

      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  },

  logout(req: Request, res: Response, next: NextFunction) {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "loggedOut" });
    });
  },

  googleAuth: passport.authenticate("google", {
    scope: ["profile", "email"],
  }),

  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", (err: any, user: any) => {
      if (err || !user) {
        return res.redirect(`${env.CLIENT_URL}/login?error=google_failed`);
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        res.redirect(env.CLIENT_URL);
      });
    })(req, res, next);
  },

  async confirmEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query as { token: string };
      if (!token) return res.status(400).json({ message: "missingToken" });

      await authService.confirmEmail(token);
      res.redirect(`${env.CLIENT_URL}/login?verified=true`);
    } catch (err: any) {
      if (err.message === "invalidOrExpiredToken") {
        return res.redirect(`${env.CLIENT_URL}/login?error=invalidToken`);
      }
      next(err);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.resendVerification(email);
      res.json({ message: "emailSent" });
    } catch (err) {
      next(err);
    }
  },
};
