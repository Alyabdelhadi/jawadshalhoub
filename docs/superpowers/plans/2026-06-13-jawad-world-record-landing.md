# Jawad Shalhoub World Record Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic, premium, highly-animated, mobile-first single-page Next.js site for adventurer Jawad Shalhoub's world-record attempt, using his real expedition photos/videos.

**Architecture:** Next.js 15 App Router static page composed of 8 lazy-loaded section components. A Node prep script transcodes/optimizes the raw `assests/` media into `public/media/`. Lenis drives smooth scroll; GSAP ScrollTrigger + Framer Motion drive reveals; React Three Fiber renders the globe + particle systems. One route handler backs the sponsorship form. All 3D/particle work degrades gracefully on mobile and under `prefers-reduced-motion`.

**Tech Stack:** Next.js 15, React 19, TypeScript, TailwindCSS, Framer Motion, GSAP/ScrollTrigger, three + @react-three/fiber + @react-three/drei, Lenis, shadcn/ui, zod, sharp (image prep), ffmpeg (video prep), Vitest (unit tests).

---

## File Structure

```
package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs
scripts/prep-media.mjs              # ffmpeg + sharp pipeline, EXIF fix, catalog
src/lib/media-catalog.ts            # typed map of curated media -> sections
src/lib/constants.ts                # copy, milestones, achievements, mountains, counters
src/lib/sponsor-schema.ts           # zod schema shared by form + route
src/lib/use-reduced-motion.ts       # reduced-motion + mobile/perf hook
src/app/layout.tsx                  # fonts, metadata, OG
src/app/page.tsx                    # assembles sections (lazy)
src/app/globals.css                 # tailwind + base cinematic styles
src/app/api/sponsor/route.ts        # POST handler (zod validate, optional Resend)
src/components/providers/SmoothScroll.tsx   # Lenis
src/components/ui/*                  # shadcn primitives (button, input, textarea, select, label)
src/components/fx/Particles.tsx     # R3F GPU particles (fog/snow/dust variants)
src/components/fx/LightRays.tsx     # CSS/SVG god-rays overlay
src/components/fx/MountainSilhouette.tsx
src/components/fx/Flag.tsx          # animated CSS/SVG Lebanese flag
src/components/fx/Globe.tsx         # R3F earth + flight arcs (shared by S2 & S5)
src/components/fx/CountUp.tsx       # animated number counter
src/components/sections/Hero.tsx            # S1
src/components/sections/Challenge.tsx       # S2
src/components/sections/Story.tsx           # S3
src/components/sections/Achievements.tsx    # S4
src/components/sections/WorldRecord.tsx     # S5
src/components/sections/Quote.tsx           # S6
src/components/sections/Sponsorship.tsx     # S7
src/components/sections/Ending.tsx          # S8
scripts/__tests__/catalog.test.ts
src/lib/__tests__/sponsor-schema.test.ts
src/app/api/sponsor/__tests__/route.test.ts
```

---

## Task 1: Scaffold Next.js project + tooling

**Files:** Create `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `vitest.config.ts`.

- [ ] **Step 1: Scaffold app**

Run (non-interactive):
```bash
npx --yes create-next-app@latest . --ts --tailwind --app --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
If the dir-not-empty prompt blocks it, scaffold in `tmp-app/` then move files in, preserving `assests/`, `docs/`, `.git`.

- [ ] **Step 2: Install dependencies**

```bash
npm i three @react-three/fiber @react-three/drei framer-motion gsap lenis zod
npm i -D vitest @types/three sharp
```

- [ ] **Step 3: Configure `next.config.ts`** to allow large static media and set `images.unoptimized` off (use next/image). Add `vitest.config.ts` with node environment for lib/script tests.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: PASS (clean scaffold builds).

- [ ] **Step 5: Commit**
```bash
git add -A && git commit -m "chore: scaffold Next.js 15 app with 3D/animation deps"
```

---

## Task 2: Media prep script (TDD on the catalog logic)

**Files:** Create `scripts/prep-media.mjs`, `src/lib/media-catalog.ts`, `scripts/__tests__/catalog.test.ts`.

The catalog assigns curated media to sections. The pure mapping logic is unit-tested; the ffmpeg/sharp I/O is run manually.

- [ ] **Step 1: Write failing test** for the catalog selector in `scripts/__tests__/catalog.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildCatalog } from "../prep-catalog.mjs";

describe("buildCatalog", () => {
  it("assigns a hero video and never reuses it elsewhere", () => {
    const c = buildCatalog({
      videos: ["IMG_6116", "IMG_2586", "IMG_0303"],
      images: Array.from({ length: 29 }, (_, i) => `image${String(i + 1).padStart(5, "0")}`),
    });
    expect(c.hero.video).toBeTruthy();
    expect(c.quote.video).toBeTruthy();
    expect(c.hero.video).not.toBe(c.quote.video);
    expect(c.achievements.images.length).toBeGreaterThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npx vitest run scripts/__tests__/catalog.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement** `scripts/prep-catalog.mjs` exporting pure `buildCatalog({videos, images})` returning `{hero, challenge, story, achievements, quote, ending}` with deterministic assignment (hero=first video, quote=second, distribute images round-robin, no video reuse).

- [ ] **Step 4: Run test, verify pass.**

- [ ] **Step 5: Implement `scripts/prep-media.mjs`** — install ffmpeg if missing (`winget install --silent --accept-package-agreements --accept-source-agreements Gyan.FFmpeg`), then: for each `assests/*.jpeg` use `sharp().rotate()` (auto-EXIF) → emit `public/media/img/<name>-{640,1280,1920}.webp`; for each `assests/*.mov` run ffmpeg → `public/media/video/<name>.mp4` (H.264, CRF 24, scale ≤1080, `-an`, faststart) and `.webm` (VP9) and a poster `-poster.webp`. Write `src/lib/media-catalog.ts` (typed export) from `buildCatalog`.

- [ ] **Step 6: Run prep + verify outputs**

Run: `node scripts/prep-media.mjs` then `ls public/media/video public/media/img | head`
Expected: mp4/webm/posters + webp variants exist; videos each < ~8MB.

- [ ] **Step 7: Commit** (do NOT commit large binaries if undesired — keep `public/media/` ignored only if user wants; default: commit optimized media).
```bash
git add scripts src/lib/media-catalog.ts public/media && git commit -m "feat: media prep pipeline (ffmpeg+sharp) and curated catalog"
```

---

## Task 3: Constants, reduced-motion hook, smooth scroll provider

**Files:** Create `src/lib/constants.ts`, `src/lib/use-reduced-motion.ts`, `src/components/providers/SmoothScroll.tsx`; modify `src/app/layout.tsx`, `src/app/globals.css`.

- [ ] **Step 1:** `src/lib/constants.ts` — export all copy as typed objects: `HERO` (headline lines, subhead, CTAs), `MOUNTAINS` (Kilimanjaro 5895, Elbrus 5642), `STORY_MILESTONES` (Lebanon→Nepal→EBC→ABC→Record + Nov 2025 / 11 days copy), `ACHIEVEMENTS` (5 items), `RECORD_COUNTERS` (totalElevation=11537, distanceKm, daysRemaining target `2026-09-01`), `QUOTE` (both lines), `SPONSOR` (headline/copy/types), `ENDING`.

- [ ] **Step 2:** `src/lib/use-reduced-motion.ts` — hook returning `{ reduced, isMobile, lowPower }` from `matchMedia('(prefers-reduced-motion: reduce)')`, viewport width, and `navigator.hardwareConcurrency`. SSR-safe (default false until mounted).

- [ ] **Step 3:** `src/components/providers/SmoothScroll.tsx` — `"use client"` Lenis wrapper; disable when `reduced`. Sync Lenis with GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker`.

- [ ] **Step 4:** `layout.tsx` — premium fonts (e.g. `next/font` Inter + a display serif/condensed), full SEO `metadata` + OG image (`public/media/img` hero frame), wrap children in `<SmoothScroll>`. `globals.css` — dark cinematic base, CSS vars for Lebanese red/green, glass utility classes, `prefers-reduced-motion` resets.

- [ ] **Step 5: Verify**

Run: `npm run dev` then load `/`; confirm no console errors, smooth scroll active, reduced-motion disables it.

- [ ] **Step 6: Commit** `git add -A && git commit -m "feat: constants, reduced-motion hook, Lenis smooth scroll"`

---

## Task 4: Shared FX components

**Files:** Create `src/components/fx/{Particles,LightRays,MountainSilhouette,Flag,CountUp,Globe}.tsx`.

- [ ] **Step 1: `CountUp.tsx`** — Framer Motion `useInView` + `animate` count from 0 to value with suffix/format; static value when `reduced`.

- [ ] **Step 2: `LightRays.tsx`** — layered conic/linear-gradient + blur god-rays with slow CSS keyframe drift; pointer-events-none overlay.

- [ ] **Step 3: `MountainSilhouette.tsx`** — multi-layer SVG ridgelines with parallax offset prop.

- [ ] **Step 4: `Flag.tsx`** — CSS/SVG Lebanese flag (red/white/red bands + green cedar) with a waving transform (skew/sine keyframes); reduced-motion → static.

- [ ] **Step 5: `Particles.tsx`** — `"use client"`, R3F `<Points>` GPU particle field with `variant: 'fog'|'snow'|'dust'`, count scaled down on mobile/lowPower, hidden when `reduced`. Lazy-mounted via `next/dynamic({ ssr:false })` by consumers.

- [ ] **Step 6: `Globe.tsx`** — `"use client"`, R3F sphere with earth texture + atmosphere shell + animated great-circle flight arcs between lat/long props (Lebanon, Kilimanjaro, Elbrus); auto-rotate; OrbitControls disabled on mobile; static low-poly fallback when `reduced`/`lowPower`.

- [ ] **Step 7: Verify** each renders in a scratch route without runtime errors (`npm run dev`).

- [ ] **Step 8: Commit** `git add -A && git commit -m "feat: shared cinematic FX (particles, globe, rays, flag, countup)"`

---

## Task 5: Section 1 — Hero

**Files:** Create `src/components/sections/Hero.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1: Implement Hero** — fullscreen `<video autoplay muted loop playsinline>` (mp4+webm+poster from catalog) with slow CSS zoom + mouse-parallax transform; overlay `LightRays` + `Particles fog` + `MountainSilhouette`; gradient scrim; headline lines reveal on mount with Framer stagger; subhead; two CTA buttons (`#sponsor` anchor + "Follow The Journey"). Mobile: poster image fallback if video can't autoplay, reduced particle count.

- [ ] **Step 2: Mount in `page.tsx`** as first section.

- [ ] **Step 3: Verify** at desktop + mobile (devtools 390px): video plays/poster shows, text readable, CTAs reachable, 60fps scroll.

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat: hero section"`

---

## Task 6: Section 2 — The Challenge

**Files:** Create `src/components/sections/Challenge.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — two mountain photo panels (Kilimanjaro/Elbrus) with cursor-tilt (Framer `useMotionValue` rotateX/Y), drifting cloud + snow `Particles`, `CountUp` altimeters (5895m / 5642m). Embed small `Globe` with Africa→Europe arc. Headline. Stacks vertically on mobile, tilt disabled on touch.

- [ ] **Step 2: Mount, verify desktop+mobile, commit** `feat: challenge section`.

---

## Task 7: Section 3 — My Story (GSAP timeline)

**Files:** Create `src/components/sections/Story.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — GSAP ScrollTrigger pinned sequence stepping through 5 milestones (Lebanon→Nepal→EBC→ABC→Record); each milestone: photo rise + copy reveal + `CountUp` (11 days, dates). Nepal route line draws via SVG `stroke-dashoffset`. Mobile: convert pin to a normal stacked vertical reveal (no pin) to avoid jank.

- [ ] **Step 2: Mount, verify scroll on desktop + mobile, commit** `feat: story timeline section`.

---

## Task 8: Section 4 — Achievements

**Files:** Create `src/components/sections/Achievements.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — responsive grid of 5 glass cards; 3D tilt on hover (desktop), glow border, Framer scroll-reveal stagger, subtle parallax bg. Touch: tap elevates, no tilt.

- [ ] **Step 2: Mount, verify, commit** `feat: achievements wall`.

---

## Task 9: Section 5 — World Record (centerpiece globe + HUD)

**Files:** Create `src/components/sections/WorldRecord.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — large `Globe` (Lebanon→Kilimanjaro→Elbrus arcs, atmosphere) as bg; mission-control HUD overlay with `CountUp` cards: Total Elevation (11,537m), Distance Traveled, Days Remaining (computed live from `2026-09-01`). Monospace HUD type, glass panels, scanline/grid accents. Mobile: globe scaled, HUD stacks; `lowPower` → static globe image.

- [ ] **Step 2: Mount, verify desktop+mobile perf, commit** `feat: world record mission-control section`.

---

## Task 10: Section 6 — Quote

**Files:** Create `src/components/sections/Quote.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — fullscreen slow-mo video bg (catalog.quote, slowed via `playbackRate`), dramatic two-stage type reveal (quote → manifesto lines) on scroll, `Flag` animation, `LightRays`, `Particles`. Reduced-motion → instant text, static bg poster.

- [ ] **Step 2: Mount, verify, commit** `feat: quote section`.

---

## Task 11: Section 7 — Sponsorship form (TDD: schema + route)

**Files:** Create `src/lib/sponsor-schema.ts`, `src/app/api/sponsor/route.ts`, `src/components/sections/Sponsorship.tsx`, shadcn ui primitives, `src/lib/__tests__/sponsor-schema.test.ts`, `src/app/api/sponsor/__tests__/route.test.ts`; modify `page.tsx`.

- [ ] **Step 1: Failing test** `src/lib/__tests__/sponsor-schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { sponsorSchema } from "../sponsor-schema";

describe("sponsorSchema", () => {
  it("rejects bad email and empty name", () => {
    expect(sponsorSchema.safeParse({ name:"", email:"x", message:"hi", type:"Financial" }).success).toBe(false);
  });
  it("accepts a valid submission with optional company/phone", () => {
    const r = sponsorSchema.safeParse({ name:"A", email:"a@b.com", message:"Let's talk", type:"Equipment" });
    expect(r.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run, verify fail.** `npx vitest run src/lib/__tests__/sponsor-schema.test.ts`

- [ ] **Step 3: Implement `sponsor-schema.ts`** — zod: name(min1), company(optional), email(email), phone(optional), type(enum: Financial/Equipment/Services/Logistics/Other), message(min1).

- [ ] **Step 4: Run, verify pass.**

- [ ] **Step 5: Failing test** `route.test.ts` — POST invalid body → 400; valid body (no RESEND_API_KEY env) → 200 `{ ok:true }` (logged, not emailed). Import the route's `POST` and call with a `Request`.

- [ ] **Step 6: Run, verify fail.**

- [ ] **Step 7: Implement `api/sponsor/route.ts`** — parse JSON, `sponsorSchema.safeParse`, 400 on error; if `process.env.RESEND_API_KEY` send via Resend to `nader@nascode.com`, else `console.log` + return `{ok:true}`.

- [ ] **Step 8: Run, verify pass.**

- [ ] **Step 9: Add shadcn primitives** (button/input/textarea/select/label) under `src/components/ui/` and build `Sponsorship.tsx` — headline, copy, brand-exposure/reach blurbs (no logo wall), the form wired to `/api/sponsor` with client zod validation, loading + success/error states, `id="sponsor"` anchor. Mobile: single-column form.

- [ ] **Step 10: Verify** full test run `npx vitest run` PASS; submit form in dev shows success.

- [ ] **Step 11: Commit** `feat: sponsorship section with validated form + route handler`.

---

## Task 12: Section 8 — Final ending

**Files:** Create `src/components/sections/Ending.tsx`; modify `page.tsx`.

- [ ] **Step 1: Implement** — summit photo with slow scroll-driven scale pull-back (zoom-out), `Flag` reveal, "The Journey Begins Summer 2026", subhead "Follow The Expedition.", "Support The Mission" CTA → `#sponsor`. Optional muted soundtrack toggle button (off by default; honors reduced-motion/autoplay rules).

- [ ] **Step 2: Mount, verify, commit** `feat: final cinematic ending`.

---

## Task 13: Polish, performance, a11y, lazy-loading pass

**Files:** Modify `page.tsx` (lazy `next/dynamic` for 3D sections), section files, `globals.css`.

- [ ] **Step 1:** Wrap heavy sections (Challenge globe, WorldRecord, Quote, Particles) in `next/dynamic({ ssr:false, loading })`; add IntersectionObserver gating so R3F canvases mount only near viewport.

- [ ] **Step 2:** A11y pass — alt text on all media, form labels, focus-visible rings, color contrast on text-over-media (scrims), `aria-label`s on icon buttons, keyboard-reachable CTAs.

- [ ] **Step 3:** Responsive QA at 390 / 768 / 1280 / 1920; fix any overflow, tap targets ≥44px, disable hover-only interactions on touch.

- [ ] **Step 4: Verify** `npm run build` PASS; run `npx vitest run` PASS; Lighthouse (or manual) check: no layout shift, video lazy, reduced-motion respected.

- [ ] **Step 5: Commit** `feat: performance, lazy-loading and accessibility pass`.

---

## Self-Review Notes (coverage check)

- Spec S1–S8 → Tasks 5–12 (1:1). Cross-cutting (smooth scroll, reduced-motion) → Task 3; FX → Task 4; perf/a11y/lazy → Task 13; media pipeline → Task 2.
- Omitted-by-decision: sponsor logo wall (kept form). Flag = CSS (Task 4 `Flag.tsx`).
- Mobile-friendliness addressed per-section + dedicated Task 13 step 3.
- Type consistency: `buildCatalog` shape (Task 2) consumed by sections; `sponsorSchema` (Task 11) shared by form + route.
