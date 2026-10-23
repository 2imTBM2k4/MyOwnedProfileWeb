"use client";

import { useState } from "react";
import { Terminal, Check, Copy, Activity, RefreshCw } from "lucide-react";

export default function TechTerminal() {
  const [activeTab, setActiveTab] = useState<"info" | "health" | "stack">("info");
  const [copied, setCopied] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [latency, setLatency] = useState(18);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPing = () => {
    setPinging(true);
    setTimeout(() => {
      setLatency(Math.floor(12 + Math.random() * 10));
      setPinging(false);
    }, 400);
  };

  const sysInfo = `{
  "engineer": "Trần Bình Minh",
  "specialization": "Backend Development",
  "status": "ready_for_opportunities",
  "core_competencies": [
    "Database Optimization & Indexing",
    "Node.js / TypeScript RESTful APIs",
    "Clean & Maintainable Architecture"
  ]
}`;

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/60 dark:border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden font-mono text-xs transition-all duration-300 hover:border-blue-500/50">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-slate-800/60 dark:bg-slate-900/60 border-b border-slate-700/50 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity" />
          <span className="ml-2 text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-blue-400" />
            <span>minh@backend-node: ~</span>
          </span>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={runPing}
            disabled={pinging}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
            title="Kiểm tra độ trễ (latency)"
          >
            <Activity className={`w-3 h-3 text-emerald-400 ${pinging ? "animate-spin" : ""}`} />
            <span>{latency}ms</span>
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Terminal Navigation Tabs */}
      <div className="flex items-center gap-1 px-3 pt-2 bg-slate-900/40 border-b border-slate-800/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-3 py-1.5 rounded-t-lg text-[11px] transition-all flex items-center gap-1.5 ${
            activeTab === "info"
              ? "bg-slate-800/90 text-blue-400 border-t-2 border-blue-500 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>sysinfo.json</span>
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`px-3 py-1.5 rounded-t-lg text-[11px] transition-all flex items-center gap-1.5 ${
            activeTab === "health"
              ? "bg-slate-800/90 text-blue-400 border-t-2 border-blue-500 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>health-check.sh</span>
        </button>
        <button
          onClick={() => setActiveTab("stack")}
          className={`px-3 py-1.5 rounded-t-lg text-[11px] transition-all flex items-center gap-1.5 ${
            activeTab === "stack"
              ? "bg-slate-800/90 text-blue-400 border-t-2 border-blue-500 font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>tech-stack.env</span>
        </button>

        <div className="ml-auto flex items-center pr-1">
          <button
            onClick={() => handleCopy(sysInfo)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Sao chép nội dung"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Content Body */}
      <div className="p-4 text-slate-300 leading-relaxed overflow-x-auto min-h-[175px]">
        {activeTab === "info" && (
          <div className="space-y-1">
            <div className="text-slate-500 flex items-center gap-1">
              <span className="text-emerald-400">$</span> cat ~/sysinfo.json
            </div>
            <pre className="text-slate-300 text-[11.5px] font-mono leading-5">
              <span className="text-slate-500">&#123;</span>
              {"\n  "}<span className="text-blue-400">&quot;engineer&quot;</span>: <span className="text-emerald-300">&quot;Trần Bình Minh&quot;</span>,
              {"\n  "}<span className="text-blue-400">&quot;role&quot;</span>: <span className="text-emerald-300">&quot;Backend Developer&quot;</span>,
              {"\n  "}<span className="text-blue-400">&quot;focus&quot;</span>: <span className="text-amber-300">&quot;High-Performance & Reliability&quot;</span>,
              {"\n  "}<span className="text-blue-400">&quot;availability&quot;</span>: <span className="text-emerald-400">&quot;Open for Work&quot;</span>
              {"\n"}<span className="text-slate-500">&#125;</span>
            </pre>
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-2 text-[11.5px]">
            <div className="text-slate-500 flex items-center gap-1">
              <span className="text-emerald-400">$</span> curl -I https://binhminh.dev/health
            </div>
            <div className="space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="text-emerald-400 font-semibold">HTTP/2 200 OK</div>
              <div><span className="text-slate-500">status:</span> <span className="text-emerald-300">HEALTHY_RUNNING</span></div>
              <div><span className="text-slate-500">uptime:</span> <span className="text-slate-200">99.98%</span></div>
              <div><span className="text-slate-500">latency:</span> <span className="text-amber-300">{latency}ms (p99: 24ms)</span></div>
              <div><span className="text-slate-500">db_pool:</span> <span className="text-blue-300">Active (PostgreSQL, Supabase)</span></div>
            </div>
          </div>
        )}

        {activeTab === "stack" && (
          <div className="space-y-2 text-[11.5px]">
            <div className="text-slate-500 flex items-center gap-1">
              <span className="text-emerald-400">$</span> env | grep -E &quot;BACKEND|DATABASE|TOOLS&quot;
            </div>
            <div className="space-y-1 text-slate-300 font-mono">
              <div><span className="text-purple-400">RUNTIME</span>=<span className="text-emerald-300">&quot;Node.js, TypeScript, Go&quot;</span></div>
              <div><span className="text-purple-400">DATABASE</span>=<span className="text-emerald-300">&quot;PostgreSQL, Redis, Supabase&quot;</span></div>
              <div><span className="text-purple-400">TECHNIQUES</span>=<span className="text-emerald-300">&quot;Connection Pool, Indexing, Caching&quot;</span></div>
              <div><span className="text-purple-400">TOOLING</span>=<span className="text-emerald-300">&quot;Docker, Git, Linux, Postman&quot;</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Footer Status line */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>master*</span>
        </div>
        <div>UTF-8 • Node v20.x • Ready</div>
      </div>
    </div>
  );
}
