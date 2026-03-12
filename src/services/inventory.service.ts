import prisma from "../config/database";

export const inventoryService = {
  async getLatest() {
    return prisma.inventory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        owner: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true } },
        tags: { select: { tag: { select: { id: true, name: true } } } },
        _count: { select: { items: true } },
      },
    });
  },

  async getTop5() {
    return prisma.inventory.findMany({
      orderBy: { items: { _count: "desc" } },
      take: 5,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        owner: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },

  async getById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        category: true,
        tags: { include: { tag: true } },
        fields: { orderBy: { sortOrder: "asc" } },
        accesses: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        customIdFormat: true,
        _count: { select: { items: true, comments: true } },
      },
    });
  },

  async create(
    ownerId: string,
    data: {
      title: string;
      description?: string;
      imageUrl?: string;
      isPublic?: boolean;
      categoryId?: number;
      tagNames?: string[];
    },
  ) {
    const { tagNames = [], ...rest } = data;

    return prisma.inventory.create({
      data: {
        ...rest,
        ownerId,
        tags: {
          create: await resolveTagConnections(tagNames),
        },
      },
      include: {
        owner: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  },

  async update(
    id: string,
    version: number,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      isPublic?: boolean;
      categoryId?: number;
      tagNames?: string[];
    },
  ) {
    const { tagNames, ...rest } = data;

    const current = await prisma.inventory.findUnique({
      where: { id },
      select: { version: true },
    });

    if (!current) throw new Error("notFound");
    if (current.version !== version) throw new Error("versionConflict");

    const tagsUpdate =
      tagNames !== undefined
        ? {
            tags: {
              deleteMany: {},
              create: await resolveTagConnections(tagNames),
            },
          }
        : {};

    return prisma.inventory.update({
      where: { id },
      data: {
        ...rest,
        ...tagsUpdate,
        version: { increment: 1 },
      },
      include: {
        owner: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
        fields: { orderBy: { sortOrder: "asc" } },
      },
    });
  },

  async delete(id: string) {
    return prisma.inventory.delete({ where: { id } });
  },

  async getByOwner(ownerId: string) {
    return prisma.inventory.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });
  },

  async getAccessible(userId: string) {
    return prisma.inventory.findMany({
      where: {
        accesses: { some: { userId } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        owner: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },

  async addAccess(inventoryId: string, userId: string) {
    return prisma.inventoryAccess.create({
      data: { inventoryId, userId },
    });
  },

  async removeAccess(inventoryId: string, userId: string) {
    return prisma.inventoryAccess.delete({
      where: { inventoryId_userId: { inventoryId, userId } },
    });
  },

  async getStats(inventoryId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { fields: true },
    });
    if (!inventory) throw new Error("notFound");

    const totalItems = await prisma.item.count({ where: { inventoryId } });

    const numericFields = inventory.fields.filter(
      (f) => f.fieldType === "NUMBER",
    );
    const numericStats = await Promise.all(
      numericFields.map(async (field) => {
        const values = await prisma.itemValue.findMany({
          where: { fieldId: field.id, value: { not: null } },
          select: { value: true },
        });
        const nums = values
          .map((v) => parseFloat(v.value!))
          .filter((n) => !isNaN(n));

        if (nums.length === 0)
          return { field, min: null, max: null, avg: null };

        const sum = nums.reduce((a, b) => a + b, 0);
        return {
          field: { id: field.id, title: field.title },
          min: Math.min(...nums),
          max: Math.max(...nums),
          avg: sum / nums.length,
        };
      }),
    );

    const stringFields = inventory.fields.filter(
      (f) => f.fieldType === "TEXT_SINGLE" || f.fieldType === "TEXT_MULTI",
    );
    const stringStats = await Promise.all(
      stringFields.map(async (field) => {
        const values = await prisma.itemValue.groupBy({
          by: ["value"],
          where: { fieldId: field.id, value: { not: null } },
          _count: { value: true },
          orderBy: { _count: { value: "desc" } },
          take: 5,
        });
        return {
          field: { id: field.id, title: field.title },
          topValues: values.map((v) => ({
            value: v.value,
            count: v._count.value,
          })),
        };
      }),
    );

    return { totalItems, numericStats, stringStats };
  },

  async searchTags(query: string) {
    return prisma.tag.findMany({
      where: { name: { startsWith: query, mode: "insensitive" } },
      take: 10,
      select: { id: true, name: true },
    });
  },

  async getByTag(tagName: string) {
    return prisma.inventory.findMany({
      where: {
        tags: { some: { tag: { name: tagName } } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        createdAt: true,
        owner: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    });
  },
};

async function resolveTagConnections(tagNames: string[]) {
  return Promise.all(
    tagNames.map(async (name) => {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      return { tagId: tag.id };
    }),
  );
}
