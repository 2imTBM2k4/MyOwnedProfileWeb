"use client";

import { useEffect, useState } from "react";

type SteamData = {
  enabled: true;
  cached: boolean;
  hours_total: number;
  hours_2weeks: number;
  last_played: number;
  achievements_unlocked: number;
  achievements_total: number;
};

type Props = {
  appid: string;
  steamid: string;
};

function relativeTime(unixTs: number): string {
  if (!unixTs) return "";
  const diff = Math.floor(Date.now() / 1000) - unixTs;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}

export default function SteamStats({ appid, steamid }: Props) {
  const isConfigured = Boolean(
    appid &&
    steamid &&
    appid !== "your-steam-appid-here" &&
    steamid !== "your-steam-id-here" &&
    appid.trim() !== "" &&
    steamid.trim() !== ""
  );

  const [data, setData] = useState<SteamData | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    fetch(
      `/api/steam?appid=${encodeURIComponent(appid)}&steamid=${encodeURIComponent(steamid)}`
    )
      .then(async (r) => {
        if (!r.ok) return { enabled: false };
        return r.json();
      })
      .then((res) => {
        if (!res || res.enabled === false || res.error) {
          setLoading(false);
          return;
        }
        if (typeof res.hours_total === "number") {
          setData(res as SteamData);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [appid, steamid, isConfigured]);

  if (loading || !data || typeof data.hours_total !== "number") return null;

  const stats = [
    { label: "Tổng giờ chơi", value: `${data.hours_total}h` },
    ...(data.achievements_total > 0
      ? [
          {
            label: "Thành tựu",
            value: `${data.achievements_unlocked}/${data.achievements_total}`,
          },
        ]
      : []),
    ...(data.last_played
      ? [{ label: "Lần cuối chơi", value: relativeTime(data.last_played) }]
      : []),
  ];

  if (stats.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-cyan-400">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
          Steam
        </span>
      </div>
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
