// src/services/field.service.ts
import { FieldType } from "@prisma/client";

import prisma from "../config/database";

const FIELD_LIMITS: Record<FieldType, number> = {
  TEXT_SINGLE: 3,
  TEXT_MULTI: 3,
  NUMBER: 3,
  BOOLEAN: 3,
  LINK: 3,
};

export const fieldService = {
  async create(
    inventoryId: string,
    data: {
      title: string;
      description?: string;
      fieldType: FieldType;
      showInTable?: boolean;
    },
  ) {
    const count = await prisma.inventoryField.count({
      where: { inventoryId, fieldType: data.fieldType },
    });

    if (count >= FIELD_LIMITS[data.fieldType]) {
      throw new Error(`limitReached:${FIELD_LIMITS[data.fieldType]}`);
    }

    const last = await prisma.inventoryField.findFirst({
      where: { inventoryId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    return prisma.inventoryField.create({
      data: {
        ...data,
        inventoryId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  },

  async update(
    fieldId: string,
    data: {
      title?: string;
      description?: string;
      showInTable?: boolean;
    },
  ) {
    return prisma.inventoryField.update({
      where: { id: fieldId },
      data,
    });
  },

  async delete(fieldId: string) {
    return prisma.inventoryField.delete({ where: { id: fieldId } });
  },

  async reorder(inventoryId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.inventoryField.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  },
};
