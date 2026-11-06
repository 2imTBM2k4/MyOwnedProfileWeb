"use client";

import { useCallback, useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import FloatingNavbar from "@/components/FloatingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import InteractiveChatbot from "@/components/InteractiveChatbot";
import ContactModal from "@/components/ContactModal";
import ProjectDetailModal from "@/components/ProjectDetailModal";
import { PROJECT_PREVIEWS } from "@/data/project-previews";
import { useLanguage } from "@/context/LanguageContext";
import {
  orderProjects,
  publicUrl,
  validPayload,
  type Gear,
  type Project,
  type SkillItem,
  type ExperienceItem,
} from "@/lib/profile-content";
import styles from "./profile.module.css";

type Profile = { username: string | null; bio: string | null; avatar_url: string | null; cover_url: string | null };
type SocialLink = { id: string; platform: string; url: string; display_name: string | null };
type SiteData = {
  profile: Profile | null;
  projects: Project[];
  gears: Gear[];
  socialLinks: SocialLink[];
  skills?: SkillItem[];
  experiences?: ExperienceItem[];
};

const EMPTY_DATA: SiteData = {
  profile: null,
  projects: [],
  gears: [],
  socialLinks: [],
  skills: [],
  experiences: [],
};
const CACHE_KEY = "site_data_cache";
const CACHE_TTL = 5 * 60 * 1000;
const EMAIL = "2004.tranbinhminh@gmail.com";
const SOURCES = [
  ["profile", "/api/profile"],
  ["projects", "/api/projects"],
  ["gears", "/api/gears"],
  ["socialLinks", "/api/social-links"],
  ["skills", "/api/skills"],
  ["experiences", "/api/experiences"],
] as const;

const projectLayoutId = (project: Project) =>
  `project-${String(project.id || project.title).replace(/[^a-zA-Z0-9_-]/g, "-")}`;

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

const defaultSocials = [
  {
    name: "LinkedIn",
    brand: "#0a66c2",
    handle: "Bình Minh Trần",
    url: "https://www.linkedin.com/in/2imtbm2k4",
    platform: "linkedin",
  },
  {
    name: "GitHub",
    brand: "var(--text)",
    handle: "@2imTBM2k4",
    url: "https://github.com/2imTBM2k4",
    platform: "github",
  },
  {
    name: "Instagram",
    brand: "#e1306c",
    handle: "@bming.profile",
    url: "https://www.instagram.com/bming.profile/",
    platform: "instagram",
  },
  {
    name: "Facebook",
    brand: "#1877f2",
    handle: "Trần Bình Minh",
    url: "https://www.facebook.com/bming.profile/",
    platform: "facebook",
  },
];

const defaultProjects: Project[] = [
  {
    id: "proto-1",
    title: "DroneFood",
    tags: ["Drone Dispatching", "QR Cargo Handover", "Preflight Check", "Socket.IO", "Node.js"],
    demo_url: "https://dronefood.io.vn/",
    github_url: "https://github.com/2imTBM2k4/DroneFood",
    status: "completed",
    image_url: null,
    created_at: "2024-01-01",
    description: null,
    tone: "lime",
  },
  {
    id: "proto-2",
    title: "Portfolio",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Supabase"],
    demo_url: "https://bming.vercel.app/",
    github_url: "https://github.com/2imTBM2k4/MyOwnedProfileWeb",
    status: "active",
    image_url: null,
    created_at: "2024-01-01",
    description: null,
    tone: "violet",
  },
];

const defaultGears = [
  { id: "g1", name: 'Razer Viper V4 Pro', category: 'Mouse', image_url: '1792745564763-9pwpmzbjp9m.jpg', brand: 'Razer', status: 'active' as const },
  { id: "g2", name: 'AOC 24G50Z 24" 260Hz', category: 'Monitor', image_url: '1792746729678-mnc4z26n75l.webp', brand: 'AOC', status: 'active' as const },
  { id: "g3", name: 'Artisan Ninja FX Zero', category: 'Mousepad', image_url: '1792746827622-oih1yzbqi2a.webp', brand: 'Artisan', status: 'active' as const },
  { id: "g4", name: 'iBasso JR Cookie Ti', category: 'IEM', image_url: '1783376828914-vl6to8o4nwo.jpeg', brand: 'iBasso', status: 'active' as const },
  { id: "g5", name: 'Moondrop Dawn Pro 2', category: 'DAC', image_url: '1775453316714-kequk4akh0r.webp', brand: 'Moondrop', status: 'active' as const },
  { id: "g6", name: 'EPMIC TM07', category: 'Micro', image_url: '1775453282643-o2lj1l65nd.webp', brand: 'EPMIC', status: 'active' as const },
  { id: "g7", name: 'Apple iPhone SE Gen3', category: 'Phone', image_url: '1778925743172-myx7w551aw.jpeg', brand: 'Apple', status: 'active' as const },
];

const logos: [string, string, boolean?][] = [
  ["Node.js", "nodejs"],
  ["Express", "express", true],
  ["MongoDB", "mongodb"],
  ["TypeScript", "typescript"],
  ["JavaScript", "javascript"],
  ["Socket.io", "socketio", true],
  ["PostgreSQL", "postgresql"],
  ["Supabase", "supabase"],
  ["Docker", "docker"],
  ["Postman", "postman"],
  ["Git", "git"],
  ["GitHub", "github", true],
  ["Next.js", "nextjs", true],
];

const skills = [
  "Node.js",
  "Express.js",
  "MongoDB",
  "RESTful API",
  "Socket.io",
  "JWT Auth",
  "TypeScript",
  "PostgreSQL",
  "Docker",
  "Git",
  "Postman",
];
const terminal = [
  "$ whoami",
  "tran-binh-minh // backend dev",
  "$ core-stack",
  "node.js • express • mongodb • socket.io",
  "$ status",
  "open to backend opportunities",
  "$ location",
  "Ho Chi Minh City, VN",
];

const Title = ({ parts }: { parts: readonly string[] }) => (
  <>
    {parts.map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
  </>
);

function Magnetic({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.3}px`);
    e.currentTarget.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
  };
  const reset = (e: MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty("--mx", "0px");
    e.currentTarget.style.setProperty("--my", "0px");
  };
  return (
    <a href={href} className={`${styles.magnetic} ${className}`} onMouseMove={move} onMouseLeave={reset}>
      <span>{children}</span>
    </a>
  );
}

function MagneticButton({
  onClick,
  className,
  children,
  layoutId = "say-hi-contact-modal",
}: {
  onClick: () => void;
  className: string;
  children: ReactNode;
  layoutId?: string;
}) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 22, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 280, damping: 22, mass: 0.5 });

  const move = (e: MouseEvent<HTMLButtonElement>) => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const middleX = e.clientX - (r.left + r.width / 2);
    const middleY = e.clientY - (r.top + r.height / 2);
    x.set(middleX * 0.35);
    y.set(middleY * 0.35);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type="button"
      layoutId={reducedMotion ? undefined : layoutId}
      onClick={onClick}
      className={className}
      onMouseMove={move}
      onMouseLeave={reset}
      style={{
        x: springX,
        y: springY,
      }}
      whileHover={reducedMotion ? undefined : { scale: 1.06 }}
      whileTap={reducedMotion ? undefined : { scale: 0.94 }}
      transition={{
        layout: { type: "spring", stiffness: 260, damping: 28, mass: 0.85 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      <span>{children}</span>
    </motion.button>
  );
}

function Letters({ text, start = 0 }: { text: string; start?: number }) {
  return (
    <span className={styles.letters} aria-hidden="true">
      {[...text].map((char, i) => (
        <span key={i} style={{ "--i": start + i } as CSSProperties}>
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

function getSocialSvg(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }
  if (p.includes("github")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }
  if (p.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="20" height="20" x="2" y="2" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    );
  }
  if (p.includes("facebook")) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  return <Arrow />;
}

function getSocialBrand(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("linkedin")) return "#0a66c2";
  if (p.includes("instagram")) return "#e1306c";
  if (p.includes("facebook")) return "#1877f2";
  if (p.includes("discord")) return "#5865f2";
  if (p.includes("twitter") || p.includes("x")) return "#1da1f2";
  return "var(--text)";
}

export default function HomePage() {
  const { t, locale } = useLanguage();
  const [data, setData] = useState<SiteData>(EMPTY_DATA);
  const [typed, setTyped] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const total = terminal.join("\n").length;

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled(
      SOURCES.map(async ([key, url]) => {
        const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error(key);
        const value = await response.json();
        if (!validPayload(key, value)) throw new Error(key);
        return value;
      })
    );
    setData((previous) => {
      const next = { ...previous };
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          Object.assign(next, { [SOURCES[index][0]]: result.value });
        }
      });
      const allSuccess = results.every((r) => r.status === "fulfilled");
      if (allSuccess) {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next }));
        } catch {}
      }
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (
        cached &&
        typeof cached.ts === "number" &&
        Date.now() - cached.ts >= 0 &&
        Date.now() - cached.ts < CACHE_TTL &&
        SOURCES.every(([key]) => validPayload(key, cached.data?.[key]))
      ) {
        setData(cached.data);
      }
    } catch {}
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const onMove = (e: PointerEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          root.style.setProperty("--cx", `${e.clientX}px`);
          root.style.setProperty("--cy", `${e.clientY}px`);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  useEffect(() => {
    if (typed >= total) return;
    const id = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 1200 : 38);
    return () => clearTimeout(id);
  }, [typed, total]);

  const tilt = (e: MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    e.currentTarget.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    e.currentTarget.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    e.currentTarget.style.setProperty("--gx", `${x * 100}%`);
    e.currentTarget.style.setProperty("--gy", `${y * 100}%`);
  };

  const untilt = (e: MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const displayProjects = data.projects.length > 0 ? orderProjects(data.projects) : defaultProjects;
  const activeGears = data.gears.filter((gear) => gear.status === "active");
  const displayGears = activeGears.length > 0 ? activeGears : defaultGears;

  const displaySkills = data.skills && data.skills.length > 0
    ? data.skills.map((s) => s.name)
    : skills;

  const displayLogos: [string, string, boolean?][] = data.skills && data.skills.length > 0
    ? data.skills.map((s) => [s.name, s.slug, Boolean(s.invert)])
    : logos;

  const jobsList = data.experiences && data.experiences.length > 0
    ? data.experiences.map((exp) => {
        const period = (locale === "en" && exp.period_en)
          ? exp.period_en
          : (exp.period || (exp.is_current ? t.proto.present : `${exp.start_date || ""} - ${exp.end_date || ""}`));
        return {
          role: (locale === "en" && exp.role_en) ? exp.role_en : exp.role,
          company: exp.company,
          summary: (locale === "en" && exp.summary_en) ? exp.summary_en : (exp.summary || ""),
          points: (locale === "en" && exp.points_en && exp.points_en.length > 0) ? exp.points_en : (exp.points || []),
          period,
          is_current: exp.is_current ?? true,
          project_link: exp.project_link || "#work",
        };
      })
    : Object.values(t.proto.jobs).map((j) => ({
        role: j.role,
        company: j.company,
        summary: j.summary,
        points: j.points,
        period: t.proto.present,
        is_current: true,
        project_link: "#work",
      }));

  const socialLinks =
    data.socialLinks.length > 0
      ? data.socialLinks
          .filter((link) => publicUrl(link.url))
          .map((link) => ({
            name: link.platform,
            brand: getSocialBrand(link.platform),
            handle: link.display_name || `@${link.platform.toLowerCase()}`,
            url: link.url,
            platform: link.platform,
          }))
      : defaultSocials;

  return (
    <div className={styles.site}>
      <SmoothScroll />
      <div className={styles.spotlight} aria-hidden="true" />
      <a className={styles.skipLink} href="#top">
        {t.common.skipToContent}
      </a>

      <FloatingNavbar />

      <main id="top">
        {/* Hero Section */}
        <section className={`${styles.hero} ${styles.wrap}`}>
          <div className={styles.gridBg} aria-hidden="true" />
          <div className={`${styles.orb} ${styles.orbA}`} aria-hidden="true" />
          <div className={`${styles.orb} ${styles.orbB}`} aria-hidden="true" />

          <div className={styles.heroMain}>
            <p className={`${styles.pill} ${styles.rise}`} style={{ "--d": "0ms" } as CSSProperties}>
              <i /> {t.proto.available}
            </p>
            <h1 aria-label="Trần Bình Minh.">
              <Letters text="Trần" />
              <br />
              <Letters text="Bình Minh" start={4} />
              <em className={styles.dot}>.</em>
            </h1>
            <p className={`${styles.lead} ${styles.rise}`} style={{ "--d": "900ms" } as CSSProperties}>
              {t.proto.build}
              <span className={styles.roller}>
                <span>
                  {[...t.proto.roles, t.proto.roles[0]].map((role, i) => (
                    <b key={i}>{role}</b>
                  ))}
                </span>
              </span>
            </p>
            <div className={`${styles.actions} ${styles.rise}`} style={{ "--d": "1050ms" } as CSSProperties}>
              <Magnetic href="#work" className={styles.btnPrimary}>
                {t.proto.viewWork} <Arrow />
              </Magnetic>
              <a className={styles.link} href="https://github.com/2imTBM2k4" target="_blank" rel="noreferrer">
                GitHub <Arrow />
              </a>
            </div>
          </div>

          <div className={`${styles.terminal} ${styles.rise}`} style={{ "--d": "700ms" } as CSSProperties} aria-label={t.proto.intro}>
            <div className={styles.termBar}>
              <i />
              <i />
              <i />
              <span>~/bming</span>
            </div>
            <pre>
              {terminal.join("\n").slice(0, typed)}
              <span className={styles.caret} />
            </pre>
          </div>
        </section>

        {/* Infinite Marquee */}
        <div className={styles.marquee} aria-label={t.proto.skillsAria}>
          {[0, 1].map((row) => (
            <div className={`${styles.track} ${row ? styles.reverse : ""}`} key={row} aria-hidden={row === 1}>
              {[...displaySkills, ...displaySkills].map((skill, i) => (
                <span key={i}>
                  {skill}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* 01 — About */}
        <section className={`${styles.wrap} ${styles.section} ${styles.about}`} id="about">
          <p className={styles.label} data-reveal>
            {t.proto.aboutLabel}
          </p>
          <p className={styles.statement} data-reveal>
            <Title parts={t.proto.statement} />
          </p>
        </section>

        {/* 02 — Work */}
        <section className={`${styles.wrap} ${styles.section}`} id="work">
          <div className={styles.head} data-reveal>
            <p className={styles.label}>{t.proto.workLabel}</p>
            <h2>
              <Title parts={t.proto.workTitle} />
            </h2>
          </div>
          <div className={styles.projects}>
            {displayProjects.map((p, i) => {
              const fallbackInfo =
                (t.proto.projects as Record<string, { kind: string; problem: string; did: string; result: string }>)[p.title] ||
                (p.github_url?.includes("DroneFood") ? t.proto.projects.DroneFood : undefined) ||
                (p.github_url?.includes("MyOwnedProfileWeb") ? t.proto.projects.Portfolio : undefined);

              const displayTitle = (locale === "en" && p.title_en) ? p.title_en : p.title;
              const kind = (locale === "en" && p.kind_en)
                ? p.kind_en
                : (p.kind || fallbackInfo?.kind || (p.status === "completed" ? t.projects.statusCompleted : t.projects.statusActive));
              const tone = p.tone === "violet" ? styles.toneViolet : styles.toneLime;
              const tags = p.tags || [];
              const previewImg = p.image_url || (p.github_url ? PROJECT_PREVIEWS[p.github_url] : null);

              return (
                <motion.article
                  key={p.id || p.title}
                  layoutId={projectLayoutId(p)}
                  className={`${styles.card} ${tone} ${styles.cardClickable}`}
                  onClick={() => setSelectedProject(p)}
                  onMouseMove={tilt}
                  onMouseLeave={untilt}
                  data-reveal
                  style={{ "--d": `${i * 120}ms` } as CSSProperties}
                >
                  <div className={styles.glare} aria-hidden="true" />
                  <div className={styles.cardArt} aria-hidden="true">
                    {previewImg ? (
                      <>
                        <img src={previewImg} alt={displayTitle} loading="lazy" />
                        <div className={styles.cardArtOverlay} />
                      </>
                    ) : (
                      <>
                        <div className={styles.blob} />
                        <span>{displayTitle}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <p className={styles.label}>{kind}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(p);
                        }}
                        className={styles.round}
                        aria-label={`${t.proto.open} ${displayTitle}`}
                        title="Xem chi tiết dự án"
                      >
                        <Arrow />
                      </button>
                    </div>
                    <h3>{displayTitle}</h3>
                    <div className={styles.tags}>
                      {tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        {/* 03 — Experience */}
        <section className={`${styles.wrap} ${styles.section}`} id="experience">
          <div className={styles.head} data-reveal>
            <p className={styles.label}>{t.proto.expLabel}</p>
            <h2>
              <Title parts={t.proto.expTitle} />
            </h2>
          </div>
          <ol className={styles.timeline}>
            {jobsList.map((job, idx) => (
              <li className={styles.job} key={`${job.company}-${idx}`} data-reveal onMouseMove={tilt} onMouseLeave={untilt}>
                <div className={styles.jobWhen}>
                  {job.is_current ? (
                    <span className={styles.live}>
                      <i /> {t.proto.current}
                    </span>
                  ) : null}
                  <p>{job.period}</p>
                </div>
                <div className={styles.jobMain}>
                  <h3>{job.role}</h3>
                  <p className={styles.company}>@ {job.company}</p>
                  {job.summary && <p className={styles.jobSummary}>{job.summary}</p>}
                  {job.points && job.points.length > 0 && (
                    <ul>
                      {job.points.map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  )}
                  <a className={`${styles.link} ${styles.smallInline}`} href={job.project_link || "#work"}>
                    {t.proto.seeProject} <Arrow />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 04 — Skills */}
        <section className={`${styles.wrap} ${styles.section}`} id="skills">
          <div className={`${styles.head} ${styles.skillsHead}`} data-reveal>
            <div>
              <p className={styles.label}>{t.proto.skillsLabel}</p>
              <h2>
                <Title parts={t.proto.skillsTitle} />
              </h2>
            </div>
          </div>
          <ul className={styles.logos} data-reveal>
            {displayLogos.map(([name, slug, invert]) => (
              <li key={name} className={`${styles.logoItem} ${invert ? styles.invert : ""}`} tabIndex={0}>
                <span className={styles.logoTile}>
                  <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`} alt={name} loading="lazy" />
                </span>
                <span className={styles.logoName}>{name}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 05 — Gear */}
        <section className={styles.section} id="gear">
          <div className={`${styles.wrap} ${styles.head} ${styles.gearHead}`} data-reveal>
            <div>
              <p className={styles.label}>{t.proto.gearLabel}</p>
              <h2>
                <Title parts={t.proto.gearTitle} />
              </h2>
            </div>
            <Link className={styles.btnOutline} href="/gears">
              {t.proto.allGear} <Arrow />
            </Link>
          </div>
          <div className={styles.gearStrip}>
            <div className={styles.gearTrack}>
              {[...displayGears, ...displayGears].map((g, i) => {
                const rawUrl = g.image_url || "";
                const isSupabaseFileName = rawUrl && !rawUrl.startsWith("http");
                const imgSrc = isSupabaseFileName
                  ? `https://riglorvcruymsummcsnr.supabase.co/storage/v1/object/public/gears/${rawUrl}`
                  : publicUrl(rawUrl) || rawUrl;
                return (
                  <figure className={styles.gearItem} key={`${g.id || g.name}-${i}`} aria-hidden={i >= displayGears.length}>
                    <div className={styles.gearImgWrap}>
                      <img src={imgSrc} alt={g.name} loading="lazy" />
                    </div>
                    <figcaption>
                      <span>{g.category || g.brand}</span>
                      {g.name}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 06 — Contact / Footer */}
      <footer className={`${styles.wrap} ${styles.footer}`} id="contact">
        <p className={styles.label} data-reveal>
          {t.proto.contactLabel}
        </p>
        <h2 data-reveal>
          {t.proto.contactTitle[0]}
          <br />
          {t.proto.contactTitle[1]}
          <em>{t.proto.contactTitle[2]}</em>
          {t.proto.contactTitle[3]}
        </h2>
        <div className={styles.contact} data-reveal>
          <MagneticButton layoutId="say-hi-contact-modal" onClick={() => setIsContactOpen(true)} className={styles.btnCircle}>
            Say hi <Arrow />
          </MagneticButton>
          <div>
            <a className={`${styles.link} ${styles.linkBig}`} href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <button type="button" className={styles.copy} onClick={copy}>
              {copied ? t.proto.copied : t.proto.copy}
            </button>
          </div>
        </div>
        <div className={styles.socialsWrap} data-reveal>
          <p className={styles.label}>{t.proto.findMe}</p>
          <ul className={styles.socials}>
            {socialLinks.map((social) => (
              <li key={social.name}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.social}
                  style={social.brand ? ({ "--brand": social.brand } as CSSProperties) : undefined}
                >
                  <span className={styles.socialIcon}>{getSocialSvg(social.platform)}</span>
                  <span className={styles.socialText}>
                    <b>{social.name}</b>
                    <small>{social.handle}</small>
                  </span>
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Trần Bình Minh</span>
          <a href="#top">{t.proto.backTop}</a>
        </div>
      </footer>

      {/* Floating Interactive Chatbot (bottom-right) */}
      <InteractiveChatbot />

      {/* Say Hi Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        layoutId="say-hi-contact-modal"
        onClose={() => setIsContactOpen(false)}
        targetEmail={EMAIL}
        locale={locale}
      />

      {/* Project Detail Popup Modal */}
      <ProjectDetailModal
        project={selectedProject}
        layoutId={selectedProject ? projectLayoutId(selectedProject) : undefined}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        locale={locale}
        caseLabels={t.proto.caseLabels}
        fallbackInfo={
          selectedProject
            ? (t.proto.projects as Record<string, { kind?: string; problem?: string; did?: string; result?: string; description?: string }>)[selectedProject.title] ||
              (selectedProject.github_url?.includes("DroneFood") ? t.proto.projects.DroneFood : undefined) ||
              (selectedProject.github_url?.includes("MyOwnedProfileWeb") ? t.proto.projects.Portfolio : undefined)
            : undefined
        }
      />
    </div>
  );
}
