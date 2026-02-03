import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeElement } from "@/lib/serialization";
import { storeUpload } from "@/lib/upload";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  if (!resolvedParams?.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!image || !(image instanceof File)) {
    return NextResponse.json(
      { error: "Image upload is required." },
      { status: 400 },
    );
  }

  const existing = await prisma.figmaElement.findUnique({
    where: { id: resolvedParams.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const stored = await storeUpload(image);
    const updated = await prisma.figmaElement.update({
      where: { id: resolvedParams.id },
      data: {
        imagePath: stored.path,
        imageName: stored.name,
        imageType: stored.type,
        imageSize: stored.size,
      },
    });

    return NextResponse.json(serializeElement(updated));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
