import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stateCreateSchema } from "@/lib/validators";
import { serializeState } from "@/lib/serialization";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Element not found." }, { status: 404 });
  }
  const body = await request.json();
  const parsed = stateCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const element = await prisma.figmaElement.findUnique({
    where: { id: resolvedParams.id },
  });
  if (!element) {
    return NextResponse.json({ error: "Element not found." }, { status: 404 });
  }

  const maxOrder = await prisma.elementState.aggregate({
    where: { elementId: element.id },
    _max: { sortOrder: true },
  });
  const sortOrder =
    parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1;

  const state = await prisma.elementState.create({
    data: {
      elementId: element.id,
      type: parsed.data.type,
      title: parsed.data.title,
      message: parsed.data.message,
      condition: parsed.data.condition ?? null,
      severity: parsed.data.severity ?? null,
      locale: parsed.data.locale ?? "en",
      sortOrder,
    },
  });

  return NextResponse.json(serializeState(state));
}
