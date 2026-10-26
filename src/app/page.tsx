"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Copy, Download } from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import ProjectPreview from "@/components/ProjectPreview";
import { PROJECT_PREVIEWS } from "@/data/project-previews";
import { SocialIcon } from "@/components/SocialIcon";
import { useLanguage } from "@/context/LanguageContext";
import { isFeaturedTag, orderProjects, previewGears, publicUrl, validPayload, type Gear, type Project } from "@/lib/profile-content";
import styles from "./profile.module.css";

type Profile = { username: string | null; bio: string | null; avatar_url: string | null; cover_url: string | null };
type SocialLink = { id: string; platform: string; url: string; display_name: string | null };
type SiteData = { profile: Profile | null; projects: Project[]; gears: Gear[]; socialLinks: SocialLink[] };

const EMPTY_DATA: SiteData = { profile: null, projects: [], gears: [], socialLinks: [] };
const CACHE_KEY = "site_data_cache";
const CACHE_TTL = 5 * 60 * 1000;
const EMAIL = "2004.tranbinhminh@gmail.com";
const SOURCES = [
  ["profile", "/api/profile"], ["projects", "/api/projects"],
  ["gears", "/api/gears"], ["socialLinks", "/api/social-links"],
] as const;

export default function HomePage() {
  const { t } = useLanguage();
  const [data, setData] = useState<SiteData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [failures, setFailures] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [cvState, setCvState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();
  const content = useRef<HTMLDivElement>(null);

  const refreshCv = useCallback(async () => {
    try {
      const response = await fetch("/api/cv", { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(12000) });
      setCvState(response.ok ? "ready" : response.status === 404 ? "missing" : "error");
    } catch { setCvState("error"); }
  }, []);

  useEffect(() => { void refreshCv(); }, [refreshCv]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled(SOURCES.map(async ([key, url]) => {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(key);
      const value = await response.json();
      if (!validPayload(key, value)) throw new Error(key);
      return value;
    }));
    const failed = SOURCES.filter((_, index) => results[index].status === "rejected").map(([key]) => key);
    setFailures(failed);
    setData(previous => {
      const next = { ...previous };
      results.forEach((result, index) => {
        if (result.status === "fulfilled") Object.assign(next, { [SOURCES[index][0]]: result.value });
      });
      if (failed.length === 0) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: next })); } catch {}
      }
      return next;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (cached && typeof cached.ts === "number" && Date.now() - cached.ts >= 0 && Date.now() - cached.ts < CACHE_TTL &&
        SOURCES.every(([key]) => validPayload(key, cached.data?.[key]))) setData(cached.data);
    } catch {}
    void refresh();
    return () => clearTimeout(copyTimer.current);
  }, [refresh]);

  useEffect(() => {
    if (!content.current || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-arrived", "");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    content.current.querySelectorAll("[data-reveal]:not([data-arrived])").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [data]);

  const copyEmail = async () => {
    clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopyState("copied");
    } catch { setCopyState("failed"); }
    copyTimer.current = setTimeout(() => setCopyState("idle"), 3000);
  };

  const projects = orderProjects(data.projects);
  const gears = previewGears(data.gears);
  const socialLinks = data.socialLinks.filter(link => publicUrl(link.url));
  const github = socialLinks.find(link => link.platform.toLowerCase() === "github");
  const avatar = publicUrl(data.profile?.avatar_url);

  return (
    <div className={styles.profile} ref={content}>
      <SmoothScroll />
      <a className={styles.skipLink} href="#main">{t.common.skipToContent}</a>
      <div className={styles.pageContent}>
      <div className={styles.frame}>
        <FloatingNavbar />
        <main id="main">
          <section id="hero" className={styles.hero}>
            <h1 aria-label="Trần Bình Minh."><span className={styles.nameMask} aria-hidden="true"><span data-name-word>Trần</span></span>{" "}<span className={styles.nameMask} aria-hidden="true"><span data-name-word>Bình</span></span>{" "}<span className={styles.nameMask} aria-hidden="true"><span data-name-word>Minh.</span></span></h1>
            <div className={styles.heroDetails}>
              <div className={styles.heroIntro}>
                <p className={styles.role}>{t.hero.role}</p>
                <p>{t.hero.intro}</p>
                <div className={styles.actions}>
                  <a className={styles.primary} href="#projects">{t.hero.viewProjects} <ArrowDown size={17} /></a>
                  {cvState === "ready" && <a className={styles.textLink} href="/api/cv" download>{t.hero.downloadCv} <Download size={17} /></a>}
                  <a className={styles.textLink} href={`mailto:${EMAIL}`}>{t.hero.chatWithMe} <ArrowUpRight size={17} /></a>
                </div>
                {cvState === "error" && <p className={styles.cvNotice} role="status">{t.hero.cvLoadError} <button type="button" onClick={() => void refreshCv()}>{t.common.retry}</button></p>}
              </div>
              <div className={styles.personalNote}>
                {avatar && <img src={avatar} alt={t.hero.avatarAlt} width="60" height="60" className={styles.avatar} />}
                <div><span>@{data.profile?.username || "silentboiz"}</span><p>{t.hero.personalNoteLines[0]}<br />{t.hero.personalNoteLines[1]}<br />{t.hero.personalNoteLines[2]}</p></div>
              </div>
            </div>
            <a className={styles.heroFoot} href="#projects">{t.hero.buildingFoot} <ArrowDown size={16} /></a>
          </section>

          {failures.length > 0 && <div className={styles.notice} role="status">
            <span>{t.notice.dataLoadError}</span>
            <button onClick={() => void refresh()} disabled={loading}>{loading ? t.common.loading : t.common.retry}</button>
          </div>}

          <section id="projects" className={styles.section}>
            <div className={styles.sectionHeading} data-reveal>
              <h2>{t.projects.heading}</h2>
            </div>
            <div className={styles.projects}>
              {projects.map(project => {
                const demo = publicUrl(project.demo_url);
                const source = publicUrl(project.github_url);
                const image = publicUrl(project.image_url) || (source ? PROJECT_PREVIEWS[source] : undefined);
                // This repository's stored description still describes its former gaming layout.
                const isThisSite = source === "https://github.com/2imTBM2k4/MyOwnedProfileWeb";
                const title = isThisSite ? t.projects.thisSiteTitle : project.title;
                const description = isThisSite ? t.projects.thisSiteDescription : project.description;
                return <article key={project.id} className={`${styles.project} ${image ? styles.projectWithImage : ""}`} data-reveal>
                  {image && <ProjectPreview image={image} title={title} href={demo || source} />}
                  <div className={styles.projectContent}>
                    <h3>{title}</h3>
                    <div className={styles.projectTop}>
                      <span>{project.status === "completed" ? t.projects.statusCompleted : project.status === "active" ? t.projects.statusActive : t.projects.statusPersonal}</span>
                      {project.created_at && !Number.isNaN(Date.parse(project.created_at)) && <span>{new Date(project.created_at).getFullYear()}</span>}
                    </div>
                    {(isThisSite || description) && <p className={styles.projectDescription}>{description}</p>}
                    {project.tags?.some(tag => !isFeaturedTag(tag)) && <p className={styles.technologies}>{project.tags.filter(tag => !isFeaturedTag(tag)).join(" · ")}</p>}
                    <div className={styles.projectLinks}>
                      {demo && <a href={demo} target="_blank" rel="noopener noreferrer" aria-label={t.projects.viewProjectAria.replace("{title}", title)}>{t.projects.viewProduct} <ArrowUpRight size={18} /></a>}
                      {source && <a href={source} target="_blank" rel="noopener noreferrer" aria-label={t.projects.sourceCodeAria.replace("{title}", title)}>{t.projects.sourceCode} <ArrowUpRight size={18} /></a>}
                    </div>
                  </div>
                </article>;
              })}
              {projects.length === 0 && <p className={styles.empty} role="status">{loading ? t.projects.loadingProjects : failures.includes("projects") ? t.projects.loadFailed : t.projects.empty}</p>}
            </div>
            {github && <a className={styles.textLink} href={publicUrl(github.url)} target="_blank" rel="noopener noreferrer">{t.projects.visitGithub} <ArrowUpRight size={18} /></a>}
          </section>

          <section id="about" className={`${styles.section} ${styles.about}`}>
            <div data-reveal><h2>{t.about.heading}</h2><p className={styles.aboutAside}>{t.about.studentBadge.split("\n").map((line, idx) => <span key={idx}>{idx > 0 && <br />}{line}</span>)}</p></div>
            <div className={styles.aboutBody}>
              <p className={styles.statement} data-reveal>{t.about.statement}</p>
              <p data-reveal>{t.about.paragraph1}</p>
              <p data-reveal>{t.about.paragraph2}</p>
              <div className={styles.skillList} data-reveal>
                <div><span>{t.about.skills.languages}</span><p>JavaScript · TypeScript · Node.js</p></div>
                <div><span>{t.about.skills.data}</span><p>PostgreSQL · Supabase</p></div>
                <div><span>{t.about.skills.tools}</span><p>Git · GitHub · Docker · Postman</p></div>
              </div>
            </div>
          </section>

          <section id="gears" className={`${styles.section} ${styles.gears}`}>
            <div className={styles.sectionHeading} data-reveal>
              <div><h2>{t.gearsHome.heading}</h2><p>{t.gearsHome.subtitle}</p></div>
              <Link className={styles.textLink} href="/gears">{t.gearsHome.viewCollection} <ArrowUpRight size={18} /></Link>
            </div>
            <div className={styles.gearGrid}>
              {gears.map(gear => <article className={styles.gear} key={gear.id} data-reveal>
                {publicUrl(gear.image_url) && <Link href="/gears" className={styles.gearImage} aria-label={t.gearsHome.viewGearAria.replace("{name}", gear.name)}><img src={publicUrl(gear.image_url)} alt={gear.name} loading="lazy" /></Link>}
                <div className={styles.gearMeta}><span>{gear.brand || t.gearsHome.defaultBrand}</span><span>{t.gearsHome.inUse}</span></div>
                <h3>{gear.name}</h3>
                {gear.notes && <p className={styles.gearNotes}>{gear.notes}</p>}
              </article>)}
            </div>
            {gears.length === 0 && <p className={styles.empty} role="status">{loading ? t.gearsHome.loading : failures.includes("gears") ? t.gearsHome.loadFailed : t.gearsHome.empty}</p>}
          </section>

        </main>
      </div>
      </div>
      <footer id="contact" className={styles.footerStage} data-footer-reveal>
        <div className={styles.footerPanel}>
          <div className={styles.frame}>
          <div className={styles.footerContact}>
            <h2 data-reveal>{t.footer.heading}</h2>
            <div className={styles.contactBody}>
              <p data-reveal>{t.footer.subtitle.split("\n").map((line, idx) => <span key={idx}>{idx > 0 && <br />}{line}</span>)}</p>
              <div className={styles.emailGroup} data-reveal>
                <p className={styles.location}>Ho Chi Minh City, Vietnam</p>
                <a className={styles.email} href={`mailto:${EMAIL}`}>{EMAIL} <ArrowUpRight size={22} /></a>
                <button className={styles.copyButton} onClick={() => void copyEmail()} aria-label={t.footer.copyEmailAria}>{copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}<span>{copyState === "copied" ? t.footer.copied : t.footer.copy}</span></button>
                <span className={styles.copyStatus} role="status">{copyState === "failed" ? t.footer.copyFailedStatus : copyState === "copied" ? t.footer.copySuccessStatus : ""}</span>
              </div>
            </div>
            <div className={styles.socials} data-reveal>{socialLinks.map(link => <a key={link.id} href={publicUrl(link.url)} target="_blank" rel="noopener noreferrer"><SocialIcon platform={link.platform} className="w-4 h-4" />{link.platform}<ArrowUpRight size={15} /></a>)}</div>
          </div>
          <p className={styles.footerName} aria-hidden="true">silentboiz.</p>
        <div className={styles.footer}><span>© {new Date().getFullYear()} Trần Bình Minh</span><span>{t.footer.tagline}</span><a href="#hero">{t.footer.backToTop}</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
