"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import Flag from "@/components/fx/Flag";
import LightRays from "@/components/fx/LightRays";
import { QUOTE } from "@/lib/constants";
import { catalog } from "@/lib/media-catalog";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const { video } = catalog.quote;

const EASE_CINEMATIC = [0.16, 1, 0.3, 1] as const;

// Split the quote into words for a dramatic word-by-word reveal.
const QUOTE_WORDS = QUOTE.line1.split(" ");

/* ------------------------------------------------------------------ */
/* Word-by-word animated quote                                         */
/* ------------------------------------------------------------------ */

function AnimatedQuote({ reduced }: { reduced: boolean }) {
  return (
    <motion.span
      className="inline"
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      variants={
        reduced
          ? {}
          : {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.045,
                  delayChildren: 0.1,
                },
              },
            }
      }
      aria-label={QUOTE.line1}
    >
      {QUOTE_WORDS.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em] last:mr-0"
          variants={
            reduced
              ? {}
              : {
                  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.65,
                      ease: EASE_CINEMATIC,
                    },
                  },
                }
          }
          aria-hidden
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Manifesto lines — escalating crescendo reveal                       */
/* ------------------------------------------------------------------ */

interface ManifestoProps {
  reduced: boolean;
}

function Manifesto({ reduced }: ManifestoProps) {
  return (
    <motion.div
      className="mt-10 flex flex-col items-center gap-3 sm:gap-4"
      initial={reduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={
        reduced
          ? {}
          : {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.22,
                  delayChildren: 0.55,
                },
              },
            }
      }
    >
      {QUOTE.manifesto.map((line, i) => {
        const isFlag = line === "For the Lebanese flag.";
        const isLast = i === QUOTE.manifesto.length - 1;

        return (
          <motion.p
            key={i}
            className={[
              "font-display uppercase tracking-[0.12em] leading-tight text-center",
              isFlag
                ? "text-lebanon-red drop-shadow-[0_0_24px_color-mix(in_srgb,var(--color-lebanon-red)_70%,transparent)]"
                : "text-snow",
              isLast
                ? "text-snow/90"
                : "text-snow/75",
            ].join(" ")}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: isLast
                ? "clamp(1.1rem, 3.2vw, 2rem)"
                : isFlag
                ? "clamp(1rem, 2.8vw, 1.75rem)"
                : "clamp(0.95rem, 2.5vw, 1.5rem)",
            }}
            variants={
              reduced
                ? {}
                : {
                    hidden: {
                      opacity: 0,
                      y: 32,
                      scale: 0.96,
                      filter: "blur(8px)",
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.75,
                        ease: EASE_CINEMATIC,
                      },
                    },
                  }
            }
          >
            {isFlag ? (
              <>
                <span className="text-lebanon-red">For the </span>
                <span className="text-snow">Lebanese </span>
                <span className="text-lebanon-green">flag</span>
                <span className="text-snow">.</span>
              </>
            ) : (
              line
            )}
          </motion.p>
        );
      })}

      {/* Flag: revealed alongside the final manifesto line */}
      <motion.div
        className="mt-6 flex justify-center"
        variants={
          reduced
            ? {}
            : {
                hidden: { opacity: 0, scale: 0.85 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.8,
                    delay: 0.12,
                    ease: EASE_CINEMATIC,
                  },
                },
              }
        }
      >
        <Flag size={88} className="drop-shadow-[0_8px_32px_rgba(0,0,0,0.7)]" />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section root                                                        */
/* ------------------------------------------------------------------ */

export default function Quote() {
  const { reduced } = useMotionPrefs();
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Set slow-motion playback once the video is ready to play */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const setSlow = () => {
      el.playbackRate = 0.5;
    };

    // If already ready (readyState >= HAVE_FUTURE_DATA)
    if (el.readyState >= 3) {
      setSlow();
    } else {
      el.addEventListener("canplay", setSlow, { once: true });
    }

    // Defensive play() to unlock autoplay on some browsers
    const tryPlay = () => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();

    return () => {
      el.removeEventListener("canplay", setSlow);
    };
  }, []);

  return (
    <section
      id="quote"
      className="relative isolate flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden"
    >
      {/* ---- Fullscreen slow-motion video background ---- */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={video.poster}
          className="h-full w-full object-cover"
        >
          {/* MP4/H.264 first — hardware-decoded on most devices for smoother
              playback; WebM as a fallback. */}
          <source src={video.mp4} type="video/mp4" />
          <source src={video.webm} type="video/webm" />
        </video>
      </div>

      {/* ---- Cinematic dark scrim — dramatic, layered ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20"
        style={{
          background: [
            // Heavy central blackout so the quote text has full contrast
            "radial-gradient(ellipse 90% 80% at 50% 50%, color-mix(in srgb, var(--color-ink) 55%, transparent) 0%, transparent 100%)",
            // Strong top + bottom fade to ink
            "linear-gradient(180deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 72%, transparent) 12%, transparent 38%, transparent 62%, color-mix(in srgb, var(--color-ink) 72%, transparent) 88%, var(--color-ink) 100%)",
            // Subtle vignette around the edges
            "radial-gradient(ellipse 120% 110% at 50% 50%, transparent 50%, color-mix(in srgb, var(--color-ink) 80%, transparent) 100%)",
          ].join(", "),
        }}
      />

      {/* ---- God rays ---- */}
      <LightRays
        className="-z-10"
        color="rgba(244, 247, 251, 0.4)"
        intensity={0.55}
      />

      {/* ---- Foreground content ---- */}
      <div className="relative z-10 flex w-full flex-col items-center px-6 py-28 sm:px-12 sm:py-32">
        <div className="w-full max-w-3xl">

          {/* Opening quotation mark — decorative */}
          <motion.span
            aria-hidden
            className="block font-display leading-none text-snow/20 select-none"
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(6rem, 18vw, 14rem)",
              lineHeight: 0.75,
              marginBottom: "0.1em",
            }}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.9, ease: EASE_CINEMATIC }}
          >
            &ldquo;
          </motion.span>

          {/* The quote itself */}
          <blockquote className="relative">
            <p
              className="font-display text-snow leading-[1.25] tracking-tight text-center"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.35rem, 4.2vw, 3rem)",
                textShadow: "0 2px 24px rgba(0,0,0,0.9), 0 0 80px rgba(0,0,0,0.6)",
              }}
            >
              <AnimatedQuote reduced={reduced} />
            </p>

            {/* Attribution */}
            <motion.footer
              className="mt-6 text-center"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                duration: 0.7,
                delay: reduced ? 0 : 0.4,
                ease: EASE_CINEMATIC,
              }}
            >
              <cite
                className="not-italic font-mono text-xs uppercase tracking-[0.28em] text-snow/50"
                style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)" }}
              >
                — Jawad Shalhoub
              </cite>
            </motion.footer>
          </blockquote>

          {/* Divider rule — reveals between quote and manifesto */}
          <motion.div
            aria-hidden
            className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-snow/30 to-transparent"
            initial={reduced ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{
              duration: 0.9,
              delay: reduced ? 0 : 0.45,
              ease: EASE_CINEMATIC,
            }}
          />

          {/* Manifesto crescendo */}
          <Manifesto reduced={reduced} />
        </div>
      </div>
    </section>
  );
}
