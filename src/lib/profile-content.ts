export type Project = {
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

export type Gear = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  status: "active" | "retired" | null;
  image_url: string | null;
  notes?: string | null;
};

export function validPayload(key: string, value: unknown): boolean {
  const record = (item: unknown): item is Record<string, unknown> =>
    item !== null && typeof item === "object" && !Array.isArray(item);
  const strings = (item: Record<string, unknown>, fields: string[]) =>
    fields.every(field => item[field] == null || typeof item[field] === "string");
  if (key === "profile") return value === null || record(value) &&
    strings(value, ["username", "bio", "avatar_url", "cover_url"]);
  if (!Array.isArray(value)) return false;
  return value.every(item => {
    if (!record(item) || typeof item.id !== "string") return false;
    if (key === "projects") return typeof item.title === "string" &&
      strings(item, ["description", "github_url", "demo_url", "image_url", "created_at", "problem", "did", "result", "kind", "tone", "title_en", "kind_en", "problem_en", "did_en", "result_en", "description_en"]) &&
      (item.tags == null || Array.isArray(item.tags) && item.tags.every(tag => typeof tag === "string")) &&
      (item.status == null || ["active", "completed"].includes(String(item.status)));
    if (key === "gears") return typeof item.name === "string" &&
      strings(item, ["brand", "category", "image_url", "notes"]) &&
      (item.status == null || ["active", "retired"].includes(String(item.status)));
    if (key === "socialLinks") return typeof item.platform === "string" &&
      typeof item.url === "string" && strings(item, ["display_name"]);
    return false;
  });
}

export function isFeaturedTag(tag: string): boolean {
  return ["featured", "nổi bật", "noi bat"].includes(tag.trim().toLowerCase());
}

export function orderProjects(projects: Project[]): Project[] {
  return [...projects].sort((a, b) =>
    Number(b.tags?.some(isFeaturedTag) ?? false) - Number(a.tags?.some(isFeaturedTag) ?? false)
  );
}

export function previewGears(gears: Gear[]): Gear[] {
  const categories = ["keyboard", "iem", "dap", "mouse", "dac", "monitor"];
  const active = gears.filter((gear) => gear.status === "active");
  const selected = categories.flatMap((category) => {
    const gear = active.find((item) => item.category?.toLowerCase() === category);
    return gear ? [gear] : [];
  });
  return [...selected, ...active.filter((gear) => !selected.includes(gear))].slice(0, 6);
}

export function publicUrl(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  const raw = value.trim();
  if (!/^https?:\/\//i.test(raw) && !/^[\w-]+(?:\.[\w-]+)+(?:[/:?#]|$)/.test(raw)) return undefined;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
