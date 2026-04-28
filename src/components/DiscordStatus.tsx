"use client";

import { useEffect, useState, useRef } from "react";

type LanyardActivity = {
  name: string;
  type: number;
  details?: string;
  state?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  application_id?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
};

type LanyardSpotify = {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
};

type LanyardData = {
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  spotify: LanyardSpotify | null;
};

const STATUS_COLORS: Record<string, string> = {
  online: "bg-emerald-400",
  idle: "bg-yellow-400",
  dnd: "bg-red-500",
  offline: "bg-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

function getActivityImage(activity: LanyardActivity): string | null {
  const img = activity.assets?.large_image;
  if (!img) return null;
  if (img.startsWith("mp:external/")) {
    const decoded = decodeURIComponent(img.replace("mp:external/", ""));
    const match = decoded.match(/https?:\/\/.*/);
    return match ? match[0] : null;
  }
  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${img}.png`;
  }
  return null;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Live elapsed timer for game activity
function useElapsed(startTimestamp?: number) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTimestamp) return;
    const update = () => setElapsed(Date.now() - startTimestamp);
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTimestamp]);
  return elapsed;
}

// Live Spotify progress
function SpotifyProgress({ spotify }: { spotify: LanyardSpotify }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const duration = spotify.timestamps.end - spotify.timestamps.start;
  const elapsed = Math.min(now - spotify.timestamps.start, duration);
  const progress = Math.min((elapsed / duration) * 100, 100);

  return (
    <div className="mt-2 space-y-1">
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatDuration(elapsed)}</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}

// Game activity card with live elapsed time
function GameActivity({ activity }: { activity: LanyardActivity }) {
  const elapsed = useElapsed(activity.timestamps?.start);
  const activityImg = getActivityImage(activity);

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 max-w-sm">
      {activityImg ? (
        <img
          src={activityImg}
          alt={activity.name}
          className="w-12 h-12 rounded-lg object-cover shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-slate-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.5 12a1.5 1.5 0 01-1.5-1.5A1.5 1.5 0 0117.5 9a1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m-3-4A1.5 1.5 0 0113 6.5 1.5 1.5 0 0114.5 5a1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m-5 0A1.5 1.5 0 018 6.5 1.5 1.5 0 019.5 5 1.5 1.5 0 0111 6.5 1.5 1.5 0 019.5 8m-3 4A1.5 1.5 0 015 10.5 1.5 1.5 0 016.5 9 1.5 1.5 0 018 10.5 1.5 1.5 0 016.5 12M12 3a9 9 0 00-9 9 9 9 0 009 9 9 9 0 009-9 9 9 0 00-9-9z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">
          Playing
        </p>
        <p className="text-sm font-semibold text-white truncate">
          {activity.name}
        </p>
        {activity.details && (
          <p className="text-xs text-slate-400 truncate">{activity.details}</p>
        )}
        {activity.state && (
          <p className="text-xs text-slate-500 truncate">{activity.state}</p>
        )}
        {/* Live elapsed time */}
        {activity.timestamps?.start && elapsed > 0 && (
          <p className="text-xs text-slate-600 mt-1">
            {formatDuration(elapsed)} elapsed
          </p>
        )}
      </div>
    </div>
  );
}

export default function DiscordStatus({ discordId }: { discordId: string }) {
  const [data, setData] = useState<LanyardData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!discordId) return;

    const connect = () => {
      const ws = new WebSocket("wss://api.lanyard.rest/socket");
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.op === 1) {
          heartbeatRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: 3 }));
            }
          }, msg.d.heartbeat_interval);
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
        }
        if (msg.op === 0) setData(msg.d);
      };

      ws.onclose = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    };

    connect();
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      wsRef.current?.close();
    };
  }, [discordId]);

  if (!data) return null;

  const activity = data.activities.find((a) => a.type === 0);
  const status = data.discord_status;

  return (
    <div className="mb-5 flex flex-col gap-2">
      {/* Discord Status dot */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLORS[status]} ${status === "online" ? "animate-pulse" : ""}`}
        />
        <span className="text-xs text-slate-400">
          Discord —{" "}
          <span className="text-slate-300 font-medium">
            {STATUS_LABELS[status]}
          </span>
        </span>
      </div>

      {/* Game Activity with elapsed time */}
      {activity && <GameActivity activity={activity} />}

      {/* Spotify with progress bar */}
      {data.spotify && (
        <a
          href={`https://open.spotify.com/track/${data.spotify.track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-0 px-4 py-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 max-w-sm hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <img
              src={data.spotify.album_art_url}
              alt={data.spotify.album}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-emerald-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                Listening on Spotify
              </p>
              <p className="text-sm font-semibold text-white truncate">
                {data.spotify.song}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {data.spotify.artist}
              </p>
            </div>
          </div>
          {/* Live progress bar */}
          <SpotifyProgress spotify={data.spotify} />
        </a>
      )}
    </div>
  );
}
