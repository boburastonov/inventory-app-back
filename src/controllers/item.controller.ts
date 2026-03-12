import { Request, Response, NextFunction } from "express";

import { itemService } from "../services/item.service";

export const itemController = {
  async getByInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const inventoryId: string = req.params.inventoryId as string;
      const items = await itemService.getByInventory(inventoryId);
      res.json(items);
    } catch (err: any) {
      if (err.message === "notFound")
        return res.status(404).json({ message: "notFound" });
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId: string = req.params.itemId as string;
      const item = await itemService.getById(itemId);
      if (!item) return res.status(404).json({ message: "notFound" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const { fieldValues = {} } = req.body;
      const inventoryId: string = req.params.inventoryId as string;
      const item = await itemService.create(inventoryId, user.id, fieldValues);
      res.status(201).json(item);
    } catch (err: any) {
      if (err.message === "duplicateId") {
        return res.status(409).json({ message: "duplicateId" });
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { version, customId, fieldValues = {} } = req.body;
      if (version === undefined) {
        return res.status(400).json({ message: "versionRequired" });
      }

      const itemId: string = req.params.itemId as string;
      const item = await itemService.update(
        itemId,
        version,
        customId,
        fieldValues,
      );
      res.json(item);
    } catch (err: any) {
      if (err.message === "versionConflict") {
        return res.status(409).json({ message: "versionConflict" });
      }
      if (err.message === "duplicateId") {
        return res.status(409).json({ message: "duplicateId" });
      }
      if (err.message === "notFound") {
        return res.status(404).json({ message: "notFound" });
      }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId: string = req.params.itemId as string;
      await itemService.delete(itemId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async like(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const itemId: string = req.params.itemId as string;
      await itemService.like(itemId, user.id);
      res.json({ message: "liked" });
    } catch (err) {
      next(err);
    }
  },

  async unlike(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const itemId: string = req.params.itemId as string;
      await itemService.unlike(itemId, user.id);
      res.json({ message: "unliked" });
    } catch (err) {
      next(err);
    }
  },

  async getLikeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const itemId: string = req.params.itemId as string;
      const status = await itemService.getLikeStatus(itemId, user?.id);
      res.json(status);
    } catch (err) {
      next(err);
    }
  },
};
