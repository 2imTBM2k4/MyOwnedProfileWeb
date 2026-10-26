"use client";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/profile.module.css";

export default function FloatingNavbar({ catalogue = false }: { catalogue?: boolean }) {
  const { t } = useLanguage();
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState("");
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      setCompact(window.scrollY > 100);
      const distance = document.documentElement.scrollHeight - innerHeight;
      const ratio = distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
      if (progress.current) {
        progress.current.style.transform = `scaleX(${ratio})`;
        progress.current.parentElement?.setAttribute("aria-valuenow", String(Math.round(ratio * 100)));
      }
      if (catalogue) { setActive("gears"); return; }
      const sections = ["contact", "gears", "about", "projects"];
      const current = sections.find(id => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().top <= innerHeight * .4;
      });
      setActive(window.scrollY + innerHeight >= document.documentElement.scrollHeight - 8 ? "contact" : current || "");
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [catalogue]);
  const home = catalogue ? "/" : "";
  return (
    <div className={styles.headerSpace}>
    <header className={`${styles.header} ${compact ? styles.headerCompact : ""}`} data-compact={compact}>
      <a href={catalogue ? "/" : "#hero"} className={styles.brand} aria-label={t.nav.brandAria}>silentboiz<span>.</span></a>
      <nav aria-label={t.nav.mainNav} className={styles.nav}>
        <a href={`${home}#projects`} aria-current={active === "projects" ? "location" : undefined}>{t.nav.projects}</a>
        <a href={`${home}#about`} aria-current={active === "about" ? "location" : undefined}>{t.nav.about}</a>
        <a href={catalogue ? "#collection" : "#gears"} aria-current={active === "gears" ? "location" : undefined}>{t.nav.gears}</a>
        <a href={`${home}#contact`} aria-current={active === "contact" ? "location" : undefined}>{t.nav.contact}</a>
      </nav>
      <div className={styles.headerControls}>
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className={styles.scrollTrack} role="progressbar" aria-label={t.nav.scrollProgress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div ref={progress} className={styles.scrollProgress} /></div>
    </header>
    </div>
  );
}
