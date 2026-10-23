"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Copy, Download } from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import ProjectPreview from "@/components/ProjectPreview";
import { PROJECT_PREVIEWS } from "@/data/project-previews";
import { SocialIcon } from "@/components/SocialIcon";
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
      <a className={styles.skipLink} href="#main">Đến nội dung chính</a>
      <div className={styles.pageContent}>
      <div className={styles.frame}>
        <FloatingNavbar />
        <main id="main">
          <section id="hero" className={styles.hero}>
            <h1 aria-label="Trần Bình Minh."><span className={styles.nameMask} aria-hidden="true"><span data-name-word>Trần</span></span>{" "}<span className={styles.nameMask} aria-hidden="true"><span data-name-word>Bình</span></span>{" "}<span className={styles.nameMask} aria-hidden="true"><span data-name-word>Minh.</span></span></h1>
            <div className={styles.heroDetails}>
              <div className={styles.heroIntro}>
                <p className={styles.role}>Lập trình viên phía máy chủ</p>
                <p>Mình là Minh, sinh viên năm cuối CNTT. Mình thích tìm hiểu cách một ứng dụng vận hành, rồi tự tay xây dựng nó.</p>
                <div className={styles.actions}>
                  <a className={styles.primary} href="#projects">Xem dự án <ArrowDown size={17} /></a>
                  {cvState === "ready" && <a className={styles.textLink} href="/api/cv" download>Tải CV <Download size={17} /></a>}
                  <a className={styles.textLink} href={`mailto:${EMAIL}`}>Trò chuyện với mình <ArrowUpRight size={17} /></a>
                </div>
                {cvState === "error" && <p className={styles.cvNotice} role="status">Chưa thể tải CV. <button type="button" onClick={() => void refreshCv()}>Thử lại</button></p>}
              </div>
              <div className={styles.personalNote}>
                {avatar && <img src={avatar} alt="Ảnh đại diện của Minh" width="60" height="60" className={styles.avatar} />}
                <div><span>@{data.profile?.username || "silentboiz"}</span><p>Viết phần mềm.<br />Thử một món đồ mới.<br />Nghe một bản nhạc hay.</p></div>
              </div>
            </div>
            <a className={styles.heroFoot} href="#projects">Một vài thứ mình đang xây dựng <ArrowDown size={16} /></a>
          </section>

          {failures.length > 0 && <div className={styles.notice} role="status">
            <span>Một phần dữ liệu chưa tải được. Nội dung có sẵn vẫn được giữ lại.</span>
            <button onClick={() => void refresh()} disabled={loading}>{loading ? "Đang tải…" : "Thử lại"}</button>
          </div>}

          <section id="projects" className={styles.section}>
            <div className={styles.sectionHeading} data-reveal>
              <h2>Những thứ mình làm.</h2>
            </div>
            <div className={styles.projects}>
              {projects.map(project => {
                const demo = publicUrl(project.demo_url);
                const source = publicUrl(project.github_url);
                const image = publicUrl(project.image_url) || (source ? PROJECT_PREVIEWS[source] : undefined);
                // This repository's stored description still describes its former gaming layout.
                const isThisSite = source === "https://github.com/2imTBM2k4/MyOwnedProfileWeb";
                return <article key={project.id} className={`${styles.project} ${image ? styles.projectWithImage : ""}`} data-reveal>
                  {image && <ProjectPreview image={image} title={isThisSite ? "Trang cá nhân" : project.title} href={demo || source} />}
                  <div className={styles.projectContent}>
                    <h3>{isThisSite ? "Trang cá nhân" : project.title}</h3>
                    <div className={styles.projectTop}>
                      <span>{project.status === "completed" ? "Đã hoàn thành" : project.status === "active" ? "Đang phát triển" : "Dự án cá nhân"}</span>
                      {project.created_at && !Number.isNaN(Date.parse(project.created_at)) && <span>{new Date(project.created_at).getFullYear()}</span>}
                    </div>
                    {(isThisSite || project.description) && <p className={styles.projectDescription}>{isThisSite ? "Trang hồ sơ cá nhân xây dựng bằng Next.js, giới thiệu các dự án lập trình, thông tin liên hệ và một góc dành cho thiết bị đang dùng." : project.description}</p>}
                    {project.tags?.some(tag => !isFeaturedTag(tag)) && <p className={styles.technologies}>{project.tags.filter(tag => !isFeaturedTag(tag)).join(" · ")}</p>}
                    <div className={styles.projectLinks}>
                      {demo && <a href={demo} target="_blank" rel="noopener noreferrer" aria-label={`Xem ${project.title} (mở tab mới)`}>Xem sản phẩm <ArrowUpRight size={18} /></a>}
                      {source && <a href={source} target="_blank" rel="noopener noreferrer" aria-label={`Mã nguồn ${project.title} (mở tab mới)`}>Mã nguồn <ArrowUpRight size={18} /></a>}
                    </div>
                  </div>
                </article>;
              })}
              {projects.length === 0 && <p className={styles.empty} role="status">{loading ? "Đang tải các dự án…" : failures.includes("projects") ? "Chưa thể tải danh sách dự án. Bạn có thể thử lại ở trên." : "Mình đang cập nhật dự án. Quay lại sau nhé."}</p>}
            </div>
            {github && <a className={styles.textLink} href={publicUrl(github.url)} target="_blank" rel="noopener noreferrer">Ghé GitHub của mình <ArrowUpRight size={18} /></a>}
          </section>

          <section id="about" className={`${styles.section} ${styles.about}`}>
            <div data-reveal><h2>Một chút về mình.</h2><p className={styles.aboutAside}>Sinh viên năm cuối<br />Kỹ sư Công nghệ thông tin</p></div>
            <div className={styles.aboutBody}>
              <p className={styles.statement} data-reveal>Mình muốn hiểu cả những gì diễn ra phía sau một giao diện.</p>
              <p data-reveal>Đó là lý do mình chọn đi sâu vào lập trình phía máy chủ: cách dữ liệu được lưu, một yêu cầu được xử lý và các phần của ứng dụng làm việc cùng nhau.</p>
              <p data-reveal>Mình đang học qua các dự án cá nhân, tập viết mã dễ đọc và xử lý đúng những tình huống thực tế. Hiện mình tìm kiếm cơ hội bắt đầu công việc lập trình phía máy chủ.</p>
              <div className={styles.skillList} data-reveal>
                <div><span>Ngôn ngữ & nền tảng</span><p>JavaScript · TypeScript · Node.js</p></div>
                <div><span>Dữ liệu</span><p>PostgreSQL · Supabase</p></div>
                <div><span>Công cụ làm việc</span><p>Git · GitHub · Docker · Postman</p></div>
              </div>
            </div>
          </section>

          <section id="gears" className={`${styles.section} ${styles.gears}`}>
            <div className={styles.sectionHeading} data-reveal>
              <div><h2>Ngoài những dòng mã.</h2><p>Một góc nhỏ cho bàn phím, âm thanh và những món đồ mình dùng mỗi ngày.</p></div>
              <Link className={styles.textLink} href="/gears">Góc thiết bị <ArrowUpRight size={18} /></Link>
            </div>
            <div className={styles.gearGrid}>
              {gears.map(gear => <article className={styles.gear} key={gear.id} data-reveal>
                {publicUrl(gear.image_url) && <Link href="/gears" className={styles.gearImage} aria-label={`Xem ${gear.name} trong góc thiết bị`}><img src={publicUrl(gear.image_url)} alt={gear.name} loading="lazy" /></Link>}
                <div className={styles.gearMeta}><span>{gear.brand || "Đang sử dụng"}</span><span>Đang dùng</span></div>
                <h3>{gear.name}</h3>
                {gear.notes && <p className={styles.gearNotes}>{gear.notes}</p>}
              </article>)}
            </div>
            {gears.length === 0 && <p className={styles.empty} role="status">{loading ? "Đang tải thiết bị…" : failures.includes("gears") ? "Chưa thể tải thiết bị. Bạn có thể thử lại ở trên." : "Góc thiết bị đang được cập nhật."}</p>}
          </section>

        </main>
      </div>
      </div>
      <footer id="contact" className={styles.footerStage} data-footer-reveal>
        <div className={styles.footerPanel}>
          <div className={styles.frame}>
          <div className={styles.footerContact}>
            <h2 data-reveal>Cùng trò chuyện nhé.</h2>
            <div className={styles.contactBody}>
              <p data-reveal>Về một cơ hội làm việc, một dự án,<br />hay đơn giản là một chiếc bàn phím hay.</p>
              <div className={styles.emailGroup} data-reveal>
                <p className={styles.location}>Ho Chi Minh City, Vietnam</p>
                <a className={styles.email} href={`mailto:${EMAIL}`}>{EMAIL} <ArrowUpRight size={22} /></a>
                <button className={styles.copyButton} onClick={() => void copyEmail()} aria-label="Sao chép địa chỉ email">{copyState === "copied" ? <Check size={16} /> : <Copy size={16} />}<span>{copyState === "copied" ? "Đã sao chép" : "Sao chép"}</span></button>
                <span className={styles.copyStatus} role="status">{copyState === "failed" ? "Chưa sao chép được. Bạn có thể chọn địa chỉ email hoặc nhấn để gửi thư." : copyState === "copied" ? "Đã sao chép địa chỉ email." : ""}</span>
              </div>
            </div>
            <div className={styles.socials} data-reveal>{socialLinks.map(link => <a key={link.id} href={publicUrl(link.url)} target="_blank" rel="noopener noreferrer"><SocialIcon platform={link.platform} className="w-4 h-4" />{link.platform}<ArrowUpRight size={15} /></a>)}</div>
          </div>
          <p className={styles.footerName} aria-hidden="true">silentboiz.</p>
        <div className={styles.footer}><span>© {new Date().getFullYear()} Trần Bình Minh</span><span>Đang học. Đang làm. Đang khám phá.</span><a href="#hero">Về đầu trang ↑</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
