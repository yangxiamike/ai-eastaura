"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  LANGUAGE_STORAGE_KEY,
  translate,
  type WorkbenchLanguage,
} from "@/lib/workbench/i18n";

interface LanguageContextValue {
  language: WorkbenchLanguage;
  setLanguage: (language: WorkbenchLanguage) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const languageChangeEvent = "eastaura-workbench-language-change";

function getStoredLanguage(): WorkbenchLanguage {
  if (typeof window === "undefined") return "zh";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "zh" || stored === "en" ? stored : "zh";
}

function subscribeLanguageChange(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(languageChangeEvent, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(languageChangeEvent, handleChange);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<WorkbenchLanguage>(
    subscribeLanguageChange,
    getStoredLanguage,
    () => "zh"
  );

  const setLanguage = (nextLanguage: WorkbenchLanguage) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event(languageChangeEvent));
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, values?: Record<string, string | number>) =>
        translate(language, key, values),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
