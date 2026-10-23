"use client";

import { useState, useRef, useCallback } from "react";
import {
  Layers,
  Cpu,
  Database,
  Server,
  Headphones,
  Check,
  Copy,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LiquidHeroCard() {
  const [activeTab, setActiveTab] = useState<"philosophy" | "stack">(
    "philosophy"
  );
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Subtle 3D tilt calculation (góc nghiêng 3D nhẹ nhàng tối đa 6 độ)
      const rotateX = ((y / rect.height) - 0.5) * -10;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      setRotate({ x: rotateX, y: rotateY });
      setSheenPos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    },
    []
  );

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const copyContact = () => {
    navigator.clipboard.writeText("2004.tranbinhminh@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full flex justify-center py-2"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative w-full max-w-lg rounded-3xl glass-liquid p-6 sm:p-7 shadow-2xl transition-all duration-300 overflow-hidden group select-none"
      >
        {/* Specular Liquid Light Refraction (Vệt sáng khúc xạ lướt theo chuột) */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
          style={{
            background: `radial-gradient(400px circle at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.2), transparent 70%)`,
          }}
        />

        {/* Ambient Glass Glow Orb behind content */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/20 dark:bg-blue-400/15 blur-2xl animate-pulse" />

        {/* Header: Persona Badge & Quick Action */}
        <div className="relative z-20 flex items-center justify-between pb-5 border-b border-black/[0.05] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-[var(--ink)]">
                  Trần Bình Minh
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse" />
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Sinh viên năm 4 CNTT • Software Engineer
              </p>
            </div>
          </div>

          {/* Liquid Copy Email Pill */}
          <button
            onClick={copyContact}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium glass-liquid-subtle hover:bg-white/80 dark:hover:bg-slate-800/80 text-[var(--ink)] transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
            title="Sao chép email liên hệ"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Đã chép!
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />
                <span>Email</span>
              </>
            )}
          </button>
        </div>

        {/* Liquid Tab Controls */}
        <div className="relative z-20 flex items-center gap-1.5 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl mt-4 border border-black/[0.03] dark:border-white/[0.05]">
          <button
            onClick={() => setActiveTab("philosophy")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "philosophy"
                ? "bg-white dark:bg-slate-800 text-[var(--ink)] shadow-xs font-semibold"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Nguyên tắc</span>
          </button>

          <button
            onClick={() => setActiveTab("stack")}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === "stack"
                ? "bg-white dark:bg-slate-800 text-[var(--ink)] shadow-xs font-semibold"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Kỹ năng</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="relative z-20 mt-4 min-h-[160px] flex flex-col justify-between">
          {activeTab === "philosophy" && (
            <div className="space-y-3.5 text-xs animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--ink)]">
                    Thiết kế & Tối ưu CSDL
                  </h4>
                  <p className="text-[var(--muted)] leading-relaxed mt-0.5">
                    Chú trọng chuẩn hóa schema, đánh index đúng mục đích và tối ưu
                    câu lệnh truy vấn trước khi tìm đến các tầng cache phức tạp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--ink)]">
                    Kiểm soát lỗi chặt chẽ
                  </h4>
                  <p className="text-[var(--muted)] leading-relaxed mt-0.5">
                    Validate dữ liệu cẩn thận ở API, gom cụm xử lý lỗi tập trung
                    qua middleware và trả về response chuẩn hóa rõ ràng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--ink)]">
                    Đơn giản & Dễ bảo trì
                  </h4>
                  <p className="text-[var(--muted)] leading-relaxed mt-0.5">
                    Ưu tiên code mạch lạc, giải quyết đúng trọng tâm bài toán, tránh
                    đưa vào những công cụ hay kiến trúc dư thừa khi chưa cần thiết.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stack" && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <span className="text-[10px] font-semibold tracking-wider text-[var(--muted)] uppercase">
                  Ngôn ngữ & Môi trường
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["Node.js", "TypeScript", "JavaScript", "Go (Cơ bản)"].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-xl glass-liquid-subtle text-xs font-medium text-[var(--ink)]"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold tracking-wider text-[var(--muted)] uppercase">
                  Cơ sở dữ liệu
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["PostgreSQL", "Redis", "Supabase", "MongoDB"].map((db) => (
                    <span
                      key={db}
                      className="px-2.5 py-1 rounded-xl glass-liquid-subtle text-xs font-medium text-[var(--ink)]"
                    >
                      {db}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold tracking-wider text-[var(--muted)] uppercase">
                  Công cụ & Hạ tầng
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {["Docker", "Git / GitHub", "Linux CLI", "Postman", "REST API"].map(
                    (tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 rounded-xl glass-liquid-subtle text-xs font-medium text-[var(--ink)]"
                      >
                        {tool}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Pill Status */}
        <div className="relative z-20 mt-5 pt-3.5 border-t border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Kỹ sư CNTT (Năm 4)</span>
          </span>
          <span className="text-[var(--ink)] font-medium">Hà Nội, Việt Nam</span>
        </div>
      </div>
    </div>
  );
}
