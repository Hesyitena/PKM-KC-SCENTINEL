"use client";

// SCENTINEL - Dashboard Skeleton Loading Component
// Shown while waiting for the first SSE reading to arrive

export function DashboardSkeleton() {
  return (
    <div id="dashboard-skeleton" className="flex flex-col gap-3 h-full min-h-0 animate-fade-in">

      {/* ── Status Card Skeleton ── */}
      <div
        className="flex-shrink-0 flex overflow-hidden"
        style={{
          background: "#ffffff",
          border: "1px solid #e3e8ee",
          borderRadius: "12px",
          boxShadow: "rgba(0,55,112,0.06) 0 1px 3px",
        }}
      >
        {/* Zone 1 */}
        <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ borderRight: "1px solid #e3e8ee", minWidth: 220 }}>
          <div className="skeleton w-12 h-12 rounded-xl" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-7 w-24 rounded" />
          </div>
        </div>
        {/* Zone 2 */}
        <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0" style={{ borderRight: "1px solid #e3e8ee" }}>
          <div className="skeleton w-[88px] h-[88px] rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="skeleton h-3 w-12 rounded" />
            <div className="skeleton h-6 w-16 rounded" />
          </div>
        </div>
        {/* Zone 3 */}
        <div className="flex flex-col justify-center px-6 py-4 flex-1" style={{ borderRight: "1px solid #e3e8ee" }}>
          <div className="skeleton h-3 w-28 rounded mb-2" />
          <div className="skeleton h-5 w-40 rounded mb-1" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        {/* Zone 4 */}
        <div className="flex flex-col justify-center px-6 py-4 flex-shrink-0">
          <div className="skeleton h-3 w-16 rounded mb-2" />
          <div className="skeleton h-4 w-28 rounded mb-2" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>

      {/* ── Sensor Cards Skeleton ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 flex-shrink-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              background: "#ffffff",
              border: "1px solid #e3e8ee",
              borderRadius: "12px",
              padding: "12px 14px",
              boxShadow: "rgba(0,55,112,0.06) 0 1px 3px",
              animationDelay: `${i * 40}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="skeleton h-2.5 w-16 rounded" />
              <div className="skeleton w-6 h-6 rounded" />
            </div>
            <div className="skeleton h-6 w-14 rounded mb-3" />
            <div className="skeleton h-[3px] w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* ── Chart Skeleton ── */}
      <div
        className="rounded-xl border overflow-hidden flex flex-col flex-1 min-h-0"
        style={{
          background: "#ffffff",
          borderColor: "#e3e8ee",
          boxShadow: "rgba(0,55,112,0.06) 0 1px 3px, rgba(0,55,112,0.04) 0 4px 16px",
          borderRadius: "12px",
        }}
      >
        {/* Chart header skeleton */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #e3e8ee" }}
        >
          <div className="flex items-center gap-3">
            <div className="skeleton w-7 h-7 rounded-lg" />
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-3.5 w-32 rounded" />
              <div className="skeleton h-2.5 w-24 rounded" />
            </div>
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        {/* Chart body skeleton */}
        <div className="px-3 py-2 flex-1 min-h-0 flex items-end gap-1 pb-6">
          {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="skeleton flex-1 rounded-t"
            style={{ height: `${30 + Math.sin(i * 0.7) * 18 + Math.cos(i * 1.3) * 12}%` }}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
