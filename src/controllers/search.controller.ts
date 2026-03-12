import { Request, Response, NextFunction } from "express";

import { searchService } from "../services/search.service";

export const searchController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const results = await searchService.search(q);
      res.json(results);
    } catch (err) {
      next(err);
    }
  },

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const users = await searchService.searchUsers(q);
      res.json(users);
    } catch (err) {
      next(err);
    }
  },
};
