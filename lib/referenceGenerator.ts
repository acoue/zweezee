import { prisma } from "@/lib/prisma";

export type ReferenceType =
  | "action"
  | "risk"
  | "milestone"
  | "event"
  | "bug"
  | "incident"
  | "evolution"
  | "task";

const prefixes: Record<ReferenceType, string> = {
  action: "ACT",
  risk: "RIS",
  milestone: "JAL",
  event: "EVT",
  bug: "BUG",
  incident: "INC",
  evolution: "EVO",
  task: "TSK",
};

export async function generateReference(
  type: ReferenceType
): Promise<string> {
  const prefix = prefixes[type];

  let references: string[] = [];

  switch (type) {
    case "action": {
      const rows = await prisma.action.findMany({
        select: { reference: true },
      });

      references = rows.map((row) => row.reference);
      break;
    }

    case "risk": {
      const rows = await prisma.risk.findMany({
        select: { reference: true },
      });

      references = rows.map((row) => row.reference);
      break;
    }

    case "milestone": {
      const rows = await prisma.milestone.findMany({
        select: { reference: true },
      });

      references = rows.map((row) => row.reference);
      break;
    }

    case "event": {
      const rows = await prisma.event.findMany({
        select: { reference: true },
      });

      references = rows.map((row) => row.reference);
      break;
    }
    case "bug":
    case "incident":
    case "evolution":
    case "task": {
      const rows = await prisma.workItem.findMany({
        select: {
          reference: true,
        },
      });

      references = rows
        .map((row) => row.reference)
        .filter(
          (reference): reference is string =>
            reference !== null
        );

      break;
    }
  }

  const numbers = references
    .filter((reference) => reference.startsWith(`${prefix}-`))
    .map((reference) => {
      const value = reference.substring(prefix.length + 1);
      return Number.parseInt(value, 10);
    })
    .filter((value) => !Number.isNaN(value));

  const nextNumber =
    numbers.length === 0
      ? 1
      : Math.max(...numbers) + 1;

  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}