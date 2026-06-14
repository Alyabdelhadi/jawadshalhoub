"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type InViewProps = {
  children: ReactNode;
  /** Rendered while the children are NOT mounted (e.g. a poster). Default: nothing. */
  fallback?: ReactNode;
  /**
   * How far outside the viewport (in CSS px) the element can be before it is
   * considered "near". Larger values mount the children earlier. Default 200px.
   */
  rootMargin?: string;
  /**
   * When true the children stay mounted once they have been seen — use this
   * where unmount/remount would cause a visible flicker. Default false, which
   * unmounts the children once they scroll far enough away to free resources
   * (e.g. concurrent WebGL contexts).
   */
  once?: boolean;
  className?: string;
};

/**
 * Viewport-gated wrapper. Renders `children` only while the wrapper is within
 * `rootMargin` of the viewport, otherwise renders `fallback` (or nothing). This
 * lets heavy, client-only subtrees (R3F <Canvas> instances) mount lazily and —
 * unless `once` — unmount when far away, capping the number of simultaneous
 * WebGL contexts on a long scrolling page.
 *
 * SSR-safe: on the server / first client render `visible` is false, so the
 * fallback is shown and no observer-dependent content is rendered.
 */
export default function InView({
  children,
  fallback = null,
  rootMargin = "200px",
  once = false,
  className,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guard for environments without IntersectionObserver — show children.
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : fallback}
    </div>
  );
}
