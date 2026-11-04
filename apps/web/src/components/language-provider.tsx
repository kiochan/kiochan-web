"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations } from "@/content/site";

export const languages = [
  { code: "en", short: "EN", name: "English" },
  { code: "zh", short: "中", name: "中文" },
  { code: "ja", short: "あ", name: "日本語" },
  { code: "de", short: "DE", name: "Deutsch" },
] as const;
type Language = (typeof languages)[number]["code"];
const storageKey = "kiochan-language";
const LanguageContext = createContext({
  language: "en" as Language,
  setLanguage: (_language: Language) => {},
});
function isLanguage(value: string | null): value is Language {
  return languages.some(({ code }) => code === value);
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (isLanguage(saved)) setLanguage(saved);
    } catch {
      /* Keep the default when storage is unavailable. */
    }
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey)
        setLanguage(isLanguage(event.newValue) ? event.newValue : "en");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  function selectLanguage(value: Language) {
    setLanguage(value);
    try {
      localStorage.setItem(storageKey, value);
    } catch {
      /* Selection still works without storage. */
    }
  }
  return (
    <LanguageContext.Provider value={{ language, setLanguage: selectLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  function t(text: string) {
    return context.language === "en"
      ? text
      : (translations[text]?.[context.language] ?? text);
  }
  return { ...context, t };
}
export function Localized({ text }: { text: string }) {
  const { t } = useLanguage();
  return t(text);
}
