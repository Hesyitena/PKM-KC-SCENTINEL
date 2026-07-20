# Viewer Kiosk UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `ViewerMonitoringPage` (the VIEWER-role full-screen kiosk view at `/monitor`) to read as clean/minimal/premium — same data, same 3-band layout (header / hero verdict / sensor tiles), no new dependencies.

**Architecture:** Single-file presentational restyle. No data flow, store, hook, or routing changes. Work proceeds top-to-bottom through the file: shared tokens first (additive only, so the file stays green), then header, then hero card (where the now-dead old tokens are finally removed), then sensor tiles, then a full rebuild + manual visual check.

**Tech Stack:** Next.js 15 App Router, TypeScript (strict), Tailwind CSS, inline `style` for dynamic/computed values (existing project convention per `CLAUDE.md`).

## Global Constraints

- Do not change data flow, SSE logic, auth guards, or the `(viewer)` layout wrapper.
- Do not change which information is shown (same fields: prediction, confidence, timestamp, is_syncing, 6 sensor values).
- Do not restructure the layout — header / hero verdict / sensor tiles stay as three stacked vertical bands.
- `npm run type-check` and `npm run lint` must stay clean after **every** task (no new errors; the pre-existing `no-page-custom-font` warning in `app/layout.tsx` is unrelated and expected to remain).
- Brand purple `#533afd` appears in exactly one place in the final result: the Cpu icon in the hero's status row.
- One shared shadow recipe (`SHADOW` constant) is reused by the header, hero card, and every sensor tile — no per-element shadow variation.
- Corner radius is 24px on every card (hero card and sensor tiles) — the header stays radius-less as a flat bar.

---

### Task 1: Shared shadow token + quieter background/border values

**Files:**
- Modify: `frontend/components/viewer/ViewerMonitoringPage.tsx:25-126`

**Interfaces:**
- Consumes: nothing new — `isLayak` (existing local `const`).
- Produces: a module-level `SHADOW` string constant (used by Tasks 2, 3, 4) and updated `predBg` / `predBorder` / `iconShadow` / `pageBg` values on the existing `S` object. `predSub`, `accentSoft`, and `divider` keep their current values and current call sites for now — Task 3 removes them together with the JSX that references them, so the file never sits in a broken intermediate state.

- [ ] **Step 1: Add the module-level `SHADOW` constant**

Insert directly above `export function ViewerMonitoringPage() {` (currently line 27):

```tsx
const SHADOW = "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.06)";

```

- [ ] **Step 2: Update `S.predBg`, `S.predBorder`, `S.iconShadow`, `S.pageBg` values**

In the existing `S` object (currently lines 101–126), change only these four fields' values — leave `predText`, `predSub`, `accent`, `accentSoft`, `shadow`, `iconGrad`, `divider` exactly as they are for now:

```tsx
    predBg: isLayak
      ? "linear-gradient(160deg, #f3fdf9 0%, #fafcfb 60%)"
      : "linear-gradient(160deg, #fef4f4 0%, #fbfafa 60%)",
    predBorder: isLayak ? "#d8f3e6" : "#f8dde1",
```

and:

```tsx
    iconShadow: isLayak
      ? "0 8px 24px rgba(16,185,129,0.30)"
      : "0 8px 24px rgba(234,34,97,0.28)",
```

and:

```tsx
    // Full page background — quiet status tint, not a loud gradient
    pageBg: isLayak
      ? "linear-gradient(160deg, #f6fdfa 0%, #fafbfc 100%)"
      : "linear-gradient(160deg, #fdf7f7 0%, #fafbfc 100%)",
```

- [ ] **Step 3: Verify — type-check and lint**

Run: `cd frontend && npm run type-check && npm run lint`
Expected: no errors (nothing was removed yet, only values changed and one new constant added — the build must be exactly as green as before this task).

- [ ] **Step 4: Commit**

```bash
git add frontend/components/viewer/ViewerMonitoringPage.tsx
git commit -m "refactor(viewer): quieter status gradients + shared shadow token"
```

---

### Task 2: Header restyle

**Files:**
- Modify: `frontend/components/viewer/ViewerMonitoringPage.tsx` (import list, and the `<header>` block)

**Interfaces:**
- Consumes: `SHADOW` from Task 1, `time` (existing local state), `logout` (existing, from `useAuth()`).
- Produces: restyled `<header>` JSX consumed visually only (no other task reads header internals).

- [ ] **Step 1: Drop the unused `Wifi` import**

The quiet live indicator (below) no longer uses an icon, so `Wifi` becomes unused. Replace:

```tsx
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Cpu,
  Wifi,
  LogOut,
} from "lucide-react";
```

with:

```tsx
import {
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  Cpu,
  LogOut,
} from "lucide-react";
```

- [ ] **Step 2: Replace the `<header>` block**

Replace the entire `<header id="viewer-header" ...> ... </header>` block with:

```tsx
      <header
        id="viewer-header"
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: SHADOW,
        }}
      >
        <div className="flex items-center gap-8">
          {/* Scentinel Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              <Image
                src="/logo-scentinel.png"
                alt="SCENTINEL Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", letterSpacing: "-0.2px" }}>
                SCENTINEL
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.05em" }}>
                Live Food Quality Monitor
              </p>
            </div>
          </div>

          {/* PENS Logo */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              <Image
                src="/Logo_PENS.png"
                alt="PENS Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#0f172a", lineHeight: "1.3" }}>
                Politeknik Elektronika<br />Negeri Surabaya
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Real-time Clock */}
          {time && (
            <div className="hidden md:flex flex-col items-end mr-1 text-right">
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#334155", letterSpacing: "-0.1px" }}>
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p style={{ fontSize: "10px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.04em", marginTop: "2px" }}>
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(/\./g, ":")} WIB
              </p>
            </div>
          )}

          {/* Live indicator — quiet, hero card carries the main energy */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
            />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em" }}>
              LIVE
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200"
            title="Keluar"
          >
            <LogOut size={14} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Keluar</span>
          </button>
        </div>
      </header>
```

- [ ] **Step 3: Verify — type-check and lint**

Run: `cd frontend && npm run type-check && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/viewer/ViewerMonitoringPage.tsx
git commit -m "refactor(viewer): quiet header — drop divider/live-pill, align type scale"
```

---

### Task 3: Hero verdict card restyle (and retire the now-dead tokens)

**Files:**
- Modify: `frontend/components/viewer/ViewerMonitoringPage.tsx` (the `S` object's remaining fields, the hero `<div>` block inside `{/* Main content */}`, and the `SentinelRing` function)

**Interfaces:**
- Consumes: `SHADOW`, `S.predBg`/`S.predBorder`/`S.predText`/`S.accent`/`S.iconGrad`/`S.iconShadow` from Task 1; `isLayak`, `latestReading` (existing).
- Produces: restyled hero JSX + simplified `SentinelRing`, and a trimmed `S` object (`predSub`, `accentSoft`, `divider` removed — this task is the only place that referenced them, so removing the fields and their last usages happens in the same commit). No other task depends on this section's internals.

- [ ] **Step 1: Remove the now-unused `S` fields**

In the `S` object, delete the `predSub`, `accentSoft`, and `divider` lines entirely (they're only read by the old badge/confidence-pill markup being replaced in Step 2 below):

```tsx
    predSub: isLayak ? "#047857" : "#be123c",
```
```tsx
    accentSoft: isLayak ? "rgba(16,185,129,0.10)" : "rgba(234,34,97,0.09)",
```
```tsx
    divider: isLayak ? "rgba(16,185,129,0.20)" : "rgba(234,34,97,0.18)",
```

Delete all three lines.

- [ ] **Step 2: Replace the hero card block**

Replace the block starting at `{/* ── Hero: verdict is the thesis of this screen ── */}` through its closing `</div>` (immediately before the data-tape comment) with:

```tsx
        {/* ── Hero: verdict is the thesis of this screen ── */}
        <div
          key={latestReading.prediction}
          className="flex-shrink-0 relative overflow-hidden animate-fade-in-scale"
          style={{
            background: S.predBg,
            border: `1px solid ${S.predBorder}`,
            borderRadius: "24px",
            boxShadow: SHADOW,
          }}
        >
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-8 py-10 lg:py-14">
            <SentinelRing isLayak={isLayak} accent={S.accent} iconGrad={S.iconGrad} iconShadow={S.iconShadow} />

            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Status row — one quiet line, not two competing badges */}
              <div className="flex items-center gap-1.5 mb-4" style={{ color: "#94a3b8" }}>
                <Cpu size={12} color="#533afd" />
                <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Hasil Deteksi Edge AI
                </span>
                {latestReading.is_syncing && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      SD Sync
                    </span>
                  </>
                )}
              </div>

              {/* Giant verdict — readable from across the room */}
              <p
                style={{
                  fontFamily: "var(--font-grotesk)",
                  fontSize: "clamp(56px, 8vw, 128px)",
                  fontWeight: 700,
                  letterSpacing: "-4px",
                  lineHeight: 0.95,
                  color: S.predText,
                }}
              >
                {latestReading.prediction}
              </p>

              {/* Confidence + timestamp — one quiet line */}
              <div className="flex items-center gap-2 mt-6" style={{ fontSize: "12px", color: "#94a3b8" }}>
                <span>
                  Diperbarui{" "}
                  <span style={{ fontWeight: 600, color: "#334155", fontFamily: "var(--font-mono)" }}>
                    {new Date(latestReading.timestamp).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </span>
                {latestReading.confidence !== undefined && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ fontWeight: 600, color: S.predText }}>
                      {(latestReading.confidence * 100).toFixed(1)}% keyakinan
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
```

- [ ] **Step 3: Simplify `SentinelRing`**

Replace the whole `SentinelRing` function with:

```tsx
function SentinelRing({
  isLayak,
  accent,
  iconGrad,
  iconShadow,
}: {
  isLayak: boolean;
  accent: string;
  iconGrad: string;
  iconShadow: string;
}) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 160, height: 160 }}>
      <div className="absolute inset-0 rounded-full animate-breathe" style={{ border: `1px solid ${accent}`, opacity: 0.16 }} />
      <div className="absolute inset-8 rounded-full animate-breathe delay-300" style={{ border: `1px solid ${accent}`, opacity: 0.26 }} />
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{ width: 104, height: 104, background: iconGrad, boxShadow: iconShadow }}
      >
        {isLayak
          ? <ShieldCheck size={46} color="#fff" strokeWidth={1.5} />
          : <ShieldX size={46} color="#fff" strokeWidth={1.5} />
        }
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify — type-check and lint**

Run: `cd frontend && npm run type-check && npm run lint`
Expected: no errors. Also grep-confirm the dead fields are fully gone:

Run: `grep -n "predSub\|accentSoft\|S\.divider" frontend/components/viewer/ViewerMonitoringPage.tsx`
Expected: no output (empty).

- [ ] **Step 5: Commit**

```bash
git add frontend/components/viewer/ViewerMonitoringPage.tsx
git commit -m "refactor(viewer): quiet hero card — merge status badges, thinner sentinel rings"
```

---

### Task 4: Sensor tile radius/shadow unification + full verification

**Files:**
- Modify: `frontend/components/viewer/ViewerMonitoringPage.tsx` (the `DataChip` function's outer `<div>` className + style)

**Interfaces:**
- Consumes: `SHADOW` from Task 1.
- Produces: final visual state of the page — this is the last task, verified end-to-end via Docker rebuild + browser check.

- [ ] **Step 1: Bump tile radius to 24px and swap in the shared `SHADOW` token**

`rounded-2xl` is Tailwind's 16px radius; the hero card uses an explicit 24px. Bump the tile to match (`rounded-3xl` = Tailwind's 24px) and reuse `SHADOW` instead of the tile's own one-off shadow value. In the `DataChip` function, replace:

```tsx
      className="flex flex-col items-center justify-center gap-3 rounded-2xl h-full"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid #e8edf3",
        boxShadow: "0 1px 4px rgba(0,55,112,0.05)",
      }}
```

with:

```tsx
      className="flex flex-col items-center justify-center gap-3 rounded-3xl h-full"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid #e8edf3",
        boxShadow: SHADOW,
      }}
```

- [ ] **Step 2: Verify — type-check and lint**

Run: `cd frontend && npm run type-check && npm run lint`
Expected: no errors.

- [ ] **Step 3: Rebuild and start the stack**

Run: `make rebuild`
Expected: ends with the `🚀 SCENTINEL DOCKER SERVICES REBUILT & STARTED SUCCESSFULLY!` banner, all four containers (`scentinel-db`, `scentinel-backend`, `scentinel-frontend`, `scentinel-nginx`) reported as created/started.

- [ ] **Step 4: Manual visual check — both verdict states**

Open `http://localhost:8081/monitor` (hard refresh / disable-cache reload) logged in as a VIEWER user. Confirm:
- Header: no vertical divider between the two logo lockups, LIVE indicator is a small quiet dot + label (no pill background), logout button still works.
- Hero card: single quiet status line under the ring (not two colored badges), verdict word still giant and legible from a distance, one quiet "Diperbarui HH:MM:SS · NN.N% keyakinan" line.
- Sensor tiles: all 6 tiles have matching 24px-radius corners and the same soft shadow as the hero card, and stretch to fill the remaining screen height.
- If the current `latestReading.prediction` is `LAYAK`, also check the `TIDAK LAYAK` variant by looking at a historical reading (`docker exec scentinel-db psql -U scentinel -d scentinel_db -c "SELECT id, prediction FROM sensor_readings WHERE prediction = 'TIDAK LAYAK' ORDER BY id DESC LIMIT 1;"`) or waiting for a live state flip — confirm the red variant renders with the same layout, just the swapped color tokens.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/viewer/ViewerMonitoringPage.tsx
git commit -m "refactor(viewer): unify sensor tile radius/shadow with shared tokens"
```
