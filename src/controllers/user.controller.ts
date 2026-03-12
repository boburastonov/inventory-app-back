import { Request, Response, NextFunction } from "express";

import { userService } from "../services/user.service";

export const userController = {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      const user = await userService.getById(userId);
      if (!user) return res.status(404).json({ message: "notFound" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const { language, theme } = req.body;
      const updated = await userService.updatePreferences(user.id, {
        language,
        theme,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};
