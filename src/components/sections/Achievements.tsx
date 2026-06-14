"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";

import { ACHIEVEMENTS } from "@/lib/constants";
import { catalog } from "@/lib/media-catalog";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Numbered badges "01"–"05"
const BADGE = (n: number) => String(n + 1).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* 3-D tilt card (desktop only)                                        */
/* ------------------------------------------------------------------ */

interface CardProps {
  index: number;
  text: string;
  tilt: boolean;
  reduced: boolean;
}

function AchievementCard({ index, text, tilt, reduced }: CardProps) {
  const cardRef = useRef<HTMLLIElement>(null);
  const [hovered, setHovered] = useState(false);

  // Raw motion values for pointer position within the card (-0.5 … 0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Spring-smoothed versions
  const springX = useSpring(rawX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 24 });

  // Map to degrees; desktop-only (disabled when `tilt` is false)
  const rotateY = useTransform(springX, [-0.5, 0.5], tilt ? [-10, 10] : [0, 0]);
  const rotateX = useTransform(springY, [-0.5, 0.5], tilt ? [7, -7] : [0, 0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  };

  const bg = catalog.achievements.images[index % catalog.achievements.images.length];

  // `perspective` on the wrapper, `rotateX/Y` on the card itself
  const tiltStyle: MotionStyle = tilt
    ? { rotateX, rotateY, transformPerspective: 900 }
    : {};

  return (
    <motion.li
      ref={cardRef}
      // Scroll-reveal
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.75,
        delay: reduced ? 0 : 0.08 * index,
        ease: EASE_OUT,
      }}
      // Hover lift
      whileHover={
        reduced
          ? {}
          : {
              y: -8,
              scale: 1.025,
              transition: { duration: 0.3, ease: EASE_OUT },
            }
      }
      whileTap={reduced ? {} : { scale: 0.98 }}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      // Layout: first card spans full width on lg (featured)
      className={[
        "group relative isolate flex min-h-[11rem] cursor-default flex-col justify-end overflow-hidden rounded-2xl p-6 sm:p-7",
        "glass",
        // First card wider on lg grid
        index === 0 ? "lg:col-span-2" : "",
        // Hover glow border
        "transition-[border-color,box-shadow] duration-300 ease-out",
        hovered && !reduced
          ? "border-lebanon-red/60 shadow-[0_0_28px_2px_color-mix(in_srgb,var(--color-lebanon-red)_28%,transparent)]"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      // 44px+ tap target is met by min-h-[11rem]
      aria-label={text}
    >
      {/* Faint background image — decorative */}
      <img
        src={bg.src}
        srcSet={bg.srcSet}
        sizes="(min-width: 1024px) 45vw, (min-width: 768px) 48vw, 90vw"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.13] transition-opacity duration-500 group-hover:opacity-[0.22]"
      />

      {/* Gradient scrim so text stays legible over background image */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--color-ink) 35%, transparent) 0%, color-mix(in srgb, var(--color-ink) 75%, transparent) 100%)",
        }}
      />

      {/* Numbered badge */}
      <span
        aria-hidden
        className="mb-4 block font-display text-3xl font-bold leading-none text-lebanon-red/70 sm:text-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {BADGE(index)}
      </span>

      {/* Achievement text */}
      <p className="relative z-10 text-base font-medium leading-snug text-snow sm:text-lg">
        {text}
      </p>

      {/* Subtle corner accent line */}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-lebanon-red to-transparent transition-[width] duration-500 ease-out group-hover:w-full"
      />
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Moving glow blob (atmospheric, pointer-events-none)                 */
/* ------------------------------------------------------------------ */

function GlowOrb({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--color-lebanon-red) 8%, transparent) 0%, transparent 70%)",
      }}
      animate={{
        x: ["-10%", "10%", "-8%", "10%", "-10%"],
        y: ["-5%", "8%", "-8%", "5%", "-5%"],
        scale: [1, 1.12, 0.95, 1.08, 1],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Section root                                                        */
/* ------------------------------------------------------------------ */

export default function Achievements() {
  const { reduced, isMobile } = useMotionPrefs();

  // 3D tilt only when NOT mobile and NOT reduced
  const enableTilt = !isMobile && !reduced;

  return (
    <section
      id="achievements"
      className="relative isolate w-full overflow-hidden bg-ink py-24 text-snow sm:py-32"
    >
      {/* Atmospheric background gradient */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 60% at 70% 100%, color-mix(in srgb, var(--color-lebanon-green) 7%, transparent) 0%, transparent 50%), radial-gradient(100% 50% at 20% 0%, color-mix(in srgb, var(--color-lebanon-red) 9%, transparent) 0%, transparent 50%), linear-gradient(180deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 92%, #060d18) 100%)",
        }}
      />

      {/* Animated ambient glow blob */}
      <GlowOrb reduced={reduced} />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-8">
        {/* Heading */}
        <motion.h2
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="font-display uppercase leading-[0.95] tracking-tight text-snow"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
          }}
        >
          Milestones &amp; Achievements
        </motion.h2>

        {/* Sub-label */}
        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.12, ease: EASE_OUT }}
          className="mt-4 max-w-xl text-base text-snow/55 sm:text-lg"
        >
          A journey built on firsts — for Lebanon, and for the record books.
        </motion.p>

        {/* Achievement cards grid */}
        <ul
          className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 sm:mt-14"
          role="list"
          aria-label="Achievements"
        >
          {ACHIEVEMENTS.map((text, i) => (
            <AchievementCard
              key={i}
              index={i}
              text={text}
              tilt={enableTilt}
              reduced={reduced}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
