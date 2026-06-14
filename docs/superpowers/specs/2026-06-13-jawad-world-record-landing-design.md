# Jawad Shalhoub — World Record Attempt Landing Page (Design Spec)

**Date:** 2026-06-13
**Goal:** A cinematic, premium, highly-animated single-page site for adventurer/endurance athlete Jawad Shalhoub (age 23). Feel: National Geographic documentary × Red Bull adventure campaign × Apple product launch. Inspire visitors, attract sponsors, build excitement for a world-first two-continent summit record attempt.

## Decisions (locked)

- **3D approach:** Cinematic hybrid. Real Three.js/R3F 3D globe + GPU particles/fog/light rays. Mountains rendered from real expedition photos with parallax depth + 3D tilt + motion (NOT hand-modeled terrain).
- **Video:** Transcode the 5 `.mov` files to web `mp4` + `webm` via ffmpeg (installed via winget) at build/prep time.
- **Sponsor logos:** Omit the logo wall for now. Keep the sponsorship section, copy, brand-exposure blurbs, and contact form. Logo wall added later when logos arrive.
- **Lebanese flag:** Render with CSS/SVG (animated), not a photo.
- **Mobile:** First-class requirement. Mobile-first responsive; reduce 3D/particle complexity on small screens; `prefers-reduced-motion` honored.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Framer Motion · GSAP (ScrollTrigger) · Three.js + React Three Fiber + drei · Lenis smooth scroll · shadcn/ui (form components). Single static page; one Next.js route handler for the sponsorship form.

## Asset Pipeline (prep script, run before/at build)

Source: `assests/` (29 `.jpeg`, 5 `.mov`). Output to `public/media/`.

- **Images:** auto-correct EXIF orientation (several are rotated), resize to responsive widths, output optimized `webp`. Catalog each photo and tag it (Lebanon / Himalaya-ABC / snow-cedars / water / portrait) to assign to sections.
- **Videos:** transcode `.mov` → muted, looping, `mp4` (H.264) + `webm` (VP9), capped ~1080p at web bitrate; generate a poster `webp` per clip.
- **Curation:** strongest expedition clip → Hero background; snow/summit clip → Quote section; remaining photos distributed across Story, Achievements, Final.

## Sections

1. **Hero Intro** — fullscreen video bg with slow zoom + mouse parallax; overlay layers: moving fog, floating particles, dynamic light rays, mountain-silhouette SVG. Scroll-reveal headline "Two Continents. / Two Summits. / One World Record Attempt." Subhead about Jawad (23). CTAs: "Follow The Journey", "Become A Sponsor".
2. **The Challenge** — Kilimanjaro (5,895m) vs Elbrus (5,642m) as parallax photo panels with cursor tilt, snow particles, drifting clouds, count-up altimeters. Mini 3D globe with animated Africa→Europe flight arc. Headline: "The First Person Ever To Attempt This Two-Continent Summit Challenge In Record Time".
3. **My Story** — "From Lebanon To The Himalayas". GSAP scroll-pinned cinematic timeline: Lebanon → Nepal → Everest Base Camp → Annapurna Base Camp → World Record Attempt. Milestone copy: Nov 2025, first Lebanese to complete both EBC + ABC in 11 days. Scroll-triggered mountain rise, Nepal map reveal, achievement counters, animated route.
4. **Achievements** — interactive 3D-tilt glassmorphism card wall (5 cards). Hover elevation + glow, scroll reveal, dynamic bg movement.
5. **World Record Attempt** (centerpiece) — R3F 3D Earth from space with atmosphere; flight arcs Lebanon → Africa (Kilimanjaro) → Europe (Elbrus). Mission-control HUD: live counters for Total Elevation, Distance Traveled, Days Remaining (to Summer 2026). Satellite-style visuals.
6. **Quote** — fullscreen slow-mo summit video. Dramatic type reveal: "I don't climb mountains because they are there. I climb them to discover how far determination can take me." then "For the history books. / For the Lebanese flag. / For a nation that deserves to be proud." Animated CSS Lebanese flag, light rays, particles.
7. **Sponsorship** — "Become A Sponsor" + provided copy + brand-exposure / media-reach blurbs (no logo wall yet). shadcn form: Name, Company, Email, Phone, Sponsorship Type, Message → Next.js route handler (validation; ready to wire Resend via env key; graceful success state until configured).
8. **Final Cinematic Ending** — summit photo with slow camera pull-back, animated CSS flag reveal, "The Journey Begins Summer 2026", subhead "Follow The Expedition.", CTA "Support The Mission". Optional muted soundtrack toggle.

## Cross-cutting Requirements

- Lenis smooth scroll site-wide.
- Mobile-first responsive; 3D/particles downscaled or swapped for lighter motion on small/low-power devices.
- `prefers-reduced-motion`: disable heavy motion, keep content legible.
- Performance: lazy-load 3D scenes, code-split heavy components, optimized media, target 60fps.
- SEO: metadata, Open Graph image, semantic structure.
- Accessibility: labelled form controls, focus states, sufficient contrast, alt text.

## Known Follow-ups (placeholders now)

- Real sponsor logos + logo wall.
- Email provider key (Resend) for live form delivery.
- Optional professional studio photography.
