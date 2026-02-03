/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, ArrowUpRight } from "lucide-react";
import type { SerializedElement, SerializedProject } from "@/lib/serialization";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/components/lang-provider";
import { Button } from "@/components/ui/button";

type ProjectViewerProps = {
  project: SerializedProject;
  elements: SerializedElement[];
};

export function ProjectViewer({ project, elements }: ProjectViewerProps) {
  const { t, lang, setLang } = useLang();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredElements = useMemo(() => {
    if (!normalizedQuery) return elements;
    return elements.filter((element) => {
      const haystack = [
        element.title,
        element.figmaFileKey ?? "",
        element.figmaNodeId ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [elements, normalizedQuery]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === "ru" ? "ru-RU" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [lang],
  );

  const lastUpdated = useMemo(() => {
    if (elements.length === 0) return null;
    const latest = elements.reduce((max, item) => {
      const date = new Date(item.updatedAt);
      return date > max ? date : max;
    }, new Date(elements[0].updatedAt));
    return Number.isNaN(latest.getTime()) ? null : dateFormatter.format(latest);
  }, [elements, dateFormatter]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              {t("project.label")}
            </p>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-semibold">
                {project.name}
              </h1>
              {project.description ? (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>
                {t("project.elementsCount", { count: elements.length })}
              </span>
              {lastUpdated ? (
                <span>{t("project.updated", { date: lastUpdated })}</span>
              ) : null}
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
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("project.searchPlaceholder")}
              className="h-10 pl-10 pr-10"
              aria-label={t("project.searchLabel")}
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
            {t("project.showing", {
              shown: filteredElements.length,
              total: elements.length,
            })}
          </div>
        </div>

        <Separator />

        {elements.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            {t("project.empty")}
          </Card>
        ) : filteredElements.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            {t("project.noMatch")}
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredElements.map((element) => (
              <Link key={element.id} href={`/e/${element.id}?view=1`}>
                <Card className="group flex items-center gap-4 p-4 transition hover:bg-muted/40">
                  <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/30">
                    <img
                      src={element.imagePath}
                      alt={element.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {element.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {element.figmaFileKey
                        ? t("project.fileKey", { value: element.figmaFileKey })
                        : t("project.noFileKey")}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
