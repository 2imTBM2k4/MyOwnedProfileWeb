"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS, type Locale } from "@/data/translations";

type Translations = typeof TRANSLATIONS["vi"];

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved === "vi" || saved === "en") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem("locale", nextLocale);
      document.documentElement.lang = nextLocale;
    } catch {}
  };

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  const t = (TRANSLATIONS[locale] || TRANSLATIONS.vi) as Translations;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: "vi",
      setLocale: () => {},
      toggleLocale: () => {},
      t: TRANSLATIONS.vi as Translations,
    };
  }
  return context;
}
