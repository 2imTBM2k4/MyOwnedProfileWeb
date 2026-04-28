"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Monitor,
  Mouse,
  Keyboard,
  Headphones,
  Cpu,
  Gamepad2,
  Mic,
  ExternalLink,
  Github,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import LoadingScreen from "@/components/LoadingScreen";
import DiscordStatus from "@/components/DiscordStatus";
import HoYoStats from "@/components/HoYoStats";
import SteamStats from "@/components/SteamStats";

// 👇 Thay bằng Discord ID của bạn (bật Developer Mode → chuột phải tên → Copy ID)
const DISCORD_ID = "738686448148021250";

type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
};

type Gear = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: "active" | "retired" | null;
  image_url: string | null;
};

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  display_name: string | null;
};

type Game = {
  id: string;
  title: string;
  profile_url: string | null;
  status: "online" | "offline" | null;
  image_url?: string | null;
  hoyolab_game?: "genshin" | "hsr" | "hi3" | "zzz" | null;
  hoyolab_uid?: string | null;
  hoyolab_server?: string | null;
  steam_appid?: string | null;
  steam_id?: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  status: "active" | "completed" | null;
  tags: string[] | null;
  created_at: string;
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  monitor: <Monitor className="w-5 h-5" />,
  mouse: <Mouse className="w-5 h-5" />,
  keyboard: <Keyboard className="w-5 h-5" />,
  headset: <Headphones className="w-5 h-5" />,
  headphones: <Headphones className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  gpu: <Cpu className="w-5 h-5" />,
  microphone: <Mic className="w-5 h-5" />,
  mic: <Mic className="w-5 h-5" />,
};

const GAME_STATUS_COLORS: Record<string, string> = {
  online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  offline: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  // legacy values
  playing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  plan_to_play: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  dropped: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const GAME_STATUS_LABELS: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  playing: "Online",
  completed: "Offline",
  plan_to_play: "Offline",
  dropped: "Offline",
};

const isOnline = (status: string | null) =>
  status === "online" || status === "playing";

type Tab = "setup" | "games" | "projects";

export default function HomePage() {
  const [tab, setTab] = useState<Tab>(() => {
    // Restore last tab from sessionStorage on mount
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("active_tab") as Tab;
      if (saved && ["setup", "games", "projects"].includes(saved)) return saved;
    }
    return "setup";
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gears, setGears] = useState<Gear[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const CACHE_KEY = "site_data_cache";
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const applyData = (d: any) => {
    if (d.profile) setProfile(d.profile);
    setGears(d.gears || []);
    setGames(d.games || []);
    setSocialLinks(d.socialLinks || []);
    setProjects(d.projects || []);
  };

  const loadData = async () => {
    // 1. Try to load from cache first (instant, no loading screen)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ts, data } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          applyData(data);
          setLoading(false);
          // Silently refresh in background
          fetchFresh(false);
          return;
        }
      }
    } catch {}

    // 2. No cache - show loading screen and fetch
    fetchFresh(true);
  };

  const fetchFresh = async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    try {
      const [profileData, gearsData, gamesData, socialData, projectsData] =
        await Promise.all([
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/gears").then((r) => r.json()),
          fetch("/api/games").then((r) => r.json()),
          fetch("/api/social-links").then((r) => r.json()),
          fetch("/api/projects").then((r) => r.json()),
        ]);

      const data = {
        profile: profileData || null,
        gears: gearsData || [],
        games: gamesData || [],
        socialLinks: socialData || [],
        projects: Array.isArray(projectsData) ? projectsData : [],
      };

      applyData(data);

      // Save to cache
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data }),
      );
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showLoading) setTimeout(() => setLoading(false), 300);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "setup", label: "GAMING SETUP" },
    { key: "games", label: "GAMES" },
    { key: "projects", label: "PROJECTS" },
  ];

  const username = profile?.username || "SILENTBOIZ";
  const bio = profile?.bio || "A tech enthusiast, gamer, and maker.";
  const avatarUrl = profile?.avatar_url;
  const coverUrl = profile?.cover_url;

  // Loading screen
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div className="min-h-screen relative text-white flex flex-col">
      {/* Background Cover - Full page */}
      <div className="fixed inset-0 z-0">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#080d14]/85 to-[#080d14]" />
          </>
        ) : (
          <div className="relative w-full h-full bg-[#080d14]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 20% 60%, #1d4ed840 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #0ea5e930 0%, transparent 55%)",
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Profile Header */}
        <div className="max-w-4xl mx-auto px-4 pt-12 w-full flex-1">
          <div className="mb-4 flex items-end gap-5">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-black/30 shrink-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center text-4xl font-bold">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                username[0].toUpperCase()
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-lg">
                {username.toUpperCase()}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-md drop-shadow">
                {bio}
              </p>
            </div>
          </div>

          {/* Discord Status */}
          {DISCORD_ID && <DiscordStatus discordId={DISCORD_ID} />}

          {/* Social quick links */}
          {Array.isArray(socialLinks) && socialLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
                Connect
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((s) => (
                  <Link
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm text-sm text-slate-200 hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-white transition-all group"
                  >
                    <SocialIcon
                      platform={s.platform}
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="font-medium">
                      {s.display_name || s.platform}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 border-b border-white/20 mb-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  sessionStorage.setItem("active_tab", t.key);
                }}
                className={`px-5 py-3 text-xs font-bold tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${
                  tab === t.key
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Gaming Setup */}
          {tab === "setup" && (
            <section className="pb-16">
              {!Array.isArray(gears) || gears.length === 0 ? (
                <p className="text-slate-400 text-center py-16">
                  No gear added yet.
                </p>
              ) : (
                (() => {
                  // Group gears by category
                  const groupedGears = gears.reduce(
                    (acc, gear) => {
                      const category = gear.category || "Other";
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(gear);
                      return acc;
                    },
                    {} as Record<string, Gear[]>,
                  );

                  // Sort each category: active first, then retired
                  Object.keys(groupedGears).forEach((category) => {
                    groupedGears[category].sort((a, b) => {
                      if (a.status === "active" && b.status !== "active")
                        return -1;
                      if (a.status !== "active" && b.status === "active")
                        return 1;
                      return 0;
                    });
                  });

                  // Sort categories alphabetically
                  const sortedCategories = Object.keys(groupedGears).sort();

                  return (
                    <div className="space-y-8">
                      {sortedCategories.map((category) => (
                        <div key={category}>
                          {/* Category Header */}
                          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400/80 mb-4 flex items-center gap-2">
                            <span className="text-slate-500">
                              {CATEGORY_ICONS[category.toLowerCase()] || (
                                <Monitor className="w-4 h-4" />
                              )}
                            </span>
                            {category}
                            <span className="text-xs text-slate-500 font-normal">
                              ({groupedGears[category].length})
                            </span>
                          </h3>

                          {/* Gears in this category */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedGears[category].map((gear) => (
                              <div
                                key={gear.id}
                                className="group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/40 hover:bg-black/50 transition-all"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                    {gear.image_url ? (
                                      <img
                                        src={gear.image_url}
                                        alt={gear.name}
                                        className="w-full h-full object-contain p-1"
                                      />
                                    ) : (
                                      <span className="text-slate-400">
                                        {CATEGORY_ICONS[
                                          gear.category?.toLowerCase() || ""
                                        ] || <Gamepad2 className="w-5 h-5" />}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">
                                      {gear.name}
                                    </p>
                                    {gear.brand && (
                                      <p className="text-sm text-slate-300">
                                        {gear.brand}
                                      </p>
                                    )}
                                    {gear.status === "retired" && (
                                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400">
                                        Retired
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </section>
          )}

          {/* Games */}
          {tab === "games" && (
            <section className="pb-16">
              {!Array.isArray(games) || games.length === 0 ? (
                <p className="text-slate-400 text-center py-16">
                  No games added yet.
                </p>
              ) : (
                (() => {
                  // Group games by status
                  const onlineGames = games.filter(
                    (g) => g.status === "online",
                  );
                  const offlineGames = games.filter(
                    (g) => g.status === "offline" || !g.status,
                  );

                  return (
                    <div className="space-y-8">
                      {/* Online Games Section */}
                      {onlineGames.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Đang chơi
                            <span className="text-xs text-slate-500 font-normal">
                              ({onlineGames.length})
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {onlineGames.map((game) => (
                              <div
                                key={game.id}
                                className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all"
                              >
                                <div className="h-28 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center overflow-hidden">
                                  {game.image_url ? (
                                    <img
                                      src={game.image_url}
                                      alt={game.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Gamepad2 className="w-10 h-10 text-blue-500/20" />
                                  )}
                                </div>
                                <div className="p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-white leading-tight">
                                      {game.title}
                                    </h3>
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                      Online
                                    </span>
                                  </div>
                                  {game.profile_url && (
                                    <a
                                      href={game.profile_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" /> View
                                      Profile
                                    </a>
                                  )}
                                  {/* HoYoLAB Stats */}
                                  {game.hoyolab_game &&
                                    game.hoyolab_uid &&
                                    game.hoyolab_server && (
                                      <HoYoStats
                                        game={game.hoyolab_game}
                                        uid={game.hoyolab_uid}
                                        server={game.hoyolab_server}
                                      />
                                    )}
                                  {/* Steam Stats */}
                                  {game.steam_appid && game.steam_id && (
                                    <SteamStats
                                      appid={game.steam_appid}
                                      steamid={game.steam_id}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Offline Games Section */}
                      {offlineGames.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400/80 mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Offline
                            <span className="text-xs text-slate-500 font-normal">
                              ({offlineGames.length})
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {offlineGames.map((game) => (
                              <div
                                key={game.id}
                                className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all"
                              >
                                <div className="h-28 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center overflow-hidden">
                                  {game.image_url ? (
                                    <img
                                      src={game.image_url}
                                      alt={game.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Gamepad2 className="w-10 h-10 text-blue-500/20" />
                                  )}
                                </div>
                                <div className="p-4">
                                  <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-white leading-tight">
                                      {game.title}
                                    </h3>
                                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 bg-slate-700/50 text-slate-400 border-white/10">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                      Offline
                                    </span>
                                  </div>
                                  {game.profile_url && (
                                    <a
                                      href={game.profile_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" /> View
                                      Profile
                                    </a>
                                  )}
                                  {/* HoYoLAB Stats */}
                                  {game.hoyolab_game &&
                                    game.hoyolab_uid &&
                                    game.hoyolab_server && (
                                      <HoYoStats
                                        game={game.hoyolab_game}
                                        uid={game.hoyolab_uid}
                                        server={game.hoyolab_server}
                                      />
                                    )}
                                  {/* Steam Stats */}
                                  {game.steam_appid && game.steam_id && (
                                    <SteamStats
                                      appid={game.steam_appid}
                                      steamid={game.steam_id}
                                    />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </section>
          )}

          {/* Projects */}
          {tab === "projects" && (
            <section className="pb-16">
              {!Array.isArray(projects) || projects.length === 0 ? (
                <p className="text-slate-400 text-center py-16">
                  No projects added yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all group"
                    >
                      {project.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-white text-lg mb-2">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                            {project.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          {project.github_url && (
                            <a
                              href={project.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                            >
                              <Github className="w-4 h-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {project.demo_url && (
                            <a
                              href={project.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Demo</span>
                            </a>
                          )}
                        </div>
                        {project.status && (
                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                                project.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                  : "bg-slate-700/50 text-slate-400 border border-white/10"
                              }`}
                            >
                              {project.status === "active" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              )}
                              {project.status === "active"
                                ? "Active"
                                : "Completed"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-slate-500 mt-auto">
          silentboiz — Built with Next.js & Supabase
        </footer>
      </div>
    </div>
  );
}
