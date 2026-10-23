"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export default function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const update = () => {
      lenis?.destroy();
      lenis = preference.matches ? undefined : new Lenis({
        autoRaf: true,
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
      });
    };
    const handleAnchorClick = (event: MouseEvent) => {
      if (!lenis || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith("#") || href.length < 2) return;
      let element: HTMLElement | null;
      try { element = document.getElementById(decodeURIComponent(href.slice(1))); } catch { return; }
      if (!element) return;
      event.preventDefault();
      if (location.hash !== href) history.pushState(null, "", href);
      lenis.scrollTo(element, {
        duration: 0.95,
        immediate: href === "#main",
        onComplete: () => {
          if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
          element.focus({ preventScroll: true });
        },
      });
    };
    const handleFocus = (event: FocusEvent) => {
      if (!lenis || !(event.target instanceof HTMLElement)) return;
      const footer = event.target.closest("[data-footer-reveal]");
      if (footer?.firstElementChild && getComputedStyle(footer.firstElementChild).position === "fixed" && footer.getBoundingClientRect().bottom > innerHeight + 2) {
        lenis.scrollTo("bottom", { immediate: true });
      }
    };
    update();
    preference.addEventListener("change", update);
    document.addEventListener("click", handleAnchorClick);
    document.addEventListener("focusin", handleFocus);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("click", handleAnchorClick);
      document.removeEventListener("focusin", handleFocus);
      lenis?.destroy();
    };
  }, []);

  return null;
}
