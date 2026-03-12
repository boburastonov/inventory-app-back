import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, randomInt } from "crypto";

import prisma from "../config/database";

type ElementType =
  | "fixed"
  | "random20"
  | "random32"
  | "random6"
  | "random9"
  | "guid"
  | "datetime"
  | "sequence";

interface IdElement {
  type: ElementType;
  value?: string;
  format?: string;
}

export const customIdService = {
  async generate(inventoryId: string): Promise<string> {
    const formatConfig = await prisma.customIdFormat.findUnique({
      where: { inventoryId },
    });

    if (
      !formatConfig ||
      !Array.isArray(formatConfig.elements) ||
      formatConfig.elements.length === 0
    ) {
      const seq = await getNextSequence(inventoryId);
      return String(seq);
    }

    const elements = formatConfig.elements
      .filter((el: any) => el.type)
      .map((el: any) => el as IdElement);
    const seq = elements.some((e) => e.type === "sequence")
      ? await getNextSequence(inventoryId)
      : null;

    const now = new Date();

    const parts = elements.map((el) => generatePart(el, seq, now));
    return parts.join("");
  },

  previewId(elements: IdElement[]): string {
    const now = new Date();
    const mockSeq = 42;

    return elements.map((el) => generatePart(el, mockSeq, now)).join("");
  },
};

function generatePart(el: IdElement, seq: number | null, now: Date): string {
  switch (el.type) {
    case "fixed":
      return el.value ?? "";

    case "random20": {
      const num = randomInt(0, 1048576);
      return formatNumber(num, el.format);
    }

    case "random32": {
      const buf = randomBytes(4);
      const num = buf.readUInt32BE(0);
      return formatNumber(num, el.format);
    }

    case "random6":
      return formatNumber(randomInt(0, 1000000), el.format ?? "D6");

    case "random9":
      return formatNumber(randomInt(0, 1000000000), el.format ?? "D9");

    case "guid":
      return uuidv4();

    case "datetime":
      return format(now, el.format ?? "yyyyMMdd");

    case "sequence":
      return formatNumber(seq ?? 1, el.format ?? "D1");

    default:
      return "";
  }
}

function formatNumber(num: number, fmt?: string): string {
  if (!fmt) return String(num);

  const type = fmt[0]?.toUpperCase();
  const length = parseInt(fmt.slice(1)) || 0;

  if (type === "X") {
    return num.toString(16).toUpperCase().padStart(length, "0");
  }
  return String(num).padStart(length, "0");
}

async function getNextSequence(inventoryId: string): Promise<number> {
  const last = await prisma.item.findFirst({
    where: { inventoryId },
    orderBy: { createdAt: "desc" },
    select: { customId: true },
  });

  const count = await prisma.item.count({ where: { inventoryId } });
  return count + 1;
}
