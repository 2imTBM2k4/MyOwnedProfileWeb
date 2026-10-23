"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import { publicUrl, validPayload, type Gear } from "@/lib/profile-content";
import styles from "../profile.module.css";
import catalogue from "./gears.module.css";

const CATEGORY_META: Record<string, { label: string; order: number }> = {
  keyboard: { label: "Bàn phím", order: 1 },
  mouse: { label: "Chuột", order: 2 },
  monitor: { label: "Màn hình", order: 3 },
  mousepad: { label: "Lót chuột", order: 4 },
  micro: { label: "Micro", order: 5 },
  iem: { label: "Tai nghe nhét tai", order: 6 },
  headset: { label: "Tai nghe chụp tai", order: 7 },
  dac: { label: "Bộ giải mã âm thanh", order: 8 },
  dap: { label: "Máy nghe nhạc", order: 9 },
  phone: { label: "Điện thoại", order: 10 },
};

export default function AllGearsPage() {
  const [gears, setGears] = useState<Gear[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchGears = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const response = await fetch("/api/gears", { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error("Unable to load gear");
      const value = await response.json();
      if (!validPayload("gears", value)) throw new Error("Invalid gear data");
      setGears(value);
    } catch { setFailed(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    document.title = "Góc thiết bị · Trần Bình Minh";
    void fetchGears();
  }, [fetchGears]);

  const categories = useMemo(() => Array.from(new Set(gears.map(gear => gear.category).filter((category): category is string => !!category)))
    .sort((a, b) => (CATEGORY_META[a.toLowerCase()]?.order ?? 99) - (CATEGORY_META[b.toLowerCase()]?.order ?? 99)), [gears]);

  const groups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const grouped = new Map<string, Gear[]>();
    gears.filter(gear => (selectedCategory === "all" || gear.category === selectedCategory) &&
      (!query || [gear.name, gear.brand, gear.category].some(value => value?.toLowerCase().includes(query))))
      .forEach(gear => {
        const key = gear.category || "Khác";
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(gear);
      });
    return Array.from(grouped, ([category, items]) => ({
      category,
      title: CATEGORY_META[category.toLowerCase()]?.label || category,
      items: items.sort((a, b) => Number(b.status === "active") - Number(a.status === "active") || a.name.localeCompare(b.name)),
    })).sort((a, b) => (CATEGORY_META[a.category.toLowerCase()]?.order ?? 99) - (CATEGORY_META[b.category.toLowerCase()]?.order ?? 99));
  }, [gears, searchQuery, selectedCategory]);

  const activeCount = gears.filter(gear => gear.status === "active").length;
  const retiredCount = gears.filter(gear => gear.status === "retired").length;
  const resultCount = groups.reduce((total, group) => total + group.items.length, 0);
  const resetFilters = () => { setSearchQuery(""); setSelectedCategory("all"); };

  return <div id="top" className={styles.profile}>
    <SmoothScroll />
    <a className={styles.skipLink} href="#main">Đến nội dung chính</a>
    <div className={styles.frame}>
      <FloatingNavbar catalogue />
      <main id="main">
        <section className={catalogue.intro}>
          <Link href="/#gears" className={styles.textLink}><ArrowLeft size={16} />Về trang giới thiệu</Link>
          <h1>Góc thiết bị.</h1>
          <div className={catalogue.introDetails}>
            <p>Từ bàn phím đến một bộ nghe nhạc nhỏ. Đây là những món đồ mình đang dùng và đã có dịp trải nghiệm.</p>
            {!loading && !failed && <p className={catalogue.counts}><span>{activeCount} đang dùng</span><span>{retiredCount} đã trải nghiệm</span><span>{gears.length} món trong bộ sưu tập</span></p>}
          </div>
        </section>

        <section id="collection" className={catalogue.collection} aria-labelledby="collection-title">
          <div className={catalogue.collectionHeading}><h2 id="collection-title">Bộ sưu tập.</h2><p>Món đang dùng được xếp trước trong mỗi nhóm.</p></div>
          <div className={catalogue.controls}>
            <div className={catalogue.searchGroup}>
              <label htmlFor="gear-search">Tìm thiết bị</label>
              <div className={catalogue.searchField}><Search size={18} aria-hidden="true" /><input id="gear-search" type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Tên, thương hiệu hoặc loại thiết bị…" />{searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Xóa từ khóa tìm kiếm"><X size={18} /></button>}</div>
            </div>
            <p className={catalogue.resultCount} role="status">{loading ? "Đang tải thiết bị…" : failed && gears.length === 0 ? "Chưa tải được thiết bị" : `${resultCount} trên ${gears.length} món`}</p>
          </div>
          <div className={catalogue.filters} role="group" aria-label="Lọc theo loại thiết bị">
            <button onClick={() => setSelectedCategory("all")} aria-pressed={selectedCategory === "all"}>Tất cả <span>{gears.length}</span></button>
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category}>{CATEGORY_META[category.toLowerCase()]?.label || category}<span>{gears.filter(gear => gear.category === category).length}</span></button>)}
          </div>

          {failed && <div className={styles.notice} role="alert"><span>Chưa thể tải danh sách thiết bị. Bạn thử lại nhé.</span><button onClick={() => void fetchGears()} disabled={loading}>{loading ? "Đang tải…" : "Thử lại"}</button></div>}
          {!loading && !failed && gears.length === 0 && <p className={styles.empty}>Góc thiết bị đang được cập nhật.</p>}
          {!loading && gears.length > 0 && groups.length === 0 && <div className={catalogue.noResults}><p>Không tìm thấy thiết bị phù hợp.</p><button onClick={resetFilters}>Xóa bộ lọc</button></div>}

          <div className={catalogue.groups}>
            {groups.map(group => <section className={catalogue.group} key={group.category}>
              <div className={catalogue.groupHeading}><h3>{group.title}</h3><p>{group.items.length} món · {group.items.filter(gear => gear.status === "active").length} đang dùng</p></div>
              <div className={`${styles.gearGrid} ${catalogue.gearGrid}`}>
                {group.items.map(gear => <article className={styles.gear} key={gear.id}>
                  {publicUrl(gear.image_url) && <div className={styles.gearImage}><img src={publicUrl(gear.image_url)} alt={gear.name} loading="lazy" /></div>}
                  <div className={styles.gearMeta}><span>{gear.brand || group.title}</span><span className={gear.status === "active" ? catalogue.active : undefined}>{gear.status === "active" ? "Đang dùng" : gear.status === "retired" ? "Đã trải nghiệm" : "Chưa cập nhật"}</span></div>
                  <h4 className={catalogue.gearName}>{gear.name}</h4>
                  {gear.notes && <p className={styles.gearNotes}>{gear.notes}</p>}
                </article>)}
              </div>
            </section>)}
          </div>
        </section>
      </main>
      <footer className={`${styles.footer} ${catalogue.footer}`}><Link href="/">silentboiz.</Link><span>© {new Date().getFullYear()} Trần Bình Minh</span><a href="#top">Về đầu trang ↑</a></footer>
    </div>
  </div>;
}
