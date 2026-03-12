import { io } from "../app";
import prisma from "../config/database";

export const commentService = {
  async getByInventory(inventoryId: string) {
    return prisma.comment.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  },

  async create(inventoryId: string, authorId: string, content: string) {
    const comment = await prisma.comment.create({
      data: { inventoryId, authorId, content },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    io.to(`inventory:${inventoryId}`).emit("newComment", comment);

    return comment;
  },
};
