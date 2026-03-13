import { Request, Response, NextFunction } from "express";

import prisma from "../config/database";
import { customIdService } from "../services/customId.service";

export const customIdController = {
  async save(req: Request, res: Response, next: NextFunction) {
    try {
      const { inventoryId } = req.params;
      const { elements } = req.body;

      const format = await prisma.customIdFormat.upsert({
        where: { inventoryId: inventoryId as string },
        update: { elements },
        create: { inventoryId: inventoryId as string, elements },
      });

      res.json(format);
    } catch (err) {
      next(err);
    }
  },

  async preview(req: Request, res: Response, next: NextFunction) {
    try {
      const { elements } = req.query;
      const parsed = JSON.parse(elements as string);
      const preview = customIdService.previewId(parsed);
      res.json({ preview });
    } catch (err) {
      next(err);
    }
  },
};
