import { Request, Response, NextFunction } from "express";

import { adminService } from "../services/admin.service";

export const adminController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      const user = await adminService.setBlocked(userId, true);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      const user = await adminService.setBlocked(userId, false);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async makeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      const user = await adminService.setAdmin(userId, true);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async removeAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      const user = await adminService.setAdmin(userId, false);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: string = req.params.userId as string;
      await adminService.deleteUser(userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
