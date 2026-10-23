"use client";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] font-sans antialiased animate-pulse relative overflow-x-hidden">
      {/* Floating Liquid Pill Header Skeleton */}
      <div className="sticky top-5 z-50 px-4 sm:px-6 mb-8 max-w-5xl mx-auto">
        <div className="h-14 rounded-full glass-liquid px-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-28 h-5 rounded-full bg-slate-200 dark:bg-slate-800 animate-shimmer" />
            <div className="w-20 h-4 rounded-full bg-slate-200/60 dark:bg-slate-800/60 hidden sm:block" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-4 rounded bg-slate-200/60 dark:bg-slate-800/60 hidden md:block" />
            <div className="w-14 h-4 rounded bg-slate-200/60 dark:bg-slate-800/60 hidden md:block" />
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="w-24 h-8 rounded-full bg-blue-500/20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-28 py-6">
        {/* Hero Section Skeleton */}
        <div className="min-h-[55vh] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-4">
          <div className="lg:col-span-7 space-y-6">
            <div className="w-48 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="w-full max-w-xl h-12 sm:h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-shimmer" />
            <div className="w-3/4 h-12 sm:h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="w-full max-w-lg h-5 rounded-md bg-slate-200/60 dark:bg-slate-800/60 mt-4" />
            <div className="w-4/5 h-5 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="w-44 h-12 rounded-full bg-blue-500/25" />
              <div className="w-36 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Liquid Glass Hero Card Skeleton */}
          <div className="lg:col-span-5 w-full flex justify-center py-2">
            <div className="w-full max-w-lg h-96 rounded-3xl glass-liquid p-6 sm:p-7 flex flex-col justify-between shadow-2xl animate-shimmer">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05] dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/30" />
                  <div className="space-y-1.5">
                    <div className="w-28 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-36 h-3 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                  </div>
                </div>
                <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-full h-9 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 my-4" />
              <div className="space-y-3 flex-1">
                <div className="w-full h-8 rounded-xl bg-slate-200/40 dark:bg-slate-800/40" />
                <div className="w-full h-8 rounded-xl bg-slate-200/40 dark:bg-slate-800/40" />
                <div className="w-full h-8 rounded-xl bg-slate-200/40 dark:bg-slate-800/40" />
              </div>
              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.08] flex justify-between">
                <div className="w-24 h-3 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                <div className="w-20 h-3 rounded bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Projects Skeleton */}
        <div className="space-y-8">
          <div className="w-64 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-80 rounded-3xl glass-liquid p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-28 h-4 rounded bg-blue-500/20" />
              <div className="w-72 h-8 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-full max-w-lg h-4 rounded bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
            <div className="flex gap-3">
              <div className="w-24 h-6 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
              <div className="w-24 h-6 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
            </div>
          </div>
        </div>

        {/* Gears Grid Skeleton */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="w-56 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-48 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-3xl glass-liquid p-6 flex flex-col justify-between"
              >
                <div className="w-full h-40 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-shimmer" />
                <div className="space-y-2 pt-3">
                  <div className="w-3/4 h-5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-1/2 h-3 rounded bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
