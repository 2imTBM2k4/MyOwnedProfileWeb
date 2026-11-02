"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import styles from "@/app/profile.module.css";

const sections = ["about", "work", "experience", "skills", "gear", "contact"] as const;

export default function FloatingNavbar({ catalogue = false }: { catalogue?: boolean }) {
  const { t } = useLanguage();
  const [compact, setCompact] = useState(false);
  const [active, setActive] = useState("");
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let lastCompact = false;
    const progressEl = progressRef.current;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          if (progressEl) {
            progressEl.style.transform = `scaleX(${progress})`;
          }
          const isCompact = window.scrollY > 40;
          if (isCompact !== lastCompact) {
            lastCompact = isCompact;
            setCompact(isCompact);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (catalogue) {
      setActive("gear");
      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    }

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(e.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    return () => {
      spy.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [catalogue]);

  const prefix = catalogue ? "/" : "";

  return (
    <header className={`${styles.nav} ${compact ? styles.compact : ""}`}>
      <Link
        href={catalogue ? "/" : "#top"}
        className={styles.logo}
        aria-label={`bming — ${t.proto?.home || "home"}`}
      >
        bming<span>.</span>
      </Link>
      <nav aria-label={t.nav.mainNav}>
        {sections.map((id) => {
          const label = t.proto?.nav?.[id] || id;
          const href = id === "gear" && catalogue ? "#collection" : `${prefix}#${id}`;
          return (
            <a
              key={id}
              href={href}
              aria-current={active === id ? "true" : undefined}
            >
              {label}
            </a>
          );
        })}
      </nav>
      <div className={styles.navControls}>
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div
        className={styles.navTrack}
        role="progressbar"
        aria-label={t.nav.scrollProgress}
        aria-hidden="true"
      >
        <div ref={progressRef} />
      </div>
    </header>
  );
}
