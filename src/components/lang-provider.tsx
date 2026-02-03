"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang, TranslationKey } from "@/lib/i18n";
import { t as translate } from "@/lib/i18n";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

type LangProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
  defaultLang?: Lang;
  syncDocumentLang?: boolean;
};

export function LangProvider({
  children,
  storageKey = "lang",
  defaultLang = "en",
  syncDocumentLang = true,
}: LangProviderProps) {
  const [lang, setLang] = useState<Lang>(defaultLang);

  useEffect(() => {
    if (!storageKey) return;
    const stored = window.localStorage.getItem(storageKey);
    if (stored === "en" || stored === "ru") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, lang);
    }
    if (syncDocumentLang) {
      document.documentElement.lang = lang;
    }
  }, [lang, storageKey, syncDocumentLang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used within LangProvider.");
  }
  return context;
}
