"use client";

import { useEffect, useState } from "react";

type HoYoData = {
  level?: number;
  nickname?: string;
  server?: string;
  characters?: number;
  achievements?: number;
  days_active?: number;
  spiral_abyss?: string;
  abyss?: string;
  chests?: number;
  chest_opened?: number;
};

type Props = {
  game: string;
  uid: string;
  server: string;
};

const GAME_LABELS: Record<string, string> = {
  genshin: "Genshin Impact",
  hsr: "Honkai: Star Rail",
  hi3: "Honkai Impact 3rd",
  zzz: "Zenless Zone Zero",
};

const GAME_COLORS: Record<string, string> = {
  genshin: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  hsr: "text-purple-400 border-purple-500/20 bg-purple-500/5",
  hi3: "text-red-400 border-red-500/20 bg-red-500/5",
  zzz: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
};

export default function HoYoStats({ game, uid, server }: Props) {
  const [data, setData] = useState<HoYoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/hoyolab?game=${game}&uid=${uid}&server=${server}`)
      .then((r) => r.json())
      .then((res) => {
        // Not configured - silently hide
        if (res.enabled === false) {
          setLoading(false);
          return;
        }
        if (res.error) {
          console.error("HoYoStats error:", res.error);
          setError(res.error);
          setLoading(false);
          return;
        }
        if (res.data) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("HoYoStats fetch failed:", err);
        setError("Failed to load");
        setLoading(false);
      });
  }, [game, uid, server]);

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
        <div className="w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin" />
        Loading stats...
      </div>
    );
  }

  if (!data || error) return null;

  const colorClass =
    GAME_COLORS[game] || "text-blue-400 border-blue-500/20 bg-blue-500/5";

  const stats = [
    data.level != null && { label: "Level", value: data.level },
    data.characters != null && { label: "Characters", value: data.characters },
    data.achievements != null && {
      label: "Achievements",
      value: data.achievements,
    },
    data.days_active != null && {
      label: "Days Active",
      value: data.days_active,
    },
    data.chests != null && { label: "Chests", value: data.chests },
    data.chest_opened != null && { label: "Chests", value: data.chest_opened },
    (data.abyss || data.spiral_abyss) != null && {
      label: "Abyss",
      value: data.abyss || data.spiral_abyss,
    },
  ].filter(Boolean) as { label: string; value: string | number }[];

  if (stats.length === 0) return null;

  return (
    <div className={`mt-3 rounded-lg border p-3 ${colorClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
          {GAME_LABELS[game]}
        </span>
        {data.nickname && (
          <span className="text-xs opacity-60">
            {data.nickname} · {uid}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-sm font-bold text-white">{s.value}</p>
            <p className="text-xs opacity-50">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
