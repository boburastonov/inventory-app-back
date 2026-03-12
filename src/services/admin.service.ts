import prisma from "../config/database";

export const adminService = {
  async getAllUsers() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isBlocked: true,
        emailVerified: true,
        createdAt: true,
        googleId: true,
        _count: { select: { inventories: true } },
      },
    });
  },

  async setBlocked(userId: string, isBlocked: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
  },

  async setAdmin(userId: string, isAdmin: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
  },

  async deleteUser(userId: string) {
    return prisma.user.delete({ where: { id: userId } });
  },
};
