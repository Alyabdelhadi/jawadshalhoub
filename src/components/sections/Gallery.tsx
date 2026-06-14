"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* Expedition photos not used elsewhere on the page. 1280 variant is native
   width for these phone photos. */
const GALLERY_IDS = [
  "image00008", "image00006", "image00009", "image00004", "image00007",
  "image00014", "image00018", "image00019", "image00020", "image00021",
  "image00023", "image00024", "image00026", "image00028", "image00002",
  "image00001", "image00003", "image00016",
];

const PHOTOS = GALLERY_IDS.map((id) => ({
  src: `/media/img/${id}-1280.webp`,
  alt: "Jawad Shalhoub on an expedition",
}));

export default function Gallery() {
  const { reduced } = useMotionPrefs();
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: number) =>
      setActive((i) =>
        i === null ? i : (i + dir + PHOTOS.length) % PHOTOS.length
      ),
    []
  );

  // Keyboard controls + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close, step]);

  return (
    <section
      id="gallery"
      className="relative isolate w-full overflow-hidden bg-ink py-24 text-snow sm:py-32"
    >
      {/* Atmospheric background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 50% at 50% 0%, color-mix(in srgb, var(--color-lebanon-green) 12%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-lebanon-red">
            The Journey In Frames
          </p>
          <h2
            className="font-display uppercase leading-[0.95] tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
            }}
          >
            Expedition Gallery
          </h2>
        </motion.div>

        {/* Masonry columns */}
        <div className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          {PHOTOS.map((photo, i) => (
            <motion.button
              key={photo.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Open photo ${i + 1} of ${PHOTOS.length}`}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: reduced ? 0 : (i % 4) * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group mb-3 block w-full overflow-hidden rounded-xl border border-snow/10 sm:mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lebanon-red focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full object-cover transition-all duration-500 ease-out will-change-transform group-hover:scale-[1.04] group-hover:brightness-110"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm sm:p-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full text-snow/80 transition hover:bg-snow/10 hover:text-snow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-snow"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-snow/80 transition hover:bg-snow/10 hover:text-snow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-snow sm:left-6"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <img
            src={PHOTOS[active].src}
            alt={PHOTOS[active].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-lg object-contain shadow-2xl"
          />

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-snow/80 transition hover:bg-snow/10 hover:text-snow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-snow sm:right-6"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-widest text-snow/50">
            {active + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
    </section>
  );
}
