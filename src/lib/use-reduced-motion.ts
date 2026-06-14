"use client";

import { useEffect, useState } from "react";

export type MotionPrefs = {
  reduced: boolean;
  isMobile: boolean;
  lowPower: boolean;
};

const MOBILE_BREAKPOINT = 768;

/**
 * SSR-safe motion-preference hook. All flags default to `false` until the
 * component has mounted on the client, so server and first client render match
 * and we avoid hydration mismatches.
 */
export function useMotionPrefs(): MotionPrefs {
  const [prefs, setPrefs] = useState<MotionPrefs>({
    reduced: false,
    isMobile: false,
    lowPower: false,
  });

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const compute = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const cores = navigator.hardwareConcurrency ?? 8;
      setPrefs({
        reduced: reduceQuery.matches,
        isMobile,
        lowPower: cores <= 4 || isMobile,
      });
    };

    compute();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(compute, 150);
    };

    window.addEventListener("resize", onResize);
    reduceQuery.addEventListener("change", compute);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      reduceQuery.removeEventListener("change", compute);
    };
  }, []);

  return prefs;
}
