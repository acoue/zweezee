import { prisma } from "@/lib/prisma";
import App from "@/components/App";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [projects, actions, risks, events, timesheets, milestones, workItems] =
    await Promise.all([
      prisma.project.findMany(),

      prisma.action.findMany({
        include: {
          project: true,
        },
      }),

      prisma.risk.findMany({
        include: {
          project: true,
        },
      }),

      prisma.event.findMany({
        include: {
          project: true,
        },
      }),

      prisma.timesheetEntry.findMany({
        include: {
          project: true,

          workItem: {
            select: {
              id: true,
              reference: true,
              title: true,
              type: true,
            },
          },
        },

        orderBy: [
          {
            date: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),

      prisma.milestone.findMany({
        include: {
          project: true,
        },
      }),

      prisma.workItem.findMany({
        include: {
          project: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  return (
    <App
      initial={JSON.parse(
        JSON.stringify({
          projects,
          actions,
          risks,
          events,
          timesheets,
          milestones,
          workItems,
        }),
      )}
    />
  );
}
