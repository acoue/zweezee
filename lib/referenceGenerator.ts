import type {
  ActionType,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/prisma";


const actionPrefixes: Record<
  ActionType,
  string
> = {
  ACTION: "ACT",
  TASK: "TSK",
  BUG: "BUG",
  INCIDENT: "INC",
  EVOLUTION: "EVO",
  JALON: "JAL",
};


/**
 * Génère une référence pour une action.
 *
 * Exemples :
 *
 * ACTION    -> ACT-0001
 * TASK      -> TSK-0001
 * BUG       -> BUG-0001
 * INCIDENT  -> INC-0001
 * EVOLUTION -> EVO-0001
 * JALON     -> JAL-0001
 */
export async function generateActionReference(
  type: ActionType
): Promise<string> {
  const prefix =
    actionPrefixes[type];

  const actions =
    await prisma.action.findMany({
      where: {
        type,
      },

      select: {
        reference: true,
      },
    });

  const numbers =
    actions
      .map(
        (action) =>
          action.reference
      )
      .filter(
        (reference) =>
          reference.startsWith(
            `${prefix}-`
          )
      )
      .map((reference) => {
        const value =
          reference.substring(
            prefix.length + 1
          );

        return Number.parseInt(
          value,
          10
        );
      })
      .filter(
        (value) =>
          !Number.isNaN(value)
      );

  const nextNumber =
    numbers.length === 0
      ? 1
      : Math.max(...numbers) + 1;

  return `${prefix}-${String(
    nextNumber
  ).padStart(4, "0")}`;
}


/**
 * Génère une référence pour un risque.
 *
 * Exemples :
 *
 * RIS-0001
 * RIS-0002
 * ...
 */
export async function generateRiskReference(): Promise<string> {
  const prefix = "RIS";

  const risks =
    await prisma.risk.findMany({
      select: {
        reference: true,
      },
    });

  const numbers =
    risks
      .map(
        (risk) =>
          risk.reference
      )
      .filter(
        (reference) =>
          reference.startsWith(
            `${prefix}-`
          )
      )
      .map((reference) => {
        const value =
          reference.substring(
            prefix.length + 1
          );

        return Number.parseInt(
          value,
          10
        );
      })
      .filter(
        (value) =>
          !Number.isNaN(value)
      );

  const nextNumber =
    numbers.length === 0
      ? 1
      : Math.max(...numbers) + 1;

  return `${prefix}-${String(
    nextNumber
  ).padStart(4, "0")}`;
}