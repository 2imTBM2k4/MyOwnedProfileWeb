"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "@/app/profile.module.css";

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.langTogglePlaceholder} aria-hidden="true" />;
  }

  const ariaLabel = t.proto?.langAria || t.nav.switchLang;

  return (
    <button
      type="button"
      className={styles.langToggle}
      data-lang={locale}
      onClick={toggleLocale}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className={locale === "vi" ? styles.on : ""}>VI</span>
      <span className={locale === "en" ? styles.on : ""}>EN</span>
    </button>
  );
}
