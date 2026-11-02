"use client";

import { useEffect } from "react";
import {
  X,
  ExternalLink,
  Github,
  KeyRound,
  CheckCircle,
  Clock,
  Layers,
} from "lucide-react";
import type { Project } from "@/lib/profile-content";
import { PROJECT_PREVIEWS } from "@/data/project-previews";

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  locale?: "vi" | "en";
  caseLabels?: readonly string[];
  fallbackInfo?: {
    kind?: string;
    problem?: string;
    did?: string;
    result?: string;
    description?: string;
  };
}

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  locale = "vi",
  caseLabels,
  fallbackInfo,
}: ProjectDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const isEn = locale === "en";

  // Resolve image
  const previewFallback = project.github_url
    ? PROJECT_PREVIEWS[project.github_url]
    : undefined;
  const imageUrl = project.image_url || previewFallback || null;

  // Bilingual fields resolution
  const title = (isEn && project.title_en) ? project.title_en : project.title;
  const kind =
    (isEn && project.kind_en) ||
    project.kind ||
    fallbackInfo?.kind ||
    (project.status === "completed"
      ? (isEn ? "Completed Project" : "Dự án hoàn thành")
      : (isEn ? "In Development" : "Đang phát triển"));

  const problem = (isEn && project.problem_en) || project.problem || fallbackInfo?.problem || "";
  const did = (isEn && project.did_en) || project.did || fallbackInfo?.did || "";
  const result = (isEn && project.result_en) || project.result || fallbackInfo?.result || "";
  const description = (isEn && project.description_en) || project.description || "";

  const labels = caseLabels || (isEn
    ? ["Problem", "What I Did", "Results"]
    : ["Vấn đề", "Việc đã làm", "Kết quả"]);

  const isDroneFood =
    project.title.toLowerCase().includes("dronefood") ||
    project.github_url?.includes("DroneFood");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] shadow-2xl overflow-hidden font-sans transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--line)",
        }}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-[var(--line)] flex items-start justify-between bg-[var(--tile)]/60">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold">
                {kind}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  project.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25"
                }`}
              >
                {project.status === "completed" ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>{isEn ? "Completed" : "Đã hoàn thành"}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    <span>{isEn ? "Active" : "Đang phát triển"}</span>
                  </>
                )}
              </span>
            </div>

            <h2
              id="project-modal-title"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]"
            >
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] bg-[var(--tile)] hover:bg-[var(--line)] border border-[var(--line)] transition-colors shrink-0"
            aria-label={isEn ? "Close modal" : "Đóng chi tiết dự án"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 text-sm leading-relaxed scroll-smooth">
          {/* Project Image Banner */}
          {imageUrl && (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--tile)] shadow-md group">
              <img
                src={imageUrl}
                alt={`Screenshot of ${title}`}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Tech Stack Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] uppercase tracking-wider font-semibold">
                <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{isEn ? "Technologies & Architecture" : "Công nghệ & Kiến trúc sử dụng"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-[var(--tile)] border border-[var(--line)] text-[var(--text)] shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Case Study Details */}
          {(problem || did || result) && (
            <div className="space-y-3.5 pt-1">
              {/* Problem */}
              {problem && (
                <div className="p-4 rounded-2xl bg-[var(--tile)] border border-[var(--line)] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-mono text-xs flex items-center justify-center font-bold">
                      01
                    </span>
                    <h3 className="font-semibold text-[var(--text)] text-sm">
                      {labels[0]}
                    </h3>
                  </div>
                  <p className="text-[var(--text)]/85 text-xs sm:text-sm pl-7 leading-relaxed whitespace-pre-line">
                    {problem}
                  </p>
                </div>
              )}

              {/* What I did */}
              {did && (
                <div className="p-4 rounded-2xl bg-[var(--tile)] border border-[var(--line)] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-mono text-xs flex items-center justify-center font-bold">
                      02
                    </span>
                    <h3 className="font-semibold text-[var(--text)] text-sm">
                      {labels[1]}
                    </h3>
                  </div>
                  <p className="text-[var(--text)]/85 text-xs sm:text-sm pl-7 leading-relaxed whitespace-pre-line">
                    {did}
                  </p>
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="p-4 rounded-2xl bg-[var(--tile)] border border-[var(--line)] space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--accent)]/15 text-[var(--accent)] font-mono text-xs flex items-center justify-center font-bold">
                      03
                    </span>
                    <h3 className="font-semibold text-[var(--text)] text-sm">
                      {labels[2]}
                    </h3>
                  </div>
                  <p className="text-[var(--text)]/85 text-xs sm:text-sm pl-7 leading-relaxed whitespace-pre-line">
                    {result}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test Account / Testing Credentials Section */}
          <div className="p-4 rounded-2xl bg-[var(--tile)] border border-[var(--accent)]/35 space-y-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-[var(--text)] text-sm font-mono">
                {isEn ? "Testing & Demo Instructions" : "Tài khoản & Hướng dẫn kiểm thử (Testing Account)"}
              </h3>
            </div>

            {isDroneFood ? (
              <div className="space-y-2 text-xs sm:text-sm text-[var(--text)]/85 pl-6">
                <p>
                  {isEn
                    ? "DroneFood live demo allows full testing of ordering & drone dispatching workflows:"
                    : "Hệ thống DroneFood hỗ trợ trải nghiệm trực tiếp luồng đặt món & điều vận:"}
                </p>
                <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] font-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-[var(--muted)]">
                    <span>{isEn ? "Demo customer account:" : "Tài khoản khách hàng demo:"}</span>
                    <span className="text-[var(--accent)] font-semibold">{isEn ? "Open self-registration" : "Tự do đăng ký mới"}</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--muted)]">
                    <span>{isEn ? "Dispatcher / Restaurant account:" : "Tài khoản phân hệ Dispatcher / Nhà hàng:"}</span>
                    <span className="text-[var(--text)]">{isEn ? "Contact via email for access" : "Liên hệ qua email để cấp quyền"}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {isEn
                    ? "💡 You can quickly register a test account on the live demo to create delivery orders and track drone dispatching via QR!"
                    : "💡 Bạn có thể đăng ký nhanh một tài khoản trên trang demo để tạo đơn đặt món và theo dõi quá trình giao nhận hàng qua mã QR!"}
                </p>
              </div>
            ) : description ? (
              <div className="text-xs sm:text-sm text-[var(--text)]/85 pl-6 space-y-1.5">
                <p className="whitespace-pre-line">{description}</p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-[var(--muted)] pl-6">
                {isEn
                  ? "Public platform with no credentials required. Feel free to open the Live Demo link below!"
                  : "Hệ thống công khai hoặc không yêu cầu đăng nhập phức tạp. Bạn có thể mở link Demo bên dưới để trải nghiệm trực tiếp!"}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--line)] bg-[var(--tile)]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                <span>{isEn ? "Live Demo" : "Trải nghiệm Demo"}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--tile)] hover:bg-[var(--line)] text-[var(--text)] font-medium text-xs sm:text-sm border border-[var(--line)] transition-all active:scale-95"
              >
                <Github className="w-4 h-4" />
                <span>{isEn ? "GitHub Repository" : "Mã nguồn GitHub"}</span>
              </a>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--tile)] transition-colors"
          >
            {isEn ? "Close" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
}
