"use client";

import * as React from "react";

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/* Shared field-surface styling: glass input on the dark theme, with a
   Lebanon-red focus ring and a red aria-invalid state. */
const fieldBase = cn(
  "w-full min-h-[3rem] rounded-xl px-4 py-3 text-base text-snow",
  "glass placeholder:text-snow/35",
  "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
  "outline-none",
  "focus-visible:border-lebanon-red/70",
  "focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-lebanon-red)_28%,transparent)]",
  "aria-[invalid=true]:border-lebanon-red/80",
  "aria-[invalid=true]:shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-lebanon-red)_22%,transparent)]",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium tracking-wide text-snow/80"
    >
      {children}
      {required && (
        <span className="ml-1 text-lebanon-red" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(fieldBase, className)} {...props} />;
});

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, "min-h-[7.5rem] resize-y leading-relaxed", className)}
      {...props}
    />
  );
});

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          fieldBase,
          "appearance-none bg-[var(--color-ink)] pr-10",
          // glass uses a translucent ink already; keep options legible
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/* Chevron */}
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-snow/50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 7.5 10 12.5 15 7.5" />
      </svg>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Field error                                                         */
/* ------------------------------------------------------------------ */

export function FieldError({
  id,
  children,
}: {
  id: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-lebanon-red">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex min-h-[3rem] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl px-7 py-3.5",
        "bg-lebanon-red font-semibold tracking-wide text-snow",
        "transition-[transform,box-shadow,background-color] duration-200 ease-out",
        "hover:bg-[color-mix(in_srgb,var(--color-lebanon-red)_88%,#fff)]",
        "hover:shadow-[0_10px_30px_-8px_color-mix(in_srgb,var(--color-lebanon-red)_70%,transparent)]",
        "active:scale-[0.985]",
        "outline-none focus-visible:ring-2 focus-visible:ring-snow/80 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        "disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-lebanon-red disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

/* ------------------------------------------------------------------ */
/* Spinner                                                             */
/* ------------------------------------------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("h-5 w-5 animate-spin", className)}
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}
