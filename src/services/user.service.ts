import prisma from "../config/database";

export const userService = {
  async getById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { inventories: true } },
      },
    });
  },

  async updatePreferences(
    userId: string,
    data: {
      language?: string;
      theme?: string;
    },
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, language: true, theme: true },
    });
  },
};
