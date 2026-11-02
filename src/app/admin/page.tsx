"use client";

import { Children, cloneElement, isValidElement, useId, useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
  Gamepad2,
  Monitor,
  Link as LinkIcon,
  Upload,
  Camera,
  FileCode,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";
import ImageCropper from "@/components/ImageCropper";
import RAWGImagePicker from "@/components/RAWGImagePicker";
import ThemeToggle from "@/components/ThemeToggle";
import styles from "./admin.module.css";
import { sortRows } from "@/lib/admin-sort";
import { validateCv } from "@/lib/cv";

const GEAR_CATEGORIES = [
  { value: "keyboard", label: "Bàn phím (Keyboard)" },
  { value: "mouse", label: "Chuột (Mouse)" },
  { value: "monitor", label: "Màn hình (Monitor)" },
  { value: "mousepad", label: "Lót chuột (Mousepad)" },
  { value: "micro", label: "Micro" },
  { value: "iem", label: "Tai nghe nhét tai (IEM)" },
  { value: "headset", label: "Tai nghe chụp tai (Headset)" },
  { value: "dac", label: "Bộ giải mã (DAC)" },
  { value: "dap", label: "Máy nghe nhạc (DAP)" },
  { value: "phone", label: "Điện thoại (Phone)" },
  { value: "other", label: "Khác" },
];

function getCategoryLabel(cat: string | null) {
  if (!cat) return "—";
  const found = GEAR_CATEGORIES.find(c => c.value.toLowerCase() === cat.toLowerCase());
  return found ? found.label.split(" (")[0] : cat;
}

type Profile = {
  username: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
};
type Gear = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: "active" | "retired" | null;
  image_url: string | null;
};
type Game = {
  id: string;
  title: string;
  profile_url: string | null;
  status: "online" | "offline" | null;
  image_url: string | null;
  hoyolab_game: "genshin" | "hsr" | "hi3" | "zzz" | null;
  hoyolab_uid: string | null;
  hoyolab_server: string | null;
  steam_appid: string | null;
  steam_id: string | null;
  publisher: string | null;
};
type SocialLink = {
  id: string;
  platform: string;
  url: string;
  display_name: string | null;
  display_order: number | null;
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
  problem?: string | null;
  did?: string | null;
  result?: string | null;
  kind?: string | null;
  tone?: string | null;
  title_en?: string | null;
  kind_en?: string | null;
  problem_en?: string | null;
  did_en?: string | null;
  result_en?: string | null;
  description_en?: string | null;
};
type Tab = "profile" | "gears" | "games" | "social" | "projects";

function TableImage({ src, name }: { src: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return <div className={styles.tableImage}>{src && !failed
    ? <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
    : <ImageIcon aria-label="Chưa có ảnh" size={20} />}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label className={styles.label} htmlFor={id}>
        {label}
      </Label>
      {Children.map(children, child => isValidElement<{ id?: string }>(child) &&
        (child.type === SI || child.type === SS || child.type === "textarea")
        ? cloneElement(child, { id }) : child)}
    </div>
  );
}

function SI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className={styles.input}
    />
  );
}

function SS({
  id,
  value,
  onChange,
  children,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.select}
    >
      {children}
    </select>
  );
}

// Upload image to Supabase storage via API
async function uploadImage(file: File, bucket: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("Upload error:", err);
    return null;
  }
  const { url } = await res.json();
  return url;
}

// Extract username from social media URL
function extractUsernameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove leading/trailing slashes and get the first segment
    const segments = pathname.split("/").filter((s) => s.length > 0);

    // Common patterns:
    // twitter.com/username
    // twitch.tv/username
    // youtube.com/@username or youtube.com/c/username or youtube.com/user/username
    // instagram.com/username
    // facebook.com/username
    // github.com/username
    // etc.

    if (segments.length === 0) return null;

    // Handle YouTube special cases
    if (urlObj.hostname.includes("youtube.com")) {
      if (segments[0] === "@" || segments[0].startsWith("@")) {
        return segments[0];
      }
      if (
        segments[0] === "c" ||
        segments[0] === "user" ||
        segments[0] === "channel"
      ) {
        return segments[1] || null;
      }
    }

    // For most platforms, username is the first path segment
    let username = segments[0];

    // Remove @ prefix if exists
    if (username.startsWith("@")) {
      username = username.substring(1);
    }

    return username;
  } catch {
    return null;
  }
}

type SteamSearchResult = {
  appid: number;
  name: string;
};

function extractSteamId(input: string): string {
  const match = input.match(/\/profiles\/(\d{17})/);
  if (match) return match[1];
  if (/^\d+$/.test(input.trim())) return input.trim();
  return input;
}

function ImageUpload({
  label,
  value,
  bucket,
  onChange,
}: {
  label: string;
  value: string;
  bucket: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, bucket);
    if (url) onChange(url);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[var(--secondary)] text-sm">
        {label}
      </Label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative cursor-pointer group border-2 border-dashed border-[var(--line)] rounded-xl overflow-hidden hover:border-[var(--highlight)] transition-colors"
        style={{ minHeight: bucket === "covers" ? 140 : 100 }}
      >
        {value ? (
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            style={{ minHeight: bucket === "covers" ? 140 : 100 }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-[var(--secondary)]">
            <Upload className="w-6 h-6" />
            <span className="text-xs">Nhấn để chọn ảnh</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-colors flex items-center justify-center gap-2 text-white text-sm font-medium">
          <Upload className="w-4 h-4" />
          {uploading ? "Đang upload..." : "Đổi ảnh"}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[var(--highlight)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// Small inline upload for gear/game image in dialog
function InlineImageUpload({
  value,
  bucket,
  onChange,
}: {
  value: string;
  bucket: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, bucket);
    if (url) onChange(url);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-16 h-16 rounded-lg border border-[var(--line)] bg-[var(--field)] flex items-center justify-center cursor-pointer hover:border-[var(--highlight)] overflow-hidden shrink-0 transition-colors"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-[var(--highlight)] border-t-transparent rounded-full animate-spin" />
        ) : value ? (
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <ImageIcon className="w-5 h-5 text-[var(--secondary)]" />
        )}
      </div>
      <div className="flex-1">
        <SI
          placeholder="hoặc dán URL ảnh..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <p className="text-xs text-[var(--secondary)] mt-1">
          Nhấn ô ảnh để tải lên từ máy
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("profile");

  const [profile, setProfile] = useState<Profile>({
    username: "",
    bio: "",
    avatar_url: "",
    cover_url: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const [gears, setGears] = useState<Gear[]>([]);
  const [gearsLoading, setGearsLoading] = useState(true);
  const [gearOpen, setGearOpen] = useState(false);
  const [gearEditId, setGearEditId] = useState<string | null>(null);
  const [gearForm, setGearForm] = useState({
    name: "",
    brand: "",
    category: "",
    status: "active" as "active" | "retired",
    image_url: "",
  });
  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gameOpen, setGameOpen] = useState(false);
  const [gameEditId, setGameEditId] = useState<string | null>(null);
  const [gameForm, setGameForm] = useState({
    title: "",
    profile_url: "",
    status: "online" as Game["status"],
    image_url: "",
    hoyolab_game: "" as Game["hoyolab_game"] | "",
    hoyolab_uid: "",
    hoyolab_server: "",
    steam_appid: "",
    steam_id: "",
    publisher: "",
    platform: "none" as "none" | "steam" | "hoyolab",
    steamSearchQuery: "",
    steamSearchResults: [] as SteamSearchResult[],
    steamSearchLoading: false,
    steamSearchError: null as string | null,
  });
  const steamDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchSteam = useCallback((term: string) => {
    if (steamDebounceRef.current) clearTimeout(steamDebounceRef.current);
    if (term.length < 2) {
      setGameForm((f) => ({
        ...f,
        steamSearchResults: [],
        steamSearchError: null,
      }));
      return;
    }
    steamDebounceRef.current = setTimeout(async () => {
      setGameForm((f) => ({
        ...f,
        steamSearchLoading: true,
        steamSearchError: null,
      }));
      try {
        const res = await fetch(
          `/api/games/search?term=${encodeURIComponent(term)}`,
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Search failed");
        setGameForm((f) => ({
          ...f,
          steamSearchResults: json.results || [],
          steamSearchLoading: false,
        }));
      } catch {
        setGameForm((f) => ({
          ...f,
          steamSearchResults: [],
          steamSearchLoading: false,
          steamSearchError: "Lỗi tìm kiếm Steam, thử lại sau",
        }));
      }
    }, 300);
  }, []);

  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [socialsLoading, setSocialsLoading] = useState(true);
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialEditId, setSocialEditId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform: "",
    url: "",
    display_name: "",
    display_order: "",
  });

  const [sorts, setSorts] = useState<Record<string, { field: string | null; direction: "asc" | "desc" }>>({
    gears: { field: null, direction: "asc" }, games: { field: null, direction: "asc" },
    projects: { field: null, direction: "asc" }, social: { field: null, direction: "asc" },
  });
  const [projectError, setProjectError] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [cvState, setCvState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [cvUploading, setCvUploading] = useState(false);
  const [cvMessage, setCvMessage] = useState("");
  const [cvError, setCvError] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectEditId, setProjectEditId] = useState<string | null>(null);
  const [projectLangTab, setProjectLangTab] = useState<"vi" | "en">("vi");
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    github_url: "",
    demo_url: "",
    image_url: "",
    status: "active" as "active" | "completed",
    tags: "",
    isFeatured: false,
    kind: "",
    problem: "",
    did: "",
    result: "",
    tone: "",
    title_en: "",
    kind_en: "",
    problem_en: "",
    did_en: "",
    result_en: "",
    description_en: "",
  });

  const fetchProfile = async () => {
    const d = await fetch("/api/profile").then((r) => r.json());
    if (d)
      setProfile({
        username: d.username || "",
        bio: d.bio || "",
        avatar_url: d.avatar_url || "",
        cover_url: d.cover_url || "",
      });
  };
  const fetchGears = async () => {
    setGearsLoading(true);
    setGears(await fetch("/api/gears").then((r) => r.json()));
    setGearsLoading(false);
  };
  const fetchGames = async () => {
    setGamesLoading(true);
    setGames(await fetch("/api/games").then((r) => r.json()));
    setGamesLoading(false);
  };
  const fetchSocials = async () => {
    setSocialsLoading(true);
    setSocials(await fetch("/api/social-links").then((r) => r.json()));
    setSocialsLoading(false);
  };
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      setProjectError("");
      const response = await fetch("/api/projects", { cache: "no-store" });
      const d = await response.json();
      if (!response.ok || !Array.isArray(d)) throw new Error(d.error || "Không thể tải danh sách dự án.");
      setProjects(d);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "Không thể tải danh sách dự án.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSync = async (scope: "all" | "projects" | "gears" | "social" | "profile" = "all") => {
    const scopeNames: Record<string, string> = {
      all: "tất cả danh mục",
      projects: "dự án",
      gears: "thiết bị",
      social: "liên kết",
      profile: "hồ sơ",
    };
    if (!confirm(`Bạn có chắc muốn đồng bộ dữ liệu ${scopeNames[scope] || scope} từ trang giới thiệu không?`)) return;
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/admin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đồng bộ thất bại");

      if (scope === "all" || scope === "projects") await fetchProjects();
      if (scope === "all" || scope === "gears") await fetchGears();
      if (scope === "all" || scope === "social") await fetchSocials();
      if (scope === "all" || scope === "profile") await fetchProfile();

      setSyncStatus(`Đã đồng bộ ${scopeNames[scope] || scope} từ trang giới thiệu thành công.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      setSyncStatus(err instanceof Error ? err.message : "Đồng bộ thất bại.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchGears();
    fetchGames();
    fetchSocials();
    fetchProjects();
  }, []);

  const fetchCv = async () => {
    try {
      const response = await fetch("/api/cv", { method: "HEAD", cache: "no-store" });
      setCvState(response.ok ? "ready" : response.status === 404 ? "missing" : "error");
    } catch { setCvState("error"); }
  };

  useEffect(() => { if (authenticated) void fetchCv(); }, [authenticated]);

  const uploadCv = async (file: File) => {
    setCvUploading(true);
    setCvError("");
    setCvMessage("");
    try {
      const validation = await validateCv(file);
      if (validation) throw new Error(validation);
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/cv", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Chưa thể tải CV lên.");
      setCvState("ready");
      setCvMessage("Đã cập nhật CV. Khách có thể tải xuống từ đầu trang.");
    } catch (error) {
      setCvError(error instanceof Error ? error.message : "Chưa thể tải CV lên.");
    } finally { setCvUploading(false); }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: profile.username || null,
        bio: profile.bio || null,
        avatar_url: profile.avatar_url || null,
        cover_url: profile.cover_url || null,
      }),
    });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleGearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      ...gearForm,
      image_url: gearForm.image_url || null,
    });
    gearEditId
      ? await fetch(`/api/gears/${gearEditId}`, { method: "PATCH", body })
      : await fetch("/api/gears", { method: "POST", body });
    setGearOpen(false);
    setGearEditId(null);
    setGearForm({
      name: "",
      brand: "",
      category: "",
      status: "active",
      image_url: "",
    });
    fetchGears();
  };
  const openAddGear = () => {
    setGearEditId(null);
    setGearForm({
      name: "",
      brand: "",
      category: "",
      status: "active",
      image_url: "",
    });
    setGearOpen(true);
  };
  const editGear = (g: Gear) => {
    setGearEditId(g.id);
    setGearForm({
      name: g.name,
      brand: g.brand || "",
      category: g.category || "",
      status: g.status || "active",
      image_url: g.image_url || "",
    });
    setGearOpen(true);
  };
  const deleteGear = async (id: string) => {
    if (!confirm("Delete this gear?")) return;
    await fetch(`/api/gears/${id}`, { method: "DELETE" });
    fetchGears();
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Khi Steam: title phải được điền từ search
    if (gameForm.platform === "steam" && !gameForm.title) {
      alert("Vui lòng tìm và chọn game từ Steam trước");
      return;
    }
    const body = JSON.stringify({
      title: gameForm.title,
      profile_url: gameForm.profile_url || null,
      status: gameForm.status,
      image_url: gameForm.image_url || null,
      hoyolab_game: gameForm.hoyolab_game || null,
      hoyolab_uid: gameForm.hoyolab_uid || null,
      hoyolab_server: gameForm.hoyolab_server || null,
      steam_appid: gameForm.steam_appid || null,
      steam_id: gameForm.steam_id || null,
      publisher: gameForm.publisher || null,
    });
    gameEditId
      ? await fetch(`/api/games/${gameEditId}`, { method: "PATCH", body })
      : await fetch("/api/games", { method: "POST", body });
    setGameOpen(false);
    setGameEditId(null);
    setGameForm({
      title: "",
      profile_url: "",
      status: "online",
      image_url: "",
      hoyolab_game: "",
      hoyolab_uid: "",
      hoyolab_server: "",
      steam_appid: "",
      steam_id: "",
      publisher: "",
      platform: "none",
      steamSearchQuery: "",
      steamSearchResults: [],
      steamSearchLoading: false,
      steamSearchError: null,
    });
    fetchGames();
  };
  const openAddGame = () => {
    setGameEditId(null);
    setGameForm({
      title: "",
      profile_url: "",
      status: "online",
      image_url: "",
      hoyolab_game: "",
      hoyolab_uid: "",
      hoyolab_server: "",
      steam_appid: "",
      steam_id: "",
      publisher: "",
      platform: "none",
      steamSearchQuery: "",
      steamSearchResults: [],
      steamSearchLoading: false,
      steamSearchError: null,
    });
    setGameOpen(true);
  };
  const editGame = (g: Game) => {
    setGameEditId(g.id);
    const platform: "none" | "steam" | "hoyolab" = g.steam_appid
      ? "steam"
      : g.hoyolab_game
        ? "hoyolab"
        : "none";
    setGameForm({
      title: g.title,
      profile_url: g.profile_url || "",
      status: g.status || "online",
      image_url: g.image_url || "",
      hoyolab_game: g.hoyolab_game || "",
      hoyolab_uid: g.hoyolab_uid || "",
      hoyolab_server: g.hoyolab_server || "",
      steam_appid: g.steam_appid || "",
      steam_id: g.steam_id || "",
      publisher: g.publisher || "",
      platform,
      steamSearchQuery: "",
      steamSearchResults: [],
      steamSearchLoading: false,
      steamSearchError: null,
    });
    setGameOpen(true);
  };
  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game?")) return;
    await fetch(`/api/games/${id}`, { method: "DELETE" });
    fetchGames();
  };

  const sortHeading = (table: string, field: string, label: string) => {
    const sort = sorts[table];
    const active = sort.field === field;
    return <TableHead aria-sort={active ? sort.direction === "asc" ? "ascending" : "descending" : "none"}>
      <button type="button" className={styles.sortButton} onClick={() => setSorts(previous => ({
        ...previous, [table]: { field, direction: active && sort.direction === "asc" ? "desc" : "asc" },
      }))}>
        {label}{!active ? <ArrowUpDown aria-hidden="true" size={14} /> : sort.direction === "asc" ? <ArrowUp aria-hidden="true" size={14} /> : <ArrowDown aria-hidden="true" size={14} />}
      </button>
    </TableHead>;
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = JSON.stringify({
      ...socialForm,
      display_name: socialForm.display_name || null,
      display_order: socialForm.display_order
        ? Number(socialForm.display_order)
        : null,
    });
    socialEditId
      ? await fetch(`/api/social-links/${socialEditId}`, {
          method: "PATCH",
          body,
        })
      : await fetch("/api/social-links", { method: "POST", body });
    setSocialOpen(false);
    setSocialEditId(null);
    setSocialForm({
      platform: "",
      url: "",
      display_name: "",
      display_order: "",
    });
    fetchSocials();
  };
  const openAddSocial = () => {
    setSocialEditId(null);
    setSocialForm({
      platform: "",
      url: "",
      display_name: "",
      display_order: "",
    });
    setSocialOpen(true);
  };
  const editSocial = (s: SocialLink) => {
    setSocialEditId(s.id);
    setSocialForm({
      platform: s.platform,
      url: s.url,
      display_name: s.display_name || "",
      display_order: s.display_order?.toString() || "",
    });
    setSocialOpen(true);
  };
  const deleteSocial = async (id: string) => {
    if (!confirm("Delete this link?")) return;
    await fetch(`/api/social-links/${id}`, { method: "DELETE" });
    fetchSocials();
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let tagList = projectForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (projectForm.isFeatured) {
      if (!tagList.includes("featured")) tagList.push("featured");
    } else {
      tagList = tagList.filter((t) => t !== "featured");
    }

    const body = JSON.stringify({
      title: projectForm.title,
      description: projectForm.description || null,
      github_url: projectForm.github_url || null,
      demo_url: projectForm.demo_url || null,
      image_url: projectForm.image_url || null,
      status: projectForm.status,
      tags: tagList,
      kind: projectForm.kind || null,
      problem: projectForm.problem || null,
      did: projectForm.did || null,
      result: projectForm.result || null,
      tone: projectForm.tone || null,
      title_en: projectForm.title_en || null,
      kind_en: projectForm.kind_en || null,
      problem_en: projectForm.problem_en || null,
      did_en: projectForm.did_en || null,
      result_en: projectForm.result_en || null,
      description_en: projectForm.description_en || null,
    });

    setProjectSaving(true);
    setProjectError("");
    try {
      let response: Response;
      if (projectEditId) {
        response = await fetch(`/api/projects/${projectEditId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body,
        });
      } else {
        response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
      }

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Không thể lưu dự án.");
      }
      setProjectOpen(false);
      setProjectEditId(null);
      setProjectForm({
        title: "",
        description: "",
        github_url: "",
        demo_url: "",
        image_url: "",
        status: "active",
        tags: "",
        isFeatured: false,
        kind: "",
        problem: "",
        did: "",
        result: "",
        tone: "",
        title_en: "",
        kind_en: "",
        problem_en: "",
        did_en: "",
        result_en: "",
        description_en: "",
      });
      await fetchProjects();
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "Không thể lưu dự án.");
    } finally { setProjectSaving(false); }
  };

  const openAddProject = () => {
    setProjectEditId(null);
    setProjectLangTab("vi");
    setProjectForm({
      title: "",
      description: "",
      github_url: "",
      demo_url: "",
      image_url: "",
      status: "active",
      tags: "",
      isFeatured: false,
      kind: "",
      problem: "",
      did: "",
      result: "",
      tone: "",
      title_en: "",
      kind_en: "",
      problem_en: "",
      did_en: "",
      result_en: "",
      description_en: "",
    });
    setProjectOpen(true);
  };

  const editProject = (p: Project) => {
    setProjectEditId(p.id);
    setProjectLangTab("vi");
    const tagArr = Array.isArray(p.tags) ? p.tags : [];
    const isFeatured = tagArr.includes("featured");
    const displayTags = tagArr.filter((t) => t !== "featured").join(", ");

    setProjectForm({
      title: p.title || "",
      description: p.description || "",
      github_url: p.github_url || "",
      demo_url: p.demo_url || "",
      image_url: p.image_url || "",
      status: p.status || "active",
      tags: displayTags,
      isFeatured,
      kind: p.kind || "",
      problem: p.problem || "",
      did: p.did || "",
      result: p.result || "",
      tone: p.tone || "",
      title_en: p.title_en || "",
      kind_en: p.kind_en || "",
      problem_en: p.problem_en || "",
      did_en: p.did_en || "",
      result_en: p.result_en || "",
      description_en: p.description_en || "",
    });
    setProjectOpen(true);
  };

  const toggleFeaturedProject = async (p: Project) => {
    const tagArr = Array.isArray(p.tags) ? [...p.tags] : [];
    const isCurrentlyFeatured = tagArr.includes("featured");
    let nextTags: string[];
    if (isCurrentlyFeatured) {
      nextTags = tagArr.filter((t) => t !== "featured");
    } else {
      nextTags = [...tagArr, "featured"];
    }
    try {
      const response = await fetch(`/api/projects/${p.id}`  , {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: nextTags }),
      });
      if (!response.ok) throw new Error((await response.json()).error || "Không thể cập nhật dự án.");
      await fetchProjects();
    } catch (error) { setProjectError(error instanceof Error ? error.message : "Không thể cập nhật dự án."); }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa dự án này?")) return;
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error((await response.json()).error || "Không thể xóa dự án.");
      await fetchProjects();
    } catch (error) { setProjectError(error instanceof Error ? error.message : "Không thể xóa dự án."); }
  };

  const navTabs = [
    {
      key: "profile" as Tab,
      label: "Hồ sơ",
      icon: <Camera className="w-4 h-4" />,
    },
    {
      key: "projects" as Tab,
      label: "Dự án",
      icon: <FileCode className="w-4 h-4" />,
    },
    {
      key: "gears" as Tab,
      label: "Thiết bị",
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      key: "games" as Tab,
      label: "Trò chơi",
      icon: <Gamepad2 className="w-4 h-4" />,
    },
    {
      key: "social" as Tab,
      label: "Liên kết",
      icon: <LinkIcon className="w-4 h-4" />,
    },
  ];

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        setAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Server-side password check
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        setPassword("");
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(true);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`${styles.admin} ${styles.loading}`} role="status">
        Đang tải trang quản trị…
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authenticated) {
    return (
      <div className={styles.admin}>
        <div className={styles.frame}>
          <header className={styles.topbar}>
            <a href="/" className={styles.brand}>silentboiz<span>.</span></a>
            <div className={styles.topActions}><a href="/" className={styles.backLink}>Về trang giới thiệu ↗</a><ThemeToggle /></div>
          </header>
          <main className={styles.login}>
          <div className={styles.loginCard}>
            <div>
              <h1>Đăng nhập quản trị.</h1>
              <p>Chăm chút hồ sơ, cập nhật dự án và lưu lại những trải nghiệm mới.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className={styles.label} htmlFor="admin-password">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="admin-password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị"
                  className={styles.input}
                  aria-invalid={error}
                  aria-describedby={error ? "login-error" : undefined}
                  autoFocus
                  disabled={loggingIn}
                />
                {error && (
                  <p id="login-error" role="alert" className="text-sm mt-2">
                    Chưa đăng nhập được. Kiểm tra mật khẩu rồi thử lại nhé.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loggingIn}
                className={styles.primary}
              >
                {loggingIn ? "Đang đăng nhập…" : "Đăng nhập"}
              </Button>
            </form>

          </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.admin}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <a href="/" className={styles.brand}>silentboiz<span>.</span></a>
          <div className={styles.topActions}>
          <a href="/" className={styles.backLink}>Xem trang giới thiệu ↗</a>
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={styles.secondary}
          >
            Đăng xuất
          </Button>
          </div>
        </header>
        <main>
        <div className={styles.heading}>
          <h1>Quản lý nội dung.</h1>
          <p>Hồ sơ, những dự án đang làm và góc trải nghiệm của Minh.</p>
        </div>

        {/* Tabs */}
        <nav className={styles.tabs} aria-label="Các mục quản lý">
          {navTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {syncStatus && (
          <div className="bg-[var(--panel)] border border-[var(--highlight)] text-[var(--ink)] px-4 py-2.5 rounded-lg text-sm flex items-center justify-between mb-4">
            <span>{syncStatus}</span>
            <button type="button" onClick={() => setSyncStatus(null)} className="text-xs text-[var(--secondary)] hover:text-[var(--ink)]">✕</button>
          </div>
        )}

        {projectError && !projectOpen && <div className={styles.errorNotice} role="alert">
          {projectError} <button type="button" onClick={() => void fetchProjects()}>Tải lại dự án</button>
        </div>}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <div className={`${styles.profileForm} space-y-6`}>
            {/* Cover with crop */}
            <div className="space-y-2">
              <Label className="text-[var(--secondary)] text-sm">
                Ảnh bìa
              </Label>
              <div
                className="relative cursor-pointer group border-2 border-dashed border-[var(--line)] rounded-xl overflow-hidden hover:border-[var(--highlight)] transition-colors"
                style={{ height: 160 }}
                onClick={() => document.getElementById("cover-input")?.click()}
              >
                {profile.cover_url ? (
                  <img
                    src={profile.cover_url}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-[var(--secondary)]">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Nhấn để chọn ảnh bìa</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-colors flex items-center justify-center gap-2 text-white text-sm font-medium">
                  <Upload className="w-4 h-4" /> Đổi ảnh bìa
                </div>
              </div>
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  // GIF: skip crop, upload directly
                  if (file.type === "image/gif") {
                    uploadImage(file, "covers").then((url) => {
                      if (url) setProfile((p) => ({ ...p, cover_url: url }));
                    });
                  } else {
                    const url = URL.createObjectURL(file);
                    setCropSrc(url);
                  }
                  e.target.value = "";
                }}
              />
              <p className="text-xs text-[var(--secondary)]">
                Có thể cắt vùng hiển thị sau khi chọn ảnh. Ảnh GIF được tải lên nguyên bản.
              </p>
            </div>

            {/* Cropper modal */}
            {cropSrc && (
              <ImageCropper
                imageSrc={cropSrc}
                aspect={3 / 1}
                onCancel={() => {
                  setCropSrc(null);
                  URL.revokeObjectURL(cropSrc);
                }}
                onDone={async (blob) => {
                  setCropSrc(null);
                  const file = new File([blob], `cover-${Date.now()}.jpg`, {
                    type: "image/jpeg",
                  });
                  const url = await uploadImage(file, "covers");
                  if (url) setProfile((p) => ({ ...p, cover_url: url }));
                }}
              />
            )}

            <div className="flex items-end gap-6">
              <div className="shrink-0">
                <Label className="text-[var(--secondary)] text-sm block mb-2">
                  Ảnh đại diện
                </Label>
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--panel)] flex items-center justify-center text-2xl font-bold border-2 border-[var(--line)]">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (profile.username?.[0] || "S").toUpperCase()
                    )}
                  </div>
                  <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-colors">
                    <Upload className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*,.gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const url = await uploadImage(file, "avatars");
                        if (url) setProfile({ ...profile, avatar_url: url });
                      }}
                    />
                  </label>
                </div>
              </div>
              <p className="text-xs text-[var(--secondary)] pb-2">
                Hỗ trợ JPG, PNG, GIF động
              </p>
            </div>

            <Field label="Tên hiển thị">
              <SI
                placeholder="silentboiz"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
              />
            </Field>

            <Field label="Giới thiệu">
              <textarea
                rows={3}
                placeholder="Giới thiệu bản thân..."
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                className={styles.textarea}
              />
            </Field>

            <section className={styles.cvSection} aria-labelledby="cv-heading">
              <h2 id="cv-heading">CV cá nhân</h2>
              <p>Chọn tệp PDF, tối đa 4 MB. Tệp mới sẽ thay thế CV hiện tại khi tải lên thành công.</p>
              {cvState === "loading" && <p role="status">Đang kiểm tra CV…</p>}
              {cvState === "missing" && <p>Chưa có CV. Tải lên để hiện nút tải xuống ở đầu trang.</p>}
              {cvState === "error" && <p role="alert">Chưa thể kiểm tra CV. <button type="button" onClick={() => void fetchCv()}>Thử lại</button></p>}
              {cvState === "ready" && <a className={styles.cvLink} href="/api/cv" download>Tải CV hiện tại</a>}
              <label className={styles.label} htmlFor="cv-upload">{cvUploading ? "Đang tải CV lên…" : "Tải lên hoặc thay CV"}</label>
              <input id="cv-upload" type="file" accept=".pdf,application/pdf" disabled={cvUploading || cvState === "loading"} className={styles.input} onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void uploadCv(file);
              }} />
              {cvError && <p className={styles.errorNotice} role="alert">{cvError}</p>}
              <p role="status">{cvMessage}</p>
            </section>

            <div className="flex items-center gap-3">
              <Button
                onClick={saveProfile}
                disabled={profileSaving}
                className={`${styles.primary} px-6`}
              >
                <Save className="w-4 h-4 mr-2" />
                {profileSaving
                  ? "Đang lưu..."
                  : profileSaved
                    ? "Đã lưu"
                    : "Lưu hồ sơ"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSync("profile")}
                disabled={syncing}
                className={styles.secondary}
                title="Đồng bộ tên và tiểu sử từ trang giới thiệu"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                Đồng bộ từ trang giới thiệu
              </Button>
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === "projects" && (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Dự án cá nhân{" "}
                <span className="text-[var(--secondary)] text-sm font-normal">
                  ({projects.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSync("projects")}
                  disabled={syncing}
                  className={styles.secondary}
                  title="Đồng bộ dự án chuẩn (DroneFood, Portfolio) từ trang giới thiệu"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  Đồng bộ từ trang giới thiệu
                </Button>
                <Button
                  onClick={openAddProject}
                  className={styles.primary}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm dự án
                </Button>
              </div>
            </div>

            <div className={styles.tablePanel}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--line)] hover:bg-transparent">
                    <TableHead className="text-[var(--secondary)] font-medium w-16">
                      Ảnh
                    </TableHead>
                    {sortHeading("projects", "title", "Tên dự án & Mô tả")}
                    {sortHeading("projects", "tags", "Công nghệ (Tags)")}
                    {sortHeading("projects", "status", "Trạng thái")}
                    {sortHeading("projects", "featured", "Nổi bật ⭐")}
                    <TableHead className="text-[var(--secondary)] font-medium text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-[var(--secondary)] py-10"
                      >
                        Đang tải danh sách dự án...
                      </TableCell>
                    </TableRow>
                  ) : projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-[var(--secondary)]">
                          <FileCode className="w-8 h-8" />
                          <p className="text-sm">
                            {projectError ? "Chưa thể tải danh sách dự án. Thử tải lại ở trên." : 'Chưa có dự án nào trong cơ sở dữ liệu.'}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => handleSync("projects")}
                            disabled={syncing}
                            className={styles.secondary}
                          >
                            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                            Đồng bộ 2 dự án từ trang giới thiệu
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortRows(projects.map(p => ({ ...p, featured: p.tags?.includes("featured") ?? false })), sorts.projects.field as keyof Project | "featured" | null, sorts.projects.direction).map((p) => {
                      const tagsList = Array.isArray(p.tags) ? p.tags : [];
                      const isFeatured = tagsList.includes("featured");
                      const displayTags = tagsList.filter(
                        (t) => t !== "featured"
                      );

                      return (
                        <TableRow
                          key={p.id}
                          className="border-[var(--line)] hover:bg-[var(--panel)]"
                        >
                          <TableCell>
                            <TableImage src={p.image_url} name={p.title} />
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-[var(--ink)] text-sm">
                                {p.title}
                              </p>
                              {p.tone && (
                                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${p.tone === 'lime' ? 'text-lime-500 border-lime-500/40' : 'text-purple-400 border-purple-400/40'}`}>
                                  {p.tone}
                                </Badge>
                              )}
                              {(p.problem || p.did || p.result) && (
                                <span className="text-[10px] bg-[var(--panel)] text-[var(--secondary)] border border-[var(--line)] px-1 py-0.2 rounded font-mono">
                                  Case Study
                                </span>
                              )}
                            </div>
                            {p.kind && (
                              <p className="text-xs text-[var(--highlight)] font-medium mt-0.5">
                                {p.kind}
                              </p>
                            )}
                            {p.description && (
                              <p className="text-xs text-[var(--secondary)] line-clamp-1 mt-0.5">
                                {p.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              {p.github_url && (
                                <a
                                  href={p.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--highlight)] hover:underline"
                                >
                                  GitHub ↗
                                </a>
                              )}
                              {p.demo_url && (
                                <a
                                  href={p.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[var(--highlight)] hover:underline"
                                >
                                  Demo ↗
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {displayTags.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="bg-[var(--panel)] text-[var(--ink)] text-xs px-1.5 py-0.5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={styles.status} data-status={p.status || "unknown"}>
                              {p.status === "completed" ? "Hoàn thành" : p.status === "active" ? "Đang phát triển" : "Chưa cập nhật"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() => toggleFeaturedProject(p)}
                              title={
                                isFeatured
                                  ? "Bỏ đánh dấu nổi bật"
                                  : "Đặt làm dự án nổi bật trang chủ"
                              }
                              className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                                isFeatured
                                  ? "bg-[var(--panel)] border-[var(--line)] text-[var(--highlight)]"
                                  : "border-[var(--line)] text-[var(--secondary)] hover:text-[var(--ink)] hover:border-[var(--line)]"
                              }`}
                            >
                              {isFeatured ? "Nổi bật" : "Thường"}
                            </button>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => editProject(p)}
                              aria-label="Chỉnh sửa"
                              className="h-8 w-8 hover:text-[var(--highlight)] hover:bg-[var(--panel)]"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteProject(p.id)}
                              aria-label="Xóa"
                              className="h-8 w-8 hover:text-[var(--danger)] hover:bg-[var(--panel)]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Modal Thêm/Sửa Dự án */}
            <Dialog open={projectOpen} onOpenChange={setProjectOpen} className={styles.dialogShell}>
              <DialogContent className={styles.dialog} data-admin-dialog>
                <DialogHeader>
                  <DialogTitle className="text-[var(--ink)]">
                    {projectEditId ? "Sửa thông tin dự án" : "Thêm dự án mới"}
                  </DialogTitle>
                </DialogHeader>

                <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setProjectLangTab("vi")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      projectLangTab === "vi"
                        ? "bg-[var(--accent)] text-[var(--bg)] shadow-xs"
                        : "text-[var(--secondary)] hover:text-[var(--ink)] bg-[var(--panel)]"
                    }`}
                  >
                    🇻🇳 Tiếng Việt (VI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectLangTab("en")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      projectLangTab === "en"
                        ? "bg-[var(--accent)] text-[var(--bg)] shadow-xs"
                        : "text-[var(--secondary)] hover:text-[var(--ink)] bg-[var(--panel)]"
                    }`}
                  >
                    🇬🇧 English (EN)
                  </button>
                </div>

                <form onSubmit={handleProjectSubmit} className="space-y-4 pt-1">
                  {projectLangTab === "vi" ? (
                    <>
                      <Field label="Tên dự án (VI) *">
                        <SI
                          placeholder="vd: DroneFood - Hệ thống điều vận Drone"
                          value={projectForm.title}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              title: e.target.value,
                            })
                          }
                          required
                        />
                      </Field>
                      <Field label="Loại dự án (Kind VI)">
                        <SI
                          placeholder="vd: Nền tảng điều vận & giao hàng Drone"
                          value={projectForm.kind}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              kind: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Mô tả tóm tắt & Hướng dẫn test (VI)">
                        <textarea
                          rows={2}
                          placeholder="Mô tả chức năng hoặc tài khoản để test dự án..."
                          value={projectForm.description}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              description: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 01 Vấn đề (Problem VI)">
                        <textarea
                          rows={2}
                          placeholder="Vấn đề cần giải quyết..."
                          value={projectForm.problem}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              problem: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 02 Việc đã làm (What I did VI)">
                        <textarea
                          rows={2}
                          placeholder="Các giải pháp và tính năng đã triển khai..."
                          value={projectForm.did}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              did: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 03 Kết quả (Result VI)">
                        <textarea
                          rows={2}
                          placeholder="Kết quả thực tế đạt được..."
                          value={projectForm.result}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              result: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Tên dự án (English Title)">
                        <SI
                          placeholder="e.g. DroneFood - Drone Dispatching Platform"
                          value={projectForm.title_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              title_en: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Loại dự án (English Kind)">
                        <SI
                          placeholder="e.g. Full-stack Drone Delivery Platform"
                          value={projectForm.kind_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              kind_en: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Mô tả & Hướng dẫn test (English Description & Test)">
                        <textarea
                          rows={2}
                          placeholder="Brief description or test instructions..."
                          value={projectForm.description_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              description_en: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 01 Problem (English)">
                        <textarea
                          rows={2}
                          placeholder="The core problem addressed..."
                          value={projectForm.problem_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              problem_en: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 02 What I did (English)">
                        <textarea
                          rows={2}
                          placeholder="Architecture, solutions and implementation details..."
                          value={projectForm.did_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              did_en: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                      <Field label="Case Study — 03 Result (English)">
                        <textarea
                          rows={2}
                          placeholder="Outcomes, metrics, and achievements..."
                          value={projectForm.result_en}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              result_en: e.target.value,
                            })
                          }
                          className={styles.textarea}
                        />
                      </Field>
                    </>
                  )}

                  <div className={styles.fieldGrid}>
                    <Field label="Đường dẫn GitHub">
                      <SI
                        placeholder="https://github.com/..."
                        value={projectForm.github_url}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            github_url: e.target.value,
                          })
                        }
                      />
                    </Field>
                    <Field label="Đường dẫn trải nghiệm">
                      <SI
                        placeholder="https://..."
                        value={projectForm.demo_url}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            demo_url: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Công nghệ sử dụng">
                    <SI
                      placeholder="vd: Go, Redis, Docker, PostgreSQL (ngăn cách bởi dấu phẩy)"
                      value={projectForm.tags}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, tags: e.target.value })
                      }
                    />
                    <p className="text-xs text-[var(--secondary)] mt-1">
                      Ngăn cách tên các công nghệ bằng dấu phẩy.
                    </p>
                  </Field>
                  <div className={styles.fieldGrid}>
                    <Field label="Tông màu (Tone)">
                      <SS
                        value={projectForm.tone || "lime"}
                        onChange={(v) =>
                          setProjectForm({
                            ...projectForm,
                            tone: v,
                          })
                        }
                      >
                        <option value="lime">Lime (Xanh chuối)</option>
                        <option value="violet">Violet (Tím nhạt)</option>
                      </SS>
                    </Field>
                    <Field label="Trạng thái">
                      <SS
                        value={projectForm.status}
                        onChange={(v) =>
                          setProjectForm({
                            ...projectForm,
                            status: v as "active" | "completed",
                          })
                        }
                      >
                        <option value="active">Đang phát triển (Active)</option>
                        <option value="completed">
                          Đã hoàn thành (Completed)
                        </option>
                      </SS>
                    </Field>
                  </div>
                  <Field label="Dự án nổi bật">
                    <div className="flex items-center h-9 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--ink)]">
                        <input
                          type="checkbox"
                          checked={projectForm.isFeatured}
                          onChange={(e) =>
                            setProjectForm({
                              ...projectForm,
                              isFeatured: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-[var(--line)] bg-[var(--field)] accent-[var(--highlight)] focus:ring-0"
                        />
                        <span>Đặt làm nổi bật</span>
                      </label>
                    </div>
                  </Field>
                  <Field label="Ảnh dự án">
                    <InlineImageUpload
                      value={projectForm.image_url}
                      bucket="covers"
                      onChange={(url) =>
                        setProjectForm({ ...projectForm, image_url: url })
                      }
                    />
                  </Field>
                  {projectError && <p className={styles.errorNotice} role="alert">{projectError}</p>}
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setProjectOpen(false)}
                      className="text-[var(--secondary)]"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit" disabled={projectSaving}
                      className={styles.primary}
                    >
                      {projectSaving ? "Đang lưu…" : projectEditId ? "Cập nhật" : "Tạo dự án"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* ── GEARS ── */}
        {tab === "gears" && (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Thiết bị{" "}
                <span className="text-[var(--secondary)] text-sm font-normal">
                  ({gears.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSync("gears")}
                  disabled={syncing}
                  className="border-[var(--line)] text-[var(--secondary)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  Đồng bộ từ trang giới thiệu
                </Button>
                <Button
                  onClick={openAddGear}
                  className={styles.primary}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm thiết bị
                </Button>
              </div>
            </div>

            <div className={styles.tablePanel}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--line)] hover:bg-transparent">
                    <TableHead>Ảnh</TableHead>
                    {sortHeading("gears", "name", "Tên")}
                    {sortHeading("gears", "brand", "Thương hiệu")}
                    {sortHeading("gears", "category", "Loại")}
                    {sortHeading("gears", "status", "Trạng thái")}
                    <TableHead className="text-[var(--secondary)] font-medium text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gearsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-[var(--secondary)] py-10"
                      >
                        Đang tải…
                      </TableCell>
                    </TableRow>
                  ) : gears.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-[var(--secondary)]">
                          <Monitor className="w-8 h-8" />
                          <p className="text-sm">
                            Chưa có thiết bị nào. Nhấn "Thêm thiết bị" để thêm hoặc đồng bộ danh sách mặc định.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync("gears")}
                            disabled={syncing}
                            className="mt-1 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
                          >
                            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                            Đồng bộ thiết bị mặc định
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortRows(gears, sorts.gears.field as keyof Gear | null, sorts.gears.direction).map((g) => (
                      <TableRow
                        key={g.id}
                        className="border-[var(--line)] hover:bg-[var(--panel)]"
                      >
                        <TableCell><TableImage src={g.image_url} name={g.name} /></TableCell>
                        <TableCell className="font-medium text-[var(--ink)]">
                          {g.name}
                        </TableCell>
                        <TableCell className="text-[var(--secondary)]">
                          {g.brand || "—"}
                        </TableCell>
                        <TableCell className="text-[var(--secondary)]">
                          {getCategoryLabel(g.category)}
                        </TableCell>
                        <TableCell>
                          <Badge className={styles.status} data-status={g.status || "unknown"}>
                            {g.status === "active" ? "Đang dùng" : g.status === "retired" ? "Đã trải nghiệm" : "Chưa cập nhật"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editGear(g)}
                              aria-label="Chỉnh sửa"
                            className="h-8 w-8 hover:text-[var(--highlight)] hover:bg-[var(--panel)]"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGear(g.id)}
                              aria-label="Xóa"
                            className="h-8 w-8 hover:text-[var(--danger)] hover:bg-[var(--panel)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={gearOpen} onOpenChange={setGearOpen} className={styles.dialogShell}>
              <DialogContent className={styles.dialog} data-admin-dialog>
                <DialogHeader>
                  <DialogTitle className="text-[var(--ink)]">
                    {gearEditId ? "Sửa thiết bị" : "Thêm thiết bị"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGearSubmit} className="space-y-4 pt-1">
                  <Field label="Tên thiết bị">
                    <SI
                      value={gearForm.name}
                      onChange={(e) =>
                        setGearForm({ ...gearForm, name: e.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field label="Thương hiệu">
                    <SI
                      value={gearForm.brand}
                      onChange={(e) =>
                        setGearForm({ ...gearForm, brand: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Loại thiết bị">
                    <SS
                      value={gearForm.category}
                      onChange={(v) =>
                        setGearForm({ ...gearForm, category: v })
                      }
                    >
                      <option value="">Chọn loại thiết bị</option>
                      {GEAR_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label} ({cat.value})
                        </option>
                      ))}
                    </SS>
                  </Field>
                  <Field label="Ảnh">
                    <InlineImageUpload
                      value={gearForm.image_url}
                      bucket="gears"
                      onChange={(url) =>
                        setGearForm({ ...gearForm, image_url: url })
                      }
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <SS
                      value={gearForm.status}
                      onChange={(v) =>
                        setGearForm({ ...gearForm, status: v as any })
                      }
                    >
                      <option value="active">Đang dùng</option>
                      <option value="retired">Đã trải nghiệm</option>
                    </SS>
                  </Field>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setGearOpen(false)}
                      className="text-[var(--secondary)]"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className={styles.primary}
                    >
                      {gearEditId ? "Cập nhật" : "Tạo mới"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* ── GAMES ── */}
        {tab === "games" && (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Trò chơi{" "}
                <span className="text-[var(--secondary)] text-sm font-normal">
                  ({games.length})
                </span>
              </h2>
              <Button
                onClick={openAddGame}
                className={styles.primary}
              >
                <Plus className="mr-2 h-4 w-4" /> Thêm trò chơi
              </Button>
            </div>

            <div className={styles.tablePanel}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--line)] hover:bg-transparent">
                    <TableHead>Ảnh</TableHead>
                    {sortHeading("games", "title", "Tên trò chơi")}
                    {sortHeading("games", "publisher", "Nhà phát hành")}
                    {sortHeading("games", "profile_url", "Liên kết hồ sơ")}
                    {sortHeading("games", "status", "Trạng thái")}
                    <TableHead className="text-[var(--secondary)] font-medium text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gamesLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-[var(--secondary)] py-10"
                      >
                        Đang tải…
                      </TableCell>
                    </TableRow>
                  ) : games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-[var(--secondary)]">
                          <Gamepad2 className="w-8 h-8" />
                          <p className="text-sm">
                            Chưa có trò chơi nào. Nhấn "Thêm trò chơi" để thêm.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortRows(games, sorts.games.field as keyof Game | null, sorts.games.direction).map((g) => (
                      <TableRow
                        key={g.id}
                        className="border-[var(--line)] hover:bg-[var(--panel)]"
                      >
                        <TableCell><TableImage src={g.image_url} name={g.title} /></TableCell>
                        <TableCell className="font-medium text-[var(--ink)]">
                          {g.title}
                        </TableCell>
                        <TableCell className="text-[var(--secondary)]">
                          {g.publisher || "—"}
                        </TableCell>
                        <TableCell className="text-[var(--secondary)] max-w-[160px] truncate">
                          {g.profile_url ? (
                            <a
                              href={g.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--highlight)] hover:underline truncate block"
                            >
                              {g.profile_url}
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={styles.status} data-status={g.status || "unknown"}>
                            {g.status === "online" ? "Trực tuyến" : g.status === "offline" ? "Ngoại tuyến" : "Chưa cập nhật"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editGame(g)}
                              aria-label="Chỉnh sửa"
                            className="h-8 w-8 hover:text-[var(--highlight)] hover:bg-[var(--panel)]"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGame(g.id)}
                              aria-label="Xóa"
                            className="h-8 w-8 hover:text-[var(--danger)] hover:bg-[var(--panel)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={gameOpen} onOpenChange={setGameOpen} className={styles.dialogShell}>
              <DialogContent className={styles.dialog} data-admin-dialog>
                <DialogHeader>
                  <DialogTitle className="text-[var(--ink)]">
                    {gameEditId ? "Sửa trò chơi" : "Thêm trò chơi"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGameSubmit} className="space-y-4 pt-1">
                  {/* ── PLATFORM (luôn hiển thị đầu tiên) ── */}
                  <Field label="Nền tảng">
                    <SS
                      value={gameForm.platform}
                      onChange={(v) => {
                        const platform = v as "none" | "steam" | "hoyolab";
                        const HOYO_COVERS: Record<string, string> = {
                          genshin:
                            "https://upload-os-bbs.hoyolab.com/upload/2021/11/08/d7b3d0d3e6b5b8a1c2e4f5a6b7c8d9e0.png",
                          hsr: "https://hsr.hoyoverse.com/upload/op/2023/01/20/d7b3d0d3e6b5b8a1c2e4f5a6b7c8d9e0.png",
                          hi3: "",
                          zzz: "",
                        };

                        // Auto-set publisher based on platform
                        let autoPublisher = "";
                        if (platform === "steam") {
                          autoPublisher = "Steam";
                        } else if (platform === "hoyolab") {
                          autoPublisher = "HoYoverse";
                        }

                        setGameForm((f) => ({
                          ...f,
                          platform,
                          publisher: autoPublisher || f.publisher,
                          ...(platform === "steam" || platform === "none"
                            ? {
                                hoyolab_game: "",
                                hoyolab_uid: "",
                                hoyolab_server: "",
                              }
                            : {}),
                          ...(platform === "hoyolab" || platform === "none"
                            ? {
                                steam_appid: "",
                                steam_id: "",
                                steamSearchQuery: "",
                                steamSearchResults: [],
                                steamSearchError: null,
                              }
                            : {}),
                        }));
                      }}
                    >
                      <option value="none">Không có</option>
                      <option value="steam">Steam</option>
                      <option value="hoyolab">HoYoLAB</option>
                    </SS>
                  </Field>

                  {/* ── STEAM FIELDS ── */}
                  {gameForm.platform === "steam" && (
                    <div className="space-y-3">
                      <Field label="Tìm game trên Steam">
                        <div className="relative">
                          <SI
                            placeholder="Nhập tên game..."
                            value={gameForm.steamSearchQuery}
                            onChange={(e) => {
                              const q = e.target.value;
                              setGameForm((f) => ({
                                ...f,
                                steamSearchQuery: q,
                              }));
                              searchSteam(q);
                            }}
                          />
                          {(gameForm.steamSearchResults.length > 0 ||
                            gameForm.steamSearchError ||
                            (gameForm.steamSearchQuery.length >= 2 &&
                              !gameForm.steamSearchLoading &&
                              gameForm.steamSearchResults.length === 0 &&
                              !gameForm.steamSearchError)) && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[var(--field)] border border-[var(--line)] rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                              {gameForm.steamSearchLoading && (
                                <div className="px-3 py-2 text-xs text-[var(--secondary)]">
                                  Đang tìm...
                                </div>
                              )}
                              {gameForm.steamSearchError && (
                                <div className="px-3 py-2 text-xs text-[var(--danger)]">
                                  {gameForm.steamSearchError}
                                </div>
                              )}
                              {!gameForm.steamSearchLoading &&
                                !gameForm.steamSearchError &&
                                gameForm.steamSearchResults.length === 0 &&
                                gameForm.steamSearchQuery.length >= 2 && (
                                  <div className="px-3 py-2 text-xs text-[var(--secondary)]">
                                    Không tìm thấy game nào
                                  </div>
                                )}
                              {gameForm.steamSearchResults.map((r) => (
                                <button
                                  key={r.appid}
                                  type="button"
                                  onClick={() => {
                                    setGameForm((f) => ({
                                      ...f,
                                      title: r.name,
                                      steam_appid: String(r.appid),
                                      image_url: `https://cdn.akamai.steamstatic.com/steam/apps/${r.appid}/header.jpg`,
                                      publisher: "Steam",
                                      steamSearchQuery: "",
                                      steamSearchResults: [],
                                      steamSearchError: null,
                                    }));
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[var(--panel)] text-left transition-colors"
                                >
                                  <img
                                    src={`https://cdn.akamai.steamstatic.com/steam/apps/${r.appid}/capsule_sm_120.jpg`}
                                    alt={r.name}
                                    className="w-10 h-6 object-cover rounded shrink-0"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                  <span className="text-sm text-[var(--ink)] truncate">
                                    {r.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </Field>

                      {/* Preview sau khi chọn */}
                      {gameForm.steam_appid && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--panel)] rounded-lg border border-[var(--line)]">
                          <img
                            src={`https://cdn.akamai.steamstatic.com/steam/apps/${gameForm.steam_appid}/header.jpg`}
                            alt={gameForm.title}
                            className="w-24 h-14 object-cover rounded shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--ink)] truncate">
                              {gameForm.title}
                            </p>
                            <p className="text-xs text-[var(--secondary)] mt-0.5">
                              App ID: {gameForm.steam_appid}
                            </p>
                          </div>
                        </div>
                      )}

                      <Field label="Steam ID (64-bit)">
                        <SI
                          placeholder="vd: 76561198XXXXXXXXX hoặc URL profile"
                          value={gameForm.steam_id}
                          onChange={(e) =>
                            setGameForm((f) => ({
                              ...f,
                              steam_id: extractSteamId(e.target.value),
                            }))
                          }
                        />
                        <p className="text-xs text-[var(--secondary)] mt-1">
                          Nhập Steam ID 64-bit hoặc URL profile
                          (steamcommunity.com/profiles/...)
                        </p>
                      </Field>

                      <Field label="Publisher">
                        <SI
                          placeholder="Nhà phát hành..."
                          value={gameForm.publisher}
                          onChange={(e) =>
                            setGameForm({
                              ...gameForm,
                              publisher: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-[var(--secondary)] mt-1">
                          Tự động điền "Steam", có thể chỉnh sửa
                        </p>
                      </Field>
                    </div>
                  )}

                  {/* ── HOYOLAB FIELDS ── */}
                  {gameForm.platform === "hoyolab" && (
                    <div className="space-y-3">
                      <Field label="Game HoYoverse">
                        <SS
                          value={gameForm.hoyolab_game || ""}
                          onChange={(v) => {
                            const game = v as Game["hoyolab_game"] | "";
                            const defaultServers: Record<string, string> = {
                              genshin: "os_asia",
                              hsr: "prod_official_asia",
                              hi3: "overseas01",
                              zzz: "prod_gf_asia",
                            };
                            // Auto-fill title and image from HoYo game
                            const HOYO_INFO: Record<
                              string,
                              {
                                title: string;
                                image: string;
                                publisher: string;
                              }
                            > = {
                              genshin: {
                                title: "Genshin Impact",
                                image:
                                  "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/b4b6e8803f1f4b6b8b8b8b8b8b8b8b8b_1234567890.jpg",
                                publisher: "HoYoverse",
                              },
                              hsr: {
                                title: "Honkai: Star Rail",
                                image:
                                  "https://hsr.hoyoverse.com/upload/op/2023/01/20/d7b3d0d3e6b5b8a1c2e4f5a6b7c8d9e0.png",
                                publisher: "HoYoverse",
                              },
                              hi3: {
                                title: "Honkai Impact 3rd",
                                image: "",
                                publisher: "HoYoverse",
                              },
                              zzz: {
                                title: "Zenless Zone Zero",
                                image: "",
                                publisher: "HoYoverse",
                              },
                            };
                            const info = game ? HOYO_INFO[game] : null;
                            setGameForm((f) => ({
                              ...f,
                              hoyolab_game: game,
                              hoyolab_server: game
                                ? f.hoyolab_server || defaultServers[game]
                                : "",
                              // Auto-fill title if empty
                              title: f.title || (info?.title ?? ""),
                              // Auto-fill publisher
                              publisher: info?.publisher ?? "HoYoverse",
                            }));
                          }}
                        >
                          <option value="">— Chọn game —</option>
                          <option value="genshin">Genshin Impact</option>
                          <option value="hsr">Honkai: Star Rail</option>
                          <option value="hi3">Honkai Impact 3rd</option>
                          <option value="zzz">Zenless Zone Zero</option>
                        </SS>
                      </Field>

                      {gameForm.hoyolab_game && (
                        <>
                          <Field label="UID trong game">
                            <SI
                              placeholder="vd: 805842362"
                              value={gameForm.hoyolab_uid}
                              onChange={(e) =>
                                setGameForm({
                                  ...gameForm,
                                  hoyolab_uid: e.target.value,
                                })
                              }
                            />
                          </Field>
                          <Field label="Server">
                            <SS
                              value={gameForm.hoyolab_server}
                              onChange={(v) =>
                                setGameForm({ ...gameForm, hoyolab_server: v })
                              }
                            >
                              {gameForm.hoyolab_game === "genshin" && (
                                <>
                                  <option value="os_asia">Asia</option>
                                  <option value="os_euro">Europe</option>
                                  <option value="os_usa">America</option>
                                  <option value="os_cht">TW/HK/MO</option>
                                </>
                              )}
                              {gameForm.hoyolab_game === "hsr" && (
                                <>
                                  <option value="prod_official_asia">
                                    Asia
                                  </option>
                                  <option value="prod_official_euro">
                                    Europe
                                  </option>
                                  <option value="prod_official_usa">
                                    America
                                  </option>
                                  <option value="prod_official_cht">
                                    TW/HK/MO
                                  </option>
                                </>
                              )}
                              {gameForm.hoyolab_game === "hi3" && (
                                <>
                                  <option value="overseas01">Asia</option>
                                  <option value="overseas02">
                                    Europe/America
                                  </option>
                                </>
                              )}
                              {gameForm.hoyolab_game === "zzz" && (
                                <>
                                  <option value="prod_gf_asia">Asia</option>
                                  <option value="prod_gf_eu">Europe</option>
                                  <option value="prod_gf_us">America</option>
                                  <option value="prod_gf_jp">Japan</option>
                                </>
                              )}
                            </SS>
                          </Field>
                          <p className="text-xs text-[var(--secondary)]">
                            Cần set{" "}
                            <code className="bg-black/30 px-1 rounded">
                              HOYOLAB_LTOKEN
                            </code>{" "}
                            và{" "}
                            <code className="bg-black/30 px-1 rounded">
                              HOYOLAB_LTUID
                            </code>{" "}
                            trong env vars
                          </p>
                        </>
                      )}

                      <Field label="Publisher">
                        <SI
                          placeholder="Nhà phát hành..."
                          value={gameForm.publisher}
                          onChange={(e) =>
                            setGameForm({
                              ...gameForm,
                              publisher: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-[var(--secondary)] mt-1">
                          Tự động điền "HoYoverse", có thể chỉnh sửa
                        </p>
                      </Field>
                    </div>
                  )}

                  {/* ── MANUAL FIELDS (chỉ hiện khi không có platform) ── */}
                  {gameForm.platform === "none" && (
                    <>
                      <Field label="Tên trò chơi">
                        <SI
                          value={gameForm.title}
                          onChange={(e) =>
                            setGameForm({ ...gameForm, title: e.target.value })
                          }
                          required
                        />
                      </Field>
                      <Field label="Publisher (tùy chọn)">
                        <SI
                          placeholder="Tên nhà phát hành..."
                          value={gameForm.publisher}
                          onChange={(e) =>
                            setGameForm({
                              ...gameForm,
                              publisher: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Profile Link (tùy chọn)">
                        <SI
                          placeholder="https://..."
                          value={gameForm.profile_url}
                          onChange={(e) =>
                            setGameForm({
                              ...gameForm,
                              profile_url: e.target.value,
                            })
                          }
                        />
                      </Field>
                      <Field label="Ảnh bìa">
                        <InlineImageUpload
                          value={gameForm.image_url}
                          bucket="games"
                          onChange={(url) =>
                            setGameForm({ ...gameForm, image_url: url })
                          }
                        />
                      </Field>
                    </>
                  )}

                  {/* ── RAWG IMAGE PICKER (hiển thị cho tất cả platforms) ── */}
                  {gameForm.title && (
                    <div className="p-4 bg-[var(--panel)] rounded-lg border border-[var(--line)]">
                      <p className="text-sm font-semibold text-[var(--ink)] mb-3">
                        Chọn ảnh từ thư viện RAWG
                      </p>
                      <RAWGImagePicker
                        gameName={gameForm.title}
                        currentImage={gameForm.image_url}
                        onSelectImage={(url) =>
                          setGameForm({ ...gameForm, image_url: url })
                        }
                      />
                    </div>
                  )}

                  <Field label="Trạng thái">
                    <SS
                      value={gameForm.status || "online"}
                      onChange={(v) =>
                        setGameForm({
                          ...gameForm,
                          status: v as Game["status"],
                        })
                      }
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </SS>
                  </Field>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setGameOpen(false)}
                      className="text-[var(--secondary)]"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className={styles.primary}
                    >
                      {gameEditId ? "Cập nhật" : "Tạo mới"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* ── SOCIAL ── */}
        {tab === "social" && (
          <>
            <div className={styles.sectionHeading}>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Liên kết{" "}
                <span className="text-[var(--secondary)] text-sm font-normal">
                  ({socials.length})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleSync("social")}
                  disabled={syncing}
                  className="border-[var(--line)] text-[var(--secondary)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                  Đồng bộ từ trang giới thiệu
                </Button>
                <Button
                  onClick={openAddSocial}
                  className={styles.primary}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm liên kết
                </Button>
              </div>
            </div>

            <div className={styles.tablePanel}>
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--line)] hover:bg-transparent">
                    {sortHeading("social", "platform", "Nền tảng")}
                    {sortHeading("social", "url", "URL")}
                    <TableHead className="text-[var(--secondary)] font-medium text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socialsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-[var(--secondary)] py-10"
                      >
                        Đang tải…
                      </TableCell>
                    </TableRow>
                  ) : socials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-[var(--secondary)]">
                          <LinkIcon className="w-8 h-8" />
                          <p className="text-sm">
                            Chưa có liên kết nào. Nhấn "Thêm liên kết" để thêm hoặc đồng bộ danh sách mặc định.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync("social")}
                            disabled={syncing}
                            className="mt-1 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--line)]"
                          >
                            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                            Đồng bộ liên kết mặc định
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortRows(socials, sorts.social.field as keyof SocialLink | null, sorts.social.direction).map((s) => (
                      <TableRow
                        key={s.id}
                        className="border-[var(--line)] hover:bg-[var(--panel)]"
                      >
                        {" "}
                        <TableCell className="font-medium text-[var(--ink)]">
                          <div className="flex items-center gap-2">
                            <SocialIcon
                              platform={s.platform}
                              size={16}
                              className="text-[var(--secondary)] shrink-0"
                            />
                            {s.platform}
                          </div>
                        </TableCell>
                        <TableCell className="text-[var(--secondary)] max-w-xs truncate">
                          {s.url}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editSocial(s)}
                              aria-label="Chỉnh sửa"
                            className="h-8 w-8 hover:text-[var(--highlight)] hover:bg-[var(--panel)]"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSocial(s.id)}
                              aria-label="Xóa"
                            className="h-8 w-8 hover:text-[var(--danger)] hover:bg-[var(--panel)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <Dialog open={socialOpen} onOpenChange={setSocialOpen} className={styles.dialogShell}>
              <DialogContent className={styles.dialog} data-admin-dialog>
                <DialogHeader>
                  <DialogTitle className="text-[var(--ink)]">
                    {socialEditId ? "Sửa liên kết" : "Thêm liên kết"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSocialSubmit} className="space-y-4 pt-1">
                  <Field label="Nền tảng">
                    <SI
                      placeholder="Twitter, Twitch, YouTube, Discord..."
                      value={socialForm.platform}
                      onChange={(e) =>
                        setSocialForm({
                          ...socialForm,
                          platform: e.target.value,
                        })
                      }
                      required
                    />
                  </Field>
                  <Field label="Tên hiển thị">
                    <SI
                      placeholder="vd: minh, silentboiz..."
                      value={socialForm.display_name}
                      onChange={(e) =>
                        setSocialForm({
                          ...socialForm,
                          display_name: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field label="URL">
                    <SI
                      placeholder="https://..."
                      value={socialForm.url}
                      onChange={(e) => {
                        const url = e.target.value;
                        setSocialForm({ ...socialForm, url });
                        // Auto-extract username from URL if display_name is empty
                        if (url && !socialForm.display_name) {
                          const username = extractUsernameFromUrl(url);
                          if (username)
                            setSocialForm((prev) => ({
                              ...prev,
                              display_name: username,
                            }));
                        }
                      }}
                      required
                    />
                    <p className="text-xs text-[var(--secondary)] mt-1">
                      Tên hiển thị sẽ tự động được trích xuất từ URL
                    </p>
                  </Field>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSocialOpen(false)}
                      className="text-[var(--secondary)]"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      className={styles.primary}
                    >
                      {socialEditId ? "Cập nhật" : "Tạo mới"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
        </main>
      </div>
    </div>
  );
}
