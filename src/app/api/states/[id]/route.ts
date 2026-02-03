import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stateUpdateSchema } from "@/lib/validators";
import { serializeState } from "@/lib/serialization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const body = await request.json();
  const parsed = stateUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const state = await prisma.elementState.update({
      where: { id: resolvedParams.id },
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        message: parsed.data.message,
        condition: parsed.data.condition ?? undefined,
        severity: parsed.data.severity ?? undefined,
        locale: parsed.data.locale,
        sortOrder: parsed.data.sortOrder,
      },
    });
    return NextResponse.json(serializeState(state));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update state." },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    await prisma.elementState.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete state." },
      { status: 500 },
    );
  }
}
