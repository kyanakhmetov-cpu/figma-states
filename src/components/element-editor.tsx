"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Link2,
  Plus,
  PencilLine,
  Trash2,
  FileKey,
  Hash,
  X,
  Search,
} from "lucide-react";
import type { SerializedElement, SerializedState } from "@/lib/serialization";
import { STATE_TYPE_STYLES } from "@/lib/serialization";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StateCard } from "@/components/state-card";
import { useLang } from "@/components/lang-provider";
import { stateTypeLabel } from "@/lib/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type ElementEditorProps = {
  element: SerializedElement;
  states: SerializedState[];
};

type FilterValue = SerializedState["type"];

export function ElementEditor({ element, states }: ElementEditorProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const [title, setTitle] = useState(element.title);
  const [figmaUrl, setFigmaUrl] = useState(element.figmaUrl);
  const [stateList, setStateList] = useState<SerializedState[]>(
    [...states].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [selectedTypes, setSelectedTypes] = useState<FilterValue[]>([]);
  const [query, setQuery] = useState("");
  const [focusStateId, setFocusStateId] = useState<string | null>(null);
  const stateTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingCount = useRef(0);
  const [editOpen, setEditOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(element.title);
  const [draftFigmaUrl, setDraftFigmaUrl] = useState(element.figmaUrl);

  const filterOptions = useMemo(
    () => [
      { value: "error", label: stateTypeLabel(lang, "error") },
      { value: "warning", label: stateTypeLabel(lang, "warning") },
      { value: "success", label: stateTypeLabel(lang, "success") },
      { value: "info", label: stateTypeLabel(lang, "info") },
      { value: "helper", label: stateTypeLabel(lang, "helper") },
      { value: "empty", label: stateTypeLabel(lang, "empty") },
      { value: "accessibility", label: stateTypeLabel(lang, "accessibility") },
      { value: "other", label: stateTypeLabel(lang, "other") },
    ],
    [lang],
  );

  const stateCounts = useMemo(() => {
    const counts: Record<FilterValue, number> = {
      error: 0,
      warning: 0,
      success: 0,
      info: 0,
      helper: 0,
      empty: 0,
      accessibility: 0,
      other: 0,
    };
    stateList.forEach((state) => {
      counts[state.type] += 1;
    });
    return counts;
  }, [stateList]);

  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = selectedTypes.length > 0 || normalizedQuery.length > 0;

  const filteredStates = useMemo(() => {
    let next = stateList;
    if (selectedTypes.length > 0) {
      next = next.filter((state) => selectedTypes.includes(state.type));
    }
    if (normalizedQuery.length > 0) {
      next = next.filter((state) => {
        const haystack = [
          state.title,
          state.message,
          state.condition ?? "",
          state.severity ?? "",
          state.locale ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
    return next;
  }, [normalizedQuery, selectedTypes, stateList]);

  const runSave = async (
    fn: () => Promise<void>,
    options?: { onError?: (error: unknown) => void },
  ) => {
    pendingCount.current += 1;
    try {
      await fn();
    } catch (error) {
      console.error(error);
      if (options?.onError) {
        options.onError(error);
      } else {
        toast.error(t("editor.toast.autosaveFailed"));
      }
    } finally {
      pendingCount.current -= 1;
    }
  };

  const scheduleStateSave = (id: string, patch: Partial<SerializedState>) => {
    const existing = stateTimers.current.get(id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      runSave(async () => {
        const response = await fetch(`/api/states/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!response.ok) {
          throw new Error("Failed to save state.");
        }
      });
    }, 500);
    stateTimers.current.set(id, timer);
  };

  const createState = useCallback(async () => {
    try {
      const response = await fetch(`/api/elements/${element.id}/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "info",
          title: t("editor.defaultStateTitle"),
          message: t("editor.defaultStateMessage"),
          sortOrder: stateList.length + 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create state.");
      }
      const payload = (await response.json()) as SerializedState;
      setStateList((prev) => [...prev, payload]);
      setFocusStateId(payload.id);
      setTimeout(() => setFocusStateId(null), 800);
      toast.success(t("editor.toast.addStateSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("editor.toast.addStateError"));
    }
  }, [element.id, stateList.length, t]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        createState();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [createState]);

  const updateState = (id: string, patch: Partial<SerializedState>) => {
    setStateList((prev) =>
      prev.map((state) => (state.id === id ? { ...state, ...patch } : state)),
    );
    scheduleStateSave(id, patch);
  };

  const moveState = (id: string, direction: "up" | "down") => {
    setStateList((prev) => {
      const index = prev.findIndex((state) => state.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      const withOrder = next.map((state, idx) => ({
        ...state,
        sortOrder: idx + 1,
      }));
      scheduleStateSave(withOrder[index].id, {
        sortOrder: withOrder[index].sortOrder,
      });
      scheduleStateSave(withOrder[targetIndex].id, {
        sortOrder: withOrder[targetIndex].sortOrder,
      });
      return withOrder;
    });
  };

  const deleteState = async (id: string) => {
    try {
      const response = await fetch(`/api/states/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete state.");
      }
      setStateList((prev) => prev.filter((state) => state.id !== id));
      toast.success(t("editor.toast.deleteStateSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("editor.toast.deleteStateError"));
    }
  };

  const duplicateState = async (id: string) => {
    const existing = stateList.find((state) => state.id === id);
    if (!existing) return;
    try {
      const response = await fetch(`/api/elements/${element.id}/states`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: existing.type,
          title: `${existing.title} (copy)`,
          message: existing.message,
          condition: existing.condition,
          severity: existing.severity,
          locale: existing.locale,
          sortOrder: stateList.length + 1,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to duplicate state.");
      }
      const payload = (await response.json()) as SerializedState;
      setStateList((prev) => [...prev, payload]);
      toast.success(t("editor.toast.duplicateStateSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("editor.toast.duplicateStateError"));
    }
  };

  const deleteElement = async () => {
    try {
      const response = await fetch(`/api/elements/${element.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete element.");
      }
      toast.success(t("editor.toast.elementDeleted"));
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error(t("editor.toast.elementDeleteError"));
    }
  };

  const canSaveMeta =
    draftTitle.trim().length > 0 &&
    draftFigmaUrl.trim().length > 0 &&
    (draftTitle.trim() !== title || draftFigmaUrl.trim() !== figmaUrl);

  const saveElementMeta = async () => {
    const nextTitle = draftTitle.trim();
    const nextFigmaUrl = draftFigmaUrl.trim();
    if (!nextTitle) {
      toast.error(t("editor.toast.titleRequired"));
      return;
    }
    if (!nextFigmaUrl) {
      toast.error(t("editor.toast.figmaRequired"));
      return;
    }

    await runSave(
      async () => {
        const response = await fetch(`/api/elements/${element.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: nextTitle,
            figmaUrl: nextFigmaUrl,
          }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Failed to save element.");
        }
        setTitle(nextTitle);
        setFigmaUrl(nextFigmaUrl);
        setEditOpen(false);
        router.refresh();
      },
      {
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : t("editor.toast.saveElementError"),
          );
        },
      },
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {title}
              </h1>
              <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                  setEditOpen(open);
                  if (open) {
                    setDraftTitle(title);
                    setDraftFigmaUrl(figmaUrl);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Edit element title and link"
                  >
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("editor.editDetailsTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("editor.editDetailsDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveElementMeta();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("editor.titleLabel")}
                      </label>
                      <Input
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        placeholder={t("editor.titleLabel")}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("editor.figmaLinkLabel")}
                      </label>
                      <Input
                        value={draftFigmaUrl}
                        onChange={(event) => setDraftFigmaUrl(event.target.value)}
                        placeholder={t("new.figmaPlaceholder")}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {t("common.cancel")}
                        </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!canSaveMeta}>
                          {t("common.save")}
                        </Button>
                      </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Link2 className="h-4 w-4" />
              <a
                href={figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground/80 underline-offset-4 hover:underline"
              >
                {t("editor.openInFigma")}
              </a>
              <span className="text-muted-foreground/60">-</span>
              <span className="flex items-center gap-1">
                <FileKey className="h-3.5 w-3.5" />
                {element.figmaFileKey ?? t("editor.fileKeyNotParsed")}
              </span>
              {element.figmaNodeId ? (
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  {element.figmaNodeId}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t("editor.deleteElement")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("editor.deleteElementTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("editor.deleteElementDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteElement}>
                      {t("common.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button onClick={createState} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {t("editor.addState")}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-6">
          <div className="space-y-3">
          <label className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            {t("editor.filterTitle")}
          </label>
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="relative min-w-[240px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("editor.searchPlaceholder")}
                  className="h-11 pl-10 pr-10"
                  aria-label="Search states"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="flex items-center justify-start gap-2 md:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTypes([]);
                  setQuery("");
                }}
                disabled={!hasFilters}
              >
                {t("editor.clearFilters")}
              </Button>
            </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTypes([])}
                className={cn(
                  "gap-2 border-neutral-200 text-neutral-700/80 hover:bg-neutral-500/10",
                  selectedTypes.length === 0 &&
                    "bg-neutral-500/10 text-neutral-700",
                )}
              >
                {t("editor.all")}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                  {stateList.length}
                </span>
              </Button>
              {filterOptions.map((option) => {
                const active = selectedTypes.includes(option.value as FilterValue);
                const style =
                  STATE_TYPE_STYLES[option.value as FilterValue].filter;
                return (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedTypes((prev) => {
                        if (active) {
                          return prev.filter((item) => item !== option.value);
                        }
                        return [...prev, option.value as FilterValue];
                      })
                    }
                    className={cn(
                      "gap-2",
                      active ? style.active : style.inactive,
                    )}
                  >
                    {option.label}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                      {stateCounts[option.value as FilterValue]}
                    </span>
                  </Button>
                );
              })}
            </div>

            {hasFilters ? (
              <div className="flex flex-wrap items-center gap-2">
                {normalizedQuery.length > 0 ? (
                  <Badge variant="secondary" className="gap-1">
                    {t("editor.searchLabel")}: &quot;{query}&quot;
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null}
                {selectedTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="gap-1">
                    {stateTypeLabel(lang, type)}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedTypes((prev) =>
                          prev.filter((item) => item !== type),
                        )
                      }
                      className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${stateTypeLabel(lang, type)} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("editor.filterTip")}
              </p>
            )}

            {hasFilters ? (
              <p className="text-xs text-muted-foreground">
                {t("editor.reorderTip")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h3 className="font-display text-xl font-semibold">
              {t("editor.statesTitle")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t("editor.statesCount", {
                shown: filteredStates.length,
                total: stateList.length,
              })}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={createState}
            className="gap-2 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("editor.quickAdd")}
          </Button>
        </div>

        {filteredStates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              {t("editor.emptyStates")}
            </p>
            <Button className="mt-4" onClick={createState}>
              {t("editor.addStateCta")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredStates.map((state, index) => (
              <StateCard
                key={state.id}
                state={state}
                index={index}
                total={filteredStates.length}
                autoFocus={focusStateId === state.id}
                disableMove={hasFilters}
                onChange={updateState}
                onMove={moveState}
                onDelete={deleteState}
                onDuplicate={duplicateState}
              />
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {t("editor.shortcutPrefix")}{" "}
        <span className="rounded border bg-muted px-1 py-0.5 font-mono">
          Ctrl
        </span>{" "}
        +{" "}
        <span className="rounded border bg-muted px-1 py-0.5 font-mono">
          Enter
        </span>{" "}
        {t("editor.shortcutSuffix")}
      </div>
    </div>
  );
}
