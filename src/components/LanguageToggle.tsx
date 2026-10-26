"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t.nav.switchLang}
      title={t.nav.switchLang}
      className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center text-xs font-bold tracking-wider select-none"
    >
      <span className="w-5 text-center leading-none">{locale.toUpperCase()}</span>
    </button>
  );
}
