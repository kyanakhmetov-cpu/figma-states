import type {
  ElementState,
  ElementStateType,
  FigmaElement,
  Project,
} from "@prisma/client";
import type { Lang } from "@/lib/i18n";
import { stateTypeLabel } from "@/lib/i18n";

export type SerializedElement = {
  id: string;
  title: string;
  figmaUrl: string;
  figmaFileKey?: string | null;
  figmaNodeId?: string | null;
  imagePath: string;
  imageName: string;
  imageType: string;
  imageSize: number;
  projectId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedProject = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SerializedState = {
  id: string;
  elementId: string;
  type: ElementStateType;
  title: string;
  message: string;
  condition?: string | null;
  severity?: string | null;
  locale: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export const STATE_TYPE_LABELS: Record<ElementStateType, string> = {
  error: "Error",
  warning: "Warning",
  success: "Success",
  info: "Info",
  helper: "Helper",
  empty: "Empty",
  accessibility: "Accessibility",
  other: "Other",
};

export const STATE_TYPE_STYLES: Record<
  ElementStateType,
  {
    className: string;
    dot: string;
    card: string;
    select: string;
    filter: { active: string; inactive: string };
  }
> = {
  error: {
    className: "border-red-200 bg-red-500/10 text-red-700",
    dot: "bg-red-500",
    card: "border-l-red-400",
    select: "border-red-200 bg-red-500/10 text-red-700",
    filter: {
      active: "border-red-200 bg-red-500/10 text-red-700",
      inactive: "border-red-200 text-red-700/80 hover:bg-red-500/10",
    },
  },
  warning: {
    className: "border-amber-200 bg-amber-500/10 text-amber-700",
    dot: "bg-amber-500",
    card: "border-l-amber-400",
    select: "border-amber-200 bg-amber-500/10 text-amber-700",
    filter: {
      active: "border-amber-200 bg-amber-500/10 text-amber-700",
      inactive: "border-amber-200 text-amber-700/80 hover:bg-amber-500/10",
    },
  },
  success: {
    className: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
    dot: "bg-emerald-500",
    card: "border-l-emerald-400",
    select: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
    filter: {
      active: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
      inactive: "border-emerald-200 text-emerald-700/80 hover:bg-emerald-500/10",
    },
  },
  info: {
    className: "border-sky-200 bg-sky-500/10 text-sky-700",
    dot: "bg-sky-500",
    card: "border-l-sky-400",
    select: "border-sky-200 bg-sky-500/10 text-sky-700",
    filter: {
      active: "border-sky-200 bg-sky-500/10 text-sky-700",
      inactive: "border-sky-200 text-sky-700/80 hover:bg-sky-500/10",
    },
  },
  helper: {
    className: "border-slate-200 bg-slate-500/10 text-slate-700",
    dot: "bg-slate-500",
    card: "border-l-slate-400",
    select: "border-slate-200 bg-slate-500/10 text-slate-700",
    filter: {
      active: "border-slate-200 bg-slate-500/10 text-slate-700",
      inactive: "border-slate-200 text-slate-700/80 hover:bg-slate-500/10",
    },
  },
  empty: {
    className: "border-zinc-200 bg-zinc-500/10 text-zinc-700",
    dot: "bg-zinc-500",
    card: "border-l-zinc-400",
    select: "border-zinc-200 bg-zinc-500/10 text-zinc-700",
    filter: {
      active: "border-zinc-200 bg-zinc-500/10 text-zinc-700",
      inactive: "border-zinc-200 text-zinc-700/80 hover:bg-zinc-500/10",
    },
  },
  accessibility: {
    className: "border-teal-200 bg-teal-500/10 text-teal-700",
    dot: "bg-teal-500",
    card: "border-l-teal-400",
    select: "border-teal-200 bg-teal-500/10 text-teal-700",
    filter: {
      active: "border-teal-200 bg-teal-500/10 text-teal-700",
      inactive: "border-teal-200 text-teal-700/80 hover:bg-teal-500/10",
    },
  },
  other: {
    className: "border-neutral-200 bg-neutral-500/10 text-neutral-700",
    dot: "bg-neutral-500",
    card: "border-l-neutral-400",
    select: "border-neutral-200 bg-neutral-500/10 text-neutral-700",
    filter: {
      active: "border-neutral-200 bg-neutral-500/10 text-neutral-700",
      inactive: "border-neutral-200 text-neutral-700/80 hover:bg-neutral-500/10",
    },
  },
};

export function serializeElement(element: FigmaElement): SerializedElement {
  return {
    id: element.id,
    title: element.title,
    figmaUrl: element.figmaUrl,
    figmaFileKey: element.figmaFileKey,
    figmaNodeId: element.figmaNodeId,
    imagePath: element.imagePath,
    imageName: element.imageName,
    imageType: element.imageType,
    imageSize: element.imageSize,
    projectId: element.projectId,
    createdAt: element.createdAt.toISOString(),
    updatedAt: element.updatedAt.toISOString(),
  };
}

export function serializeProject(project: Project): SerializedProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeState(state: ElementState): SerializedState {
  return {
    id: state.id,
    elementId: state.elementId,
    type: state.type,
    title: state.title,
    message: state.message,
    condition: state.condition,
    severity: state.severity,
    locale: state.locale,
    sortOrder: state.sortOrder,
    createdAt: state.createdAt.toISOString(),
    updatedAt: state.updatedAt.toISOString(),
  };
}

export function stateCopyText(
  state: Pick<SerializedState, "title" | "message">,
  mode: "message" | "title-message" = "message",
) {
  if (mode === "title-message" && state.title.trim().length > 0) {
    return `${state.title}: ${state.message}`;
  }
  return state.message;
}

export function serializeStatesText(states: SerializedState[], lang: Lang = "en") {
  const grouped = groupByType(states);
  const chunks: string[] = [];

  Object.entries(grouped).forEach(([type, items]) => {
    if (items.length === 0) return;
    const label =
      stateTypeLabel(lang, type as ElementStateType) ??
      STATE_TYPE_LABELS[type as ElementStateType] ??
      type;
    chunks.push(label.toUpperCase());
    items
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((state) => {
        const title = state.title?.trim();
        const line = title ? `${title}: ${state.message}` : state.message;
        chunks.push(`- ${line}`);
      });
    chunks.push("");
  });

  return chunks.join("\n").trim();
}

export function serializeStatesJSON(
  element: SerializedElement,
  states: SerializedState[],
) {
  const payload = {
    element,
    states: [...states].sort((a, b) => a.sortOrder - b.sortOrder),
  };
  return JSON.stringify(payload, null, 2);
}

function groupByType(states: SerializedState[]) {
  return states.reduce<Record<string, SerializedState[]>>((acc, state) => {
    const key = state.type ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(state);
    return acc;
  }, {});
}
