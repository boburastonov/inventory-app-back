import prisma from "../config/database";
import { customIdService } from "./customId.service.js";

export const itemService = {
  async getByInventory(inventoryId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    });
    if (!inventory) throw new Error("notFound");

    return prisma.item.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "desc" },
      include: {
        values: { include: { field: true } },
        _count: { select: { likes: true } },
      },
    });
  },

  async getById(itemId: string) {
    return prisma.item.findUnique({
      where: { id: itemId },
      include: {
        values: { include: { field: true } },
        inventory: { select: { id: true, title: true, ownerId: true } },
        _count: { select: { likes: true } },
      },
    });
  },

  async create(
    inventoryId: string,
    createdById: string,
    fieldValues: Record<string, string>,
  ) {
    const customId = await customIdService.generate(inventoryId);

    try {
      return await prisma.item.create({
        data: {
          inventoryId,
          createdById,
          customId,
          values: {
            create: Object.entries(fieldValues).map(([fieldId, value]) => ({
              fieldId,
              value: String(value),
            })),
          },
        },
        include: {
          values: { include: { field: true } },
          _count: { select: { likes: true } },
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new Error("duplicateId");
      }
      throw err;
    }
  },

  async update(
    itemId: string,
    version: number,
    customId: string | undefined,
    fieldValues: Record<string, string>,
  ) {
    const current = await prisma.item.findUnique({
      where: { id: itemId },
      select: { version: true, inventoryId: true },
    });

    if (!current) throw new Error("notFound");
    if (current.version !== version) throw new Error("versionConflict");

    try {
      return await prisma.item.update({
        where: { id: itemId },
        data: {
          ...(customId !== undefined ? { customId } : {}),
          version: { increment: 1 },
          values: {
            upsert: Object.entries(fieldValues).map(([fieldId, value]) => ({
              where: { itemId_fieldId: { itemId, fieldId } },
              update: { value: String(value) },
              create: { fieldId, value: String(value) },
            })),
          },
        },
        include: {
          values: { include: { field: true } },
          _count: { select: { likes: true } },
        },
      });
    } catch (err: any) {
      if (err.code === "P2002") throw new Error("duplicateId");
      throw err;
    }
  },

  async delete(itemId: string) {
    return prisma.item.delete({ where: { id: itemId } });
  },

  async like(itemId: string, userId: string) {
    try {
      await prisma.like.create({ data: { itemId, userId } });
    } catch (err: any) {
      if (err.code === "P2002") return;
      throw err;
    }
  },

  async unlike(itemId: string, userId: string) {
    await prisma.like.deleteMany({ where: { itemId, userId } });
  },

  async getLikeStatus(itemId: string, userId: string) {
    const like = await prisma.like.findUnique({
      where: { itemId_userId: { itemId, userId } },
    });
    const count = await prisma.like.count({ where: { itemId } });
    return { liked: !!like, count };
  },
};
