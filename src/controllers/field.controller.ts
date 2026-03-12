import { Request, Response, NextFunction } from "express";

import { fieldService } from "../services/field.service";

export const fieldController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryId: string = req.params.inventoryId as string;
      const field = await fieldService.create(inventoryId, req.body);
      res.status(201).json(field);
    } catch (err: any) {
      if (err.message?.startsWith("limitReached")) {
        const max = err.message.split(":")[1];
        return res.status(400).json({ message: "limitReached", max });
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const fieldId: string = req.params.fieldId as string;
      const field = await fieldService.update(fieldId, req.body);
      res.json(field);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const fieldId: string = req.params.fieldId as string;

      await fieldService.delete(fieldId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = req.body;
      const inventoryId: string = req.params.inventoryId as string;
      await fieldService.reorder(inventoryId, orderedIds);
      res.json({ message: "reordered" });
    } catch (err) {
      next(err);
    }
  },
};
