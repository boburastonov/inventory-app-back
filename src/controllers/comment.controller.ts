import { Request, Response, NextFunction } from "express";

import { commentService } from "../services/comment.service";

export const commentController = {
  async getByInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryId: string = req.params.inventoryId as string;
      const comments = await commentService.getByInventory(inventoryId);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const { content } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ message: "contentRequired" });
      }

      const inventoryId: string = req.params.inventoryId as string;
      const comment = await commentService.create(
        inventoryId,
        user.id,
        content.trim(),
      );
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  },
};
