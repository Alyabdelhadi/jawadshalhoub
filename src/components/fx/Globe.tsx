"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useMotionPrefs } from "@/lib/use-reduced-motion";

export type LatLng = [number, number]; // [latitude, longitude] in degrees

export type GlobeProps = {
  className?: string;
  arcs?: Array<{ from: LatLng; to: LatLng }>;
  markers?: LatLng[];
  /** Index into `markers` to highlight as the journey's origin (pulsing). */
  originIndex?: number;
  autoRotate?: boolean;
};

const RADIUS = 1.6;

/** Convert [lat, lng] degrees to a 3D point on a sphere of given radius. */
function latLngToVec3(lat: number, lng: number, radius = RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/** Build a curved great-circle-ish arc lifted above the surface. */
function buildArcPoints(from: LatLng, to: LatLng): THREE.Vector3[] {
  const start = latLngToVec3(from[0], from[1]);
  const end = latLngToVec3(to[0], to[1]);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  // Lift the midpoint outward proportionally to the chord length.
  mid.normalize().multiplyScalar(RADIUS + dist * 0.45);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(48);
}

function Marker({
  position,
  origin = false,
  animate = false,
}: {
  position: THREE.Vector3;
  origin?: boolean;
  animate?: boolean;
}) {
  const haloRef = useRef<THREE.Mesh>(null);

  // Pulsing halo for the origin marker (the start of the journey).
  useFrame(() => {
    const halo = haloRef.current;
    if (!halo || !origin || !animate) return;
    const t = performance.now() / 1000;
    const s = 1 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.9;
    halo.scale.setScalar(s);
    (halo.material as THREE.MeshBasicMaterial).opacity = 0.28 * (1.9 - s);
  });

  const coreR = origin ? 0.034 : 0.025;
  const glowR = origin ? 0.08 : 0.06;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[coreR, 12, 12]} />
        <meshBasicMaterial color="#ed1c24" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[glowR, 16, 16]} />
        <meshBasicMaterial color="#ed1c24" transparent opacity={0.25} toneMapped={false} />
      </mesh>
      {origin && (
        <mesh ref={haloRef}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#ed1c24" transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

function TravelingArc({ points, animate }: { points: THREE.Vector3[]; animate: boolean }) {
  const dotRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  // Random start offset, seeded on the first animation frame so render stays
  // pure (no Math.random during render).
  const progress = useRef<number | null>(null);

  useFrame((_, delta) => {
    if (!animate || !dotRef.current) return;
    if (progress.current === null) progress.current = Math.random();
    progress.current = (progress.current + delta * 0.25) % 1;
    const p = curve.getPoint(progress.current);
    dotRef.current.position.copy(p);
  });

  return (
    <group>
      <Line
        points={points}
        color="#f4f7fb"
        lineWidth={1.1}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.12}
        gapSize={0.06}
        toneMapped={false}
      />
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshBasicMaterial color="#ed1c24" toneMapped={false} />
      </mesh>
    </group>
  );
}

function GlobeScene({
  arcs,
  markers,
  originIndex,
  autoRotate,
  animate,
}: {
  arcs: NonNullable<GlobeProps["arcs"]>;
  markers: NonNullable<GlobeProps["markers"]>;
  originIndex?: number;
  autoRotate: boolean;
  animate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const arcPoints = useMemo(() => arcs.map((a) => buildArcPoints(a.from, a.to)), [arcs]);
  const markerVecs = useMemo(
    () => markers.map((m) => latLngToVec3(m[0], m[1], RADIUS * 1.005)),
    [markers],
  );

  useFrame((_, delta) => {
    if (animate && autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color="#cfe2ff" />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#3a6ea5" />

      <group ref={groupRef}>
        {/* Earth core */}
        <mesh>
          <sphereGeometry args={[RADIUS, 64, 64]} />
          <meshStandardMaterial
            color="#0a1424"
            emissive="#0b2038"
            emissiveIntensity={0.35}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Lat/long wireframe overlay for a "satellite" look */}
        <mesh>
          <sphereGeometry args={[RADIUS * 1.001, 36, 24]} />
          <meshBasicMaterial color="#2f6fb0" wireframe transparent opacity={0.18} />
        </mesh>

        {/* Atmosphere shell (backside, fresnel-ish rim) */}
        <mesh scale={1.14}>
          <sphereGeometry args={[RADIUS, 48, 48]} />
          <meshBasicMaterial
            color="#4a90d9"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {markerVecs.map((v, i) => (
          <Marker key={`m-${i}`} position={v} origin={i === originIndex} animate={animate} />
        ))}
        {arcPoints.map((pts, i) => (
          <TravelingArc key={`a-${i}`} points={pts} animate={animate} />
        ))}
      </group>
    </>
  );
}

/**
 * Premium space/satellite-style globe with flight arcs and markers.
 * Auto-rotates unless reduced/low-power; OrbitControls disabled on mobile
 * so page scroll isn't trapped.
 */
export default function Globe({
  className = "",
  arcs = [],
  markers = [],
  originIndex,
  autoRotate = true,
}: GlobeProps) {
  const { reduced, isMobile } = useMotionPrefs();

  // Animate (rotation + traveling dots) whenever motion is allowed. A small
  // rotating globe is cheap, so this runs on mobile too — only "Reduce Motion"
  // freezes it. (lowPower still trims DPR / star count below for performance.)
  const animate = !reduced;
  const controlsEnabled = !isMobile && !reduced;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.5, 5], fov: 45 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        style={{
          background: "transparent",
          pointerEvents: controlsEnabled ? "auto" : "none",
        }}
      >
        {!reduced && (
          <Stars radius={60} depth={40} count={isMobile ? 800 : 2500} factor={3} fade speed={animate ? 0.5 : 0} />
        )}
        <GlobeScene arcs={arcs} markers={markers} originIndex={originIndex} autoRotate={autoRotate} animate={animate} />
        {controlsEnabled && (
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} rotateSpeed={0.4} />
        )}
      </Canvas>
    </div>
  );
}
