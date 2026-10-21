import App from "@/components/App";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [
    projects,
    actions,
    risks,
    timesheets,
  ] = await Promise.all([
    prisma.project.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.action.findMany({
      include: {
        project: true,
      },

      orderBy: [
        {
          dueDate: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    }),

    prisma.risk.findMany({
      include: {
        project: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.timesheetEntry.findMany({
      include: {
        project: true,

        action: {
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
  ]);

  const data = JSON.parse(
    JSON.stringify({
      projects,
      actions,
      risks,
      timesheets,
    })
  );

  return <App initial={data} />;
}