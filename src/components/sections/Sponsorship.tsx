"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";

import {
  Button,
  FieldError,
  Input,
  Label,
  Select,
  Spinner,
  Textarea,
} from "@/components/ui/Field";
import { SPONSOR } from "@/lib/constants";
import { sponsorSchema, type SponsorInput } from "@/lib/sponsor-schema";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// Honest, qualitative brand-exposure blurbs (no fabricated metrics).
const BENEFITS = [
  {
    title: "Content & Storytelling",
    blurb: "Your brand woven into the expedition's films, photos and field updates.",
  },
  {
    title: "Media Coverage",
    blurb: "Visibility through press and the wider coverage a world-first attracts.",
  },
  {
    title: "Expedition Updates",
    blurb: "Featured in real-time dispatches from base camp to summit.",
  },
  {
    title: "Part Of The Journey",
    blurb: "Recognised as a founding partner in a historic Lebanese adventure.",
  },
] as const;

type FieldErrors = Partial<Record<keyof SponsorInput | "_form", string>>;
type Status = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  type: "",
  message: "",
};

/* ------------------------------------------------------------------ */
/* Benefit cards                                                       */
/* ------------------------------------------------------------------ */

function BenefitCard({
  title,
  blurb,
  index,
  reduced,
}: {
  title: string;
  blurb: string;
  index: number;
  reduced: boolean;
}) {
  return (
    <motion.li
      initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.7,
        delay: reduced ? 0 : 0.08 * index,
        ease: EASE_OUT,
      }}
      className="glass flex flex-col gap-2 rounded-2xl p-5"
    >
      <h3 className="text-base font-semibold tracking-wide text-snow">{title}</h3>
      <p className="text-sm leading-relaxed text-snow/55">{blurb}</p>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Section root                                                        */
/* ------------------------------------------------------------------ */

export default function Sponsorship() {
  const { reduced } = useMotionPrefs();
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const setField =
    (name: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      // Clear a field's error as soon as the user edits it.
      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const parsed = sponsorSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: FieldErrors = {};
      (Object.keys(fieldErrors) as Array<keyof SponsorInput>).forEach((k) => {
        const first = fieldErrors[k]?.[0];
        if (first) next[k] = first;
      });
      setErrors(next);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section
      id="sponsor"
      className="relative isolate w-full overflow-hidden bg-ink py-24 text-snow sm:py-32"
    >
      {/* Atmospheric background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(110% 55% at 15% 0%, color-mix(in srgb, var(--color-lebanon-red) 9%, transparent) 0%, transparent 50%), radial-gradient(120% 60% at 90% 100%, color-mix(in srgb, var(--color-lebanon-green) 7%, transparent) 0%, transparent 50%), linear-gradient(180deg, var(--color-ink) 0%, color-mix(in srgb, var(--color-ink) 94%, #060d18) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-8">
        {/* Heading */}
        <motion.h2
          initial={
            reduced ? { opacity: 1 } : { opacity: 0, y: 40, filter: "blur(8px)" }
          }
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="font-display uppercase leading-[0.95] tracking-tight text-snow"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
          }}
        >
          {SPONSOR.heading}
        </motion.h2>

        {/* Lead line */}
        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.1, ease: EASE_OUT }}
          className="mt-5 max-w-2xl text-lg font-medium text-snow/85 sm:text-xl"
        >
          {SPONSOR.copy}
        </motion.p>

        {/* Body */}
        <motion.p
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: reduced ? 0 : 0.16, ease: EASE_OUT }}
          className="mt-4 max-w-2xl text-base leading-relaxed text-snow/55"
        >
          {SPONSOR.body}
        </motion.p>

        {/* Brand-exposure / media-reach row */}
        <ul
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="What sponsors gain"
        >
          {BENEFITS.map((b, i) => (
            <BenefitCard
              key={b.title}
              index={i}
              title={b.title}
              blurb={b.blurb}
              reduced={reduced}
            />
          ))}
        </ul>

        {/* Form / success card */}
        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-6% 0px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="glass mt-14 rounded-3xl p-6 sm:p-9"
        >
          {status === "success" ? (
            <div className="flex flex-col items-center py-8 text-center" role="status">
              <div
                aria-hidden
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-lebanon-green/15 text-lebanon-green"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h3
                className="font-display text-2xl uppercase tracking-tight text-snow sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Thank You
              </h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-snow/65">
                Your message is on its way. Jawad&apos;s team will be in touch
                soon — thank you for becoming part of the journey.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h3
                className="font-display text-xl uppercase tracking-tight text-snow sm:text-2xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Start The Conversation
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <Label htmlFor={id("name")} required>
                    Name
                  </Label>
                  <Input
                    id={id("name")}
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={setField("name")}
                    aria-required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? errId("name") : undefined}
                  />
                  <FieldError id={errId("name")}>{errors.name}</FieldError>
                </div>

                {/* Company */}
                <div>
                  <Label htmlFor={id("company")}>Company</Label>
                  <Input
                    id={id("company")}
                    name="company"
                    autoComplete="organization"
                    value={values.company}
                    onChange={setField("company")}
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor={id("email")} required>
                    Email
                  </Label>
                  <Input
                    id={id("email")}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={setField("email")}
                    aria-required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? errId("email") : undefined}
                  />
                  <FieldError id={errId("email")}>{errors.email}</FieldError>
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor={id("phone")}>Phone</Label>
                  <Input
                    id={id("phone")}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={setField("phone")}
                  />
                </div>

                {/* Type */}
                <div className="sm:col-span-2">
                  <Label htmlFor={id("type")} required>
                    Sponsorship Type
                  </Label>
                  <Select
                    id={id("type")}
                    name="type"
                    value={values.type}
                    onChange={setField("type")}
                    aria-required
                    aria-invalid={Boolean(errors.type)}
                    aria-describedby={errors.type ? errId("type") : undefined}
                  >
                    <option value="" disabled>
                      Select a type…
                    </option>
                    {SPONSOR.types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                  <FieldError id={errId("type")}>{errors.type}</FieldError>
                </div>

                {/* Message */}
                <div className="sm:col-span-2">
                  <Label htmlFor={id("message")} required>
                    Message
                  </Label>
                  <Textarea
                    id={id("message")}
                    name="message"
                    rows={4}
                    placeholder="Tell us how you'd like to support the expedition."
                    value={values.message}
                    onChange={setField("message")}
                    aria-required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? errId("message") : undefined}
                  />
                  <FieldError id={errId("message")}>{errors.message}</FieldError>
                </div>
              </div>

              {/* Submit row */}
              <div className="mt-7 sm:max-w-xs">
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <Spinner />
                      <span>Sending…</span>
                    </>
                  ) : (
                    SPONSOR.cta
                  )}
                </Button>
              </div>

              {/* Live status region for assistive tech + error alert */}
              <div aria-live="polite" className="mt-4">
                {status === "error" && (
                  <p
                    role="alert"
                    className="rounded-xl border border-lebanon-red/50 bg-lebanon-red/10 px-4 py-3 text-sm text-snow"
                  >
                    Something went wrong sending your message. Please try again.
                  </p>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
