import type { ReactNode } from "react";
import type { SerializedElement, SerializedProject } from "@/lib/serialization";
import { ElementSidebar } from "@/components/element-sidebar";

type AppShellProps = {
  elements: SerializedElement[];
  projects: SerializedProject[];
  currentElementId?: string;
  children: ReactNode;
  rightPanel: ReactNode;
};

export function AppShell({
  elements,
  projects,
  currentElementId,
  children,
  rightPanel,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex h-screen w-full flex-col px-6 py-6">
        <div className="grid h-[calc(100vh-48px)] grid-cols-1 grid-rows-[minmax(0,1fr)] gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <ElementSidebar
            elements={elements}
            projects={projects}
            currentElementId={currentElementId}
          />
          <main className="h-full min-h-0 overflow-y-auto rounded-2xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur">
            {children}
          </main>
          <aside className="h-full min-h-0 overflow-y-auto rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur">
            {rightPanel}
          </aside>
        </div>
      </div>
    </div>
  );
}
