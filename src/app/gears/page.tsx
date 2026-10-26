"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import SmoothScroll from "@/components/SmoothScroll";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_ORDER } from "@/data/translations";
import { publicUrl, validPayload, type Gear } from "@/lib/profile-content";
import styles from "../profile.module.css";
import catalogue from "./gears.module.css";

export default function AllGearsPage() {
  const { t } = useLanguage();
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
    document.title = t.gearsPage.metaTitle;
    void fetchGears();
  }, [fetchGears, t.gearsPage.metaTitle]);

  const categories = useMemo(() => Array.from(new Set(gears.map(gear => gear.category).filter((category): category is string => !!category)))
    .sort((a, b) => (CATEGORY_ORDER[a.toLowerCase()] ?? 99) - (CATEGORY_ORDER[b.toLowerCase()] ?? 99)), [gears]);

  const groups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const grouped = new Map<string, Gear[]>();
    gears.filter(gear => (selectedCategory === "all" || gear.category === selectedCategory) &&
      (!query || [gear.name, gear.brand, gear.category].some(value => value?.toLowerCase().includes(query))))
      .forEach(gear => {
        const key = gear.category || t.common.other;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(gear);
      });
    return Array.from(grouped, ([category, items]) => ({
      category,
      title: t.gearsPage.categories[category.toLowerCase()] || category,
      items: items.sort((a, b) => Number(b.status === "active") - Number(a.status === "active") || a.name.localeCompare(b.name)),
    })).sort((a, b) => (CATEGORY_ORDER[a.category.toLowerCase()] ?? 99) - (CATEGORY_ORDER[b.category.toLowerCase()] ?? 99));
  }, [gears, searchQuery, selectedCategory, t.common.other, t.gearsPage.categories]);

  const activeCount = gears.filter(gear => gear.status === "active").length;
  const retiredCount = gears.filter(gear => gear.status === "retired").length;
  const resultCount = groups.reduce((total, group) => total + group.items.length, 0);
  const resetFilters = () => { setSearchQuery(""); setSelectedCategory("all"); };

  return <div id="top" className={styles.profile}>
    <SmoothScroll />
    <a className={styles.skipLink} href="#main">{t.common.skipToContent}</a>
    <div className={styles.frame}>
      <FloatingNavbar catalogue />
      <main id="main">
        <section className={catalogue.intro}>
          <Link href="/#gears" className={styles.textLink}><ArrowLeft size={16} />{t.gearsPage.backToHome}</Link>
          <h1>{t.gearsPage.title}</h1>
          <div className={catalogue.introDetails}>
            <p>{t.gearsPage.intro}</p>
            {!loading && !failed && <p className={catalogue.counts}>
              <span>{t.gearsPage.activeCount.replace("{count}", String(activeCount))}</span>
              <span>{t.gearsPage.retiredCount.replace("{count}", String(retiredCount))}</span>
              <span>{t.gearsPage.totalCount.replace("{count}", String(gears.length))}</span>
            </p>}
          </div>
        </section>

        <section id="collection" className={catalogue.collection} aria-labelledby="collection-title">
          <div className={catalogue.collectionHeading}><h2 id="collection-title">{t.gearsPage.collectionHeading}</h2><p>{t.gearsPage.collectionSub}</p></div>
          <div className={catalogue.controls}>
            <div className={catalogue.searchGroup}>
              <label htmlFor="gear-search">{t.gearsPage.searchLabel}</label>
              <div className={catalogue.searchField}><Search size={18} aria-hidden="true" /><input id="gear-search" type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder={t.gearsPage.searchPlaceholder} />{searchQuery && <button onClick={() => setSearchQuery("")} aria-label={t.gearsPage.clearSearchAria}><X size={18} /></button>}</div>
            </div>
            <p className={catalogue.resultCount} role="status">{loading ? t.gearsPage.loadingGears : failed && gears.length === 0 ? t.gearsPage.loadFailedNotice : t.gearsPage.resultRatio.replace("{count}", String(resultCount)).replace("{total}", String(gears.length))}</p>
          </div>
          <div className={catalogue.filters} role="group" aria-label={t.gearsPage.filterAria}>
            <button onClick={() => setSelectedCategory("all")} aria-pressed={selectedCategory === "all"}>{t.gearsPage.allFilter} <span>{gears.length}</span></button>
            {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} aria-pressed={selectedCategory === category}>{t.gearsPage.categories[category.toLowerCase()] || category}<span>{gears.filter(gear => gear.category === category).length}</span></button>)}
          </div>

          {failed && <div className={styles.notice} role="alert"><span>{t.gearsPage.errorAlert}</span><button onClick={() => void fetchGears()} disabled={loading}>{loading ? t.common.loading : t.common.retry}</button></div>}
          {!loading && !failed && gears.length === 0 && <p className={styles.empty}>{t.gearsHome.empty}</p>}
          {!loading && gears.length > 0 && groups.length === 0 && <div className={catalogue.noResults}><p>{t.gearsPage.noResults}</p><button onClick={resetFilters}>{t.gearsPage.clearFilters}</button></div>}

          <div className={catalogue.groups}>
            {groups.map(group => <section className={catalogue.group} key={group.category}>
              <div className={catalogue.groupHeading}><h3>{group.title}</h3><p>{t.gearsPage.groupItemsRatio.replace("{total}", String(group.items.length)).replace("{active}", String(group.items.filter(gear => gear.status === "active").length))}</p></div>
              <div className={`${styles.gearGrid} ${catalogue.gearGrid}`}>
                {group.items.map(gear => <article className={styles.gear} key={gear.id}>
                  {publicUrl(gear.image_url) && <div className={styles.gearImage}><img src={publicUrl(gear.image_url)} alt={gear.name} loading="lazy" /></div>}
                  <div className={styles.gearMeta}><span>{gear.brand || group.title}</span><span className={gear.status === "active" ? catalogue.active : undefined}>{gear.status === "active" ? t.gearsPage.statusActive : gear.status === "retired" ? t.gearsPage.statusRetired : t.gearsPage.statusUnknown}</span></div>
                  <h4 className={catalogue.gearName}>{gear.name}</h4>
                  {gear.notes && <p className={styles.gearNotes}>{gear.notes}</p>}
                </article>)}
              </div>
            </section>)}
          </div>
        </section>
      </main>
      <footer className={`${styles.footer} ${catalogue.footer}`}><Link href="/">silentboiz.</Link><span>© {new Date().getFullYear()} Trần Bình Minh</span><a href="#top">{t.gearsPage.backToTop}</a></footer>
    </div>
  </div>;
}
