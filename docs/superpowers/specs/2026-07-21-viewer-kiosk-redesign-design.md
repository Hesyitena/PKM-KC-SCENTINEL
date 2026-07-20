# Viewer Kiosk UI Redesign

## Context

`ViewerMonitoringPage` (`frontend/components/viewer/ViewerMonitoringPage.tsx`) is the full-screen kiosk view for the VIEWER role at `/monitor`. It currently works (header, hero verdict card, 6 sensor stat-tiles) but reads as generic/plain rather than premium.

Chart was removed from this page in a prior change (viewer only sees verdict + sensor tiles now; ADMIN keeps the chart on the main dashboard).

## Goal

Restyle the page to feel clean/minimal/premium — generous whitespace, refined typography scale, quiet color usage — without changing the underlying data, layout structure, or component responsibilities.

## Non-goals

- No change to data flow, SSE logic, auth guards, or the `(viewer)` layout wrapper.
- No change to which information is shown (same fields: prediction, confidence, timestamp, is_syncing, 6 sensor values).
- No layout restructuring — header / hero verdict / sensor tiles stay as three stacked vertical bands.

## Design

### Overall
- Consistent 24px corner radius on all cards (header stays radius-less as a bar).
- One consistent soft elevation (single box-shadow recipe) reused across header, hero card, and tiles — remove the varying multi-layer colored glows.
- Increase gap between the three vertical bands for more breathing room.
- Background wash driven by verdict status (green/red tint) but reduced saturation/lightness so it reads as a quiet tint rather than a colorful gradient.

### Header
- Remove the vertical divider between the Scentinel and PENS logo lockups; replace with spacing.
- Live indicator becomes a smaller, quieter dot + label (de-emphasized relative to the hero card).
- Clock typography brought into the same weight/tracking scale as the rest of the header text.

### Hero verdict card
- Remains the focal point. `SentinelRing` icon animation simplified: fewer rings, thinner strokes, softer opacity.
- The "Hasil Deteksi Edge AI" and "SD SYNC" badges collapse into a single quiet status row instead of two competing colored pills.
- Confidence becomes a simple inline chip next to the timestamp rather than its own bordered pill.
- Verdict text stays giant (`clamp(56px, 8vw, 128px)`, `var(--font-grotesk)`).

### Sensor tiles
- Keep the current 6-tile stat layout (2/3-column grid, full-height stretch, icon + label + value) introduced in the prior change.
- Icon circle: consistent soft tint style across all 6, matching one shared visual recipe (no per-sensor variation beyond color).
- Single thin border + the shared soft shadow recipe (no per-tile shadow variation).

### Color
- Brand purple `#533afd` restricted to exactly one accent point: the device/Edge AI icon in the hero's status row.
- Verdict green (`#10b981` family) / red (`#ea2261` family) remains the only other color signal, driving background tint, icon ring, and confidence chip.
- Everything else (text, borders, labels) stays neutral gray/white per existing Tailwind `muted-foreground` / `border` tokens.

### Typography
- No font family changes: `var(--font-grotesk)` (verdict headline), Plus Jakarta Sans (UI text), `var(--font-mono)` (numeric sensor values) all stay.
- Refine size/weight scale for hierarchy consistency (header labels, tile labels, hero sub-text) rather than introducing new type styles.

## Testing / Verification

- `npm run type-check` and `npm run lint` must stay clean after the restyle (no new TS errors, no new lint errors beyond the pre-existing font warning).
- Manual check in browser at `http://localhost:8081/monitor` after `make rebuild`: verify both LAYAK (green) and TIDAK LAYAK (red) states render correctly (can force by checking a reading in either state, or waiting for a state flip).
- No change expected to `frontend/components/dashboard/*` (admin dashboard) — this redesign is scoped to `ViewerMonitoringPage.tsx` only.
