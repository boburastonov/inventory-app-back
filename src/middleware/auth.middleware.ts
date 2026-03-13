import { Request, Response, NextFunction } from "express";

import prisma from "../config/database";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "unauthorized" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user as any;
  if (req.isAuthenticated() && user?.isAdmin) return next();
  res.status(403).json({ message: "forbidden" });
}

export async function isInventoryOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user as any;
    const { inventoryId } = req.params;

    if (user?.isAdmin) return next();

    const inventory = await prisma.inventory.findUnique({
      where: { id: req.params.inventoryId as string },
      select: { ownerId: true },
    });

    if (!inventory) return res.status(404).json({ message: "notFound" });
    if (inventory.ownerId !== user?.id)
      return res.status(403).json({ message: "forbidden" });

    next();
  } catch (err) {
    next(err);
  }
}

export async function hasWriteAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = req.user as any;
    const { inventoryId } = req.params;

    if (user?.isAdmin) return next();

    const inventory = await prisma.inventory.findUnique({
      where: { id: req.params.inventoryId as string },
      select: {
        ownerId: true,
        isPublic: true,
      },
    });

    if (!inventory) return res.status(404).json({ message: "notFound" });

    if (inventory.ownerId === user?.id) return next();

    if (inventory.isPublic && req.isAuthenticated()) return next();

    const access = await prisma.inventoryAccess.findUnique({
      where: {
        inventoryId_userId: {
          inventoryId: req.params.inventoryId as string,
          userId: user?.id,
        },
      },
    });

    if (access) return next();

    res.status(403).json({ message: "forbidden" });
  } catch (err) {
    next(err);
  }
}
