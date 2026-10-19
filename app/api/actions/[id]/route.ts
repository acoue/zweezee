import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await req.json();
  const a = await prisma.action.update({
    where: { id },
    data: { status: b.status },
  });
  return NextResponse.json(a);
}
