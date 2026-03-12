import prisma from "../config/database";

export const searchService = {
  async search(query: string) {
    if (!query.trim()) return { inventories: [], items: [] };

    const inventories = await prisma.$queryRaw<any[]>`
      SELECT
        i.id,
        i.title,
        i.description,
        i."imageUrl",
        i."createdAt",
        u.name AS "ownerName",
        u.id   AS "ownerId"
      FROM inventories i
      JOIN users u ON u.id = i."ownerId"
      WHERE
        to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, ''))
        @@ plainto_tsquery('english', ${query})
      ORDER BY
        ts_rank(
          to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, '')),
          plainto_tsquery('english', ${query})
        ) DESC
      LIMIT 20
    `;

    const items = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT
        it.id,
        it."customId",
        it."inventoryId",
        inv.title AS "inventoryTitle"
      FROM items it
      JOIN inventories inv ON inv.id = it."inventoryId"
      JOIN item_values iv  ON iv."itemId" = it.id
      WHERE
        to_tsvector('english', coalesce(iv.value, ''))
        @@ plainto_tsquery('english', ${query})
      LIMIT 20
    `;

    return { inventories, items };
  },

  async searchUsers(query: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  },
};
