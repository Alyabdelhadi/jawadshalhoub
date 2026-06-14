"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type ParticlesProps = {
  variant?: "fog" | "snow" | "dust";
  className?: string;
  count?: number;
};

type VariantConfig = {
  size: number;
  opacity: number;
  color: string;
  fallSpeed: number; // downward drift (units/sec)
  swaySpeed: number; // lateral wander factor
  swayAmp: number;
};

const VARIANTS: Record<NonNullable<ParticlesProps["variant"]>, VariantConfig> = {
  snow: { size: 0.06, opacity: 0.9, color: "#f4f7fb", fallSpeed: 0.9, swaySpeed: 0.6, swayAmp: 0.25 },
  fog: { size: 0.55, opacity: 0.12, color: "#9fb4c8", fallSpeed: 0.05, swaySpeed: 0.15, swayAmp: 0.4 },
  dust: { size: 0.04, opacity: 0.4, color: "#d8c9a8", fallSpeed: 0.12, swaySpeed: 0.3, swayAmp: 0.3 },
};

const FIELD = 10; // half-extent of the cube the particles live in

/**
 * Generate a randomized particle field. Kept as a module-scope helper (not
 * inline in render) so the one-time `Math.random` seeding is an explicit,
 * side-effecting factory rather than impure work during component render.
 */
function buildParticleField(count: number) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * FIELD * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD * 2;
    phases[i] = Math.random() * Math.PI * 2;
  }
  return { positions, phases };
}

function ParticleField({ variant, count }: { variant: NonNullable<ParticlesProps["variant"]>; count: number }) {
  const cfg = VARIANTS[variant];
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(
    () => buildParticleField(count),
    [count]
  );

  useFrame((_, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;
    const dt = Math.min(delta, 0.05);
    const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = performance.now() / 1000;

    for (let i = 0; i < count; i++) {
      const iy = i * 3 + 1;
      const ix = i * 3;
      arr[iy] -= cfg.fallSpeed * dt;
      arr[ix] += Math.sin(t * cfg.swaySpeed + phases[i]) * cfg.swayAmp * dt;
      // wrap around the field
      if (arr[iy] < -FIELD) arr[iy] = FIELD;
      if (arr[ix] > FIELD) arr[ix] = -FIELD;
      else if (arr[ix] < -FIELD) arr[ix] = FIELD;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={cfg.color}
        size={cfg.size}
        sizeAttenuation
        transparent
        opacity={cfg.opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * GPU particle field (snow / fog / dust). Client-only; returns null under
 * reduced motion. Particle count scales down on mobile / low-power devices.
 */
export default function Particles({ variant = "snow", className = "", count = 800 }: ParticlesProps) {
  const { reduced, isMobile, lowPower } = useMotionPrefs();

  if (reduced) return null;

  const resolved = isMobile || lowPower ? Math.min(count, 200) : count;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        <ParticleField variant={variant} count={resolved} />
      </Canvas>
    </div>
  );
}
