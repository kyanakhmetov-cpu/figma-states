import { prisma } from "@/lib/db";
import { serializeElement, serializeProject } from "@/lib/serialization";
import { AppShell } from "@/components/app-shell";
import { NewElementForm } from "@/components/new-element-form";
import { NewElementPanel } from "@/components/new-element-panel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [elements, projects] = await Promise.all([
    prisma.figmaElement.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.project.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <AppShell
      elements={elements.map(serializeElement)}
      projects={projects.map(serializeProject)}
      rightPanel={<NewElementPanel />}
    >
      <NewElementForm projects={projects.map(serializeProject)} />
    </AppShell>
  );
}
