import { Request, Response, NextFunction } from "express";

import { inventoryService } from "../services/inventory.service";

export const inventoryController = {
  async getLatest(req: Request, res: Response, next: NextFunction) {
    try {
      const inventories = await inventoryService.getLatest();
      res.json(inventories);
    } catch (err) {
      next(err);
    }
  },

  async getTop5(req: Request, res: Response, next: NextFunction) {
    try {
      const inventories = await inventoryService.getTop5();
      res.json(inventories);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.getById(req.params.inventoryId);
      if (!inventory) return res.status(404).json({ message: "notFound" });
      res.json(inventory);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const inventory = await inventoryService.create(user.id, req.body);
      res.status(201).json(inventory);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { version, ...data } = req.body;
      if (version === undefined) {
        return res.status(400).json({ message: "versionRequired" });
      }
      const inventory = await inventoryService.update(
        req.params.inventoryId,
        version,
        data,
      );
      res.json(inventory);
    } catch (err: any) {
      if (err.message === "versionConflict") {
        return res.status(409).json({ message: "versionConflict" });
      }
      if (err.message === "notFound") {
        return res.status(404).json({ message: "notFound" });
      }
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await inventoryService.delete(req.params.inventoryId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getMy(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const inventories = await inventoryService.getByOwner(user.id);
      res.json(inventories);
    } catch (err) {
      next(err);
    }
  },

  async getAccessible(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const inventories = await inventoryService.getAccessible(user.id);
      res.json(inventories);
    } catch (err) {
      next(err);
    }
  },

  async addAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      await inventoryService.addAccess(req.params.inventoryId, userId);
      res.status(201).json({ message: "accessGranted" });
    } catch (err) {
      next(err);
    }
  },

  async removeAccess(req: Request, res: Response, next: NextFunction) {
    try {
      await inventoryService.removeAccess(
        req.params.inventoryId,
        req.params.userId,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await inventoryService.getStats(req.params.inventoryId);
      res.json(stats);
    } catch (err: any) {
      if (err.message === "notFound") {
        return res.status(404).json({ message: "notFound" });
      }
      next(err);
    }
  },

  async searchTags(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const tags = await inventoryService.searchTags(q);
      res.json(tags);
    } catch (err) {
      next(err);
    }
  },

  async getByTag(req: Request, res: Response, next: NextFunction) {
    try {
      const inventories = await inventoryService.getByTag(req.params.tagName);
      res.json(inventories);
    } catch (err) {
      next(err);
    }
  },
};
