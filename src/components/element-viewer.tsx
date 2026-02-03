"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Search, X, ArrowUpRight } from "lucide-react";
import type {
  SerializedElement,
  SerializedProject,
  SerializedState,
} from "@/lib/serialization";
import { serializeStatesText, stateCopyText } from "@/lib/serialization";
import { Button } from "@/components/ui/button";
import { StateTypeBadge } from "@/components/state-type-badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RightPanel } from "@/components/right-panel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/components/lang-provider";

type ElementViewerProps = {
  element: SerializedElement;
  states: SerializedState[];
  project?: SerializedProject | null;
  projectElements?: SerializedElement[];
};

export function ElementViewer({
  element,
  states,
  project,
  projectElements = [],
}: ElementViewerProps) {
  const { t, lang, setLang } = useLang();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredStates = useMemo(() => {
    if (!normalizedQuery) return states;
    return states.filter((state) => {
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
  }, [normalizedQuery, states]);

  const grouped = useMemo(() => {
    const groups: Record<string, SerializedState[]> = {};
    filteredStates
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((state) => {
        const key = state.type ?? "other";
        if (!groups[key]) groups[key] = [];
        groups[key].push(state);
      });
    return groups;
  }, [filteredStates]);

  const updatedLabel = useMemo(() => {
    const date = new Date(element.updatedAt);
    if (Number.isNaN(date.getTime())) return null;
    const locale = lang === "ru" ? "ru-RU" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, [element.updatedAt, lang]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(serializeStatesText(states, lang));
      toast.success(t("right.toast.copyAllSuccess"));
    } catch {
      toast.error(t("right.toast.copyAllError"));
    }
  };

  const copyState = async (
    state: SerializedState,
    mode: "message" | "title-message",
  ) => {
    try {
      await navigator.clipboard.writeText(stateCopyText(state, mode));
      toast.success(t("state.copied"));
    } catch {
      toast.error(t("state.copyFailed"));
    }
  };

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(
        serializeStatesText(filteredStates, lang),
      );
      toast.success(t("viewer.resultsCopied"));
    } catch {
      toast.error(t("viewer.copyFailed"));
    }
  };

  const copyGroup = async (items: SerializedState[]) => {
    try {
      await navigator.clipboard.writeText(serializeStatesText(items, lang));
      toast.success(t("viewer.groupCopied"));
    } catch {
      toast.error(t("viewer.copyFailed"));
    }
  };

  const hasProject = Boolean(project && projectElements.length > 0);
  const formatGroupCount = (count: number) => {
    if (lang === "en") {
      return `${count} ${count === 1 ? "state" : "states"}`;
    }
    return t("viewer.groupCount", { count });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                  {t("viewer.sharedLabel")}
                </p>
                <h1 className="font-display text-3xl font-semibold">
                  {element.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <a
                    href={element.figmaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-foreground/80 underline-offset-4 hover:underline"
                  >
                    {t("editor.openInFigma")}
                  </a>
                  {updatedLabel ? (
                    <span>{t("viewer.updated", { date: updatedLabel })}</span>
                  ) : null}
                  <span>{t("viewer.statesCount", { count: states.length })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {t("language.label")}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant={lang === "en" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setLang("en")}
                  >
                    {t("language.en")}
                  </Button>
                  <Button
                    variant={lang === "ru" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setLang("ru")}
                  >
                    {t("language.ru")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={copyAll} className="gap-2">
                <Copy className="h-4 w-4" />
                {t("viewer.copyAll")}
              </Button>
              {normalizedQuery ? (
                <Button variant="outline" onClick={copyResults}>
                  {t("viewer.copyResults")}
                </Button>
              ) : null}
            </div>
            {hasProject ? (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                      {t("viewer.projectLabel")}
                    </p>
                    <p className="text-sm font-medium">{project?.name}</p>
                    {project?.description ? (
                      <p className="text-xs text-muted-foreground">
                        {project.description}
                      </p>
                    ) : null}
                  </div>
                  {project ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/p/${project.id}`}>
                        {t("viewer.viewProject")}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t("viewer.elementsCount", {
                      count: projectElements.length,
                    })}
                  </span>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("viewer.searchPlaceholder")}
                  className="h-10 pl-10 pr-10"
                  aria-label={t("viewer.searchLabel")}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label={t("common.clearSearch")}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("viewer.showing", {
                  shown: filteredStates.length,
                  total: states.length,
                })}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-6">
            {states.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                {t("viewer.noStates")}
              </Card>
            ) : filteredStates.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">
                {t("viewer.noMatch")}
              </Card>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StateTypeBadge
                        type={type as SerializedState["type"]}
                        className="text-[11px]"
                      />
                      <span className="text-xs text-muted-foreground">
                        {formatGroupCount(items.length)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyGroup(items)}
                    >
                      {t("viewer.copyGroup")}
                    </Button>
                  </div>
                  {items.map((state) => (
                    <Card key={state.id} className="space-y-3 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{state.title}</p>
                          {state.condition ? (
                            <p className="text-xs text-muted-foreground">
                              {state.condition}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            {state.severity ? (
                              <Badge variant="secondary">
                                {t("state.severityBadge", {
                                  value: state.severity,
                                })}
                              </Badge>
                            ) : null}
                            {state.locale && state.locale !== "en" ? (
                              <Badge variant="secondary">
                                {t("state.localeBadge", {
                                  value: state.locale,
                                })}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => copyState(state, "message")}
                          >
                            {t("state.copyMessage")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyState(state, "title-message")}
                          >
                            {t("state.copyLabelMessage")}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed">{state.message}</p>
                    </Card>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        <RightPanel element={element} states={states} readOnly />
      </div>
    </div>
  );
}
