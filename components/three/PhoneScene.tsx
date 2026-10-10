"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { isLowEnd } from "@/lib/perf";
import { markModelReady } from "@/lib/preload";

/**
 * Mounted next to the model (same Suspense), so it runs once the GLB is in the scene:
 * compiles every shader and uploads every texture up front, so the first visible frame
 * (or the first scroll into an off-screen canvas) does not stall.
 */
function WarmUp({ onReady }: { onReady?: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      gl.compile(scene, camera);
      scene.traverse((o) => {
        const mats = (o as THREE.Mesh).material;
        (Array.isArray(mats) ? mats : mats ? [mats] : []).forEach((m) =>
          Object.values(m).forEach((v) => v instanceof THREE.Texture && gl.initTexture(v))
        );
      });
      onReady?.();
    });
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera, onReady]);
  return null;
}
import GlbPhone from "./GlbPhone";

type Shared = {
  /** 0..1 scroll progress for the hero choreography */
  progress?: React.MutableRefObject<number>;
  /** 0..1 intro reveal driven by GSAP */
  intro?: React.MutableRefObject<number>;
  color: React.MutableRefObject<string>;
};

function HeroRig({ progress, intro, color, low }: Shared & { low?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5;
      mouse.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress?.current ?? 0;
    const i = intro?.current ?? 1;
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const e = ease(THREE.MathUtils.clamp((p - 0.18) / 0.7, 0, 1));
    // intro: rise + spin in; scroll: turn from back (cameras) to front (screen)
    const ry = Math.PI - 0.55 + (1 - i) * -2.4 + e * (3 * Math.PI + 0.55) + mouse.current.x * 0.5;
    const rx = 0.12 + (1 - i) * 0.6 - e * 0.12 + mouse.current.y * 0.25;
    const rz = (1 - i) * 0.5 + 0.08 * (1 - e) + Math.sin(e * Math.PI) * 0.28;
    const k = 1 - Math.pow(0.004, dt);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, ry, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rx, k);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, rz, k);
    const aspect = state.viewport.aspect;
    const sideX = aspect > 1 ? 1.75 : 0;
    g.position.x = THREE.MathUtils.lerp(g.position.x, sideX * (1 - e), k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (1 - i) * -5 + (aspect > 1 ? 0 : -0.95) * (1 - e) + 0.4 * e, k);
    const s = (aspect > 1 ? 1 : 0.6) * (1 + e * (aspect > 1 ? 0.15 : 0.3));
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, k));
  });

  return (
    <group ref={group} rotation={[0.7, Math.PI - 3, 0.5]} position={[0, -5, 0]}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.35}>
        <Suspense fallback={null}>
          <GlbPhone color={color} low={low} />
          <WarmUp onReady={markModelReady} />
        </Suspense>
      </Float>
    </group>
  );
}

export function Studio({ low = false }: { low?: boolean }) {
  return (
    <Environment resolution={low ? 128 : 512} frames={1}>
      <Lightformer form="rect" intensity={3.2} position={[0, 6, 3]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
      <Lightformer form="rect" intensity={3} position={[-7, 0.5, 2]} rotation-y={Math.PI / 2} scale={[7, 14, 1]} />
      <Lightformer form="rect" intensity={5} color="#ffa95c" position={[7, 0, 0]} rotation-y={-Math.PI / 2} scale={[6, 14, 1]} />
      <Lightformer form="rect" intensity={2.5} color="#5f86ff" position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={[12, 4, 1]} />
      <Lightformer form="circle" intensity={0.5} position={[0, 0, 9]} scale={7} />
      <Lightformer form="rect" intensity={2} position={[0, 2, -8]} scale={[12, 7, 1]} />
    </Environment>
  );
}

/** Picks render settings once per device, and lowers pixel ratio if the frame rate drops. */
function useQuality() {
  const [low] = useState(isLowEnd);
  // Fixed pixel ratio: phones keep a sharp image (never below 1.5 on retina screens), and we avoid
  // resizing the canvas mid-scroll, which itself causes hitches. Weak GPUs get lighter shading instead.
  const [dpr] = useState(() => {
    const native = typeof window === "undefined" ? 1 : window.devicePixelRatio;
    return Math.min(native, low ? 1.5 : 2);
  });
  const gl = { antialias: true, alpha: true, powerPreference: "high-performance" as const, toneMapping: THREE.ACESFilmicToneMapping };
  return { low, dpr, gl };
}

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([en]) => setInView(en.isIntersecting), { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

export function HeroPhoneCanvas({ active = true, ...props }: Shared & { active?: boolean }) {
  const q = useQuality();
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={q.dpr}
        camera={{ position: [0, 0, 9], fov: 30 }}
        gl={q.gl}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <spotLight position={[-6, 2, 3]} intensity={12} color="#E8892B" angle={0.5} penumbra={1} />
        <HeroRig {...props} low={q.low} />
        <Studio low={q.low} />
      </Canvas>
    </div>
  );
}

export function OrbitPhoneCanvas({ color }: { color: React.MutableRefObject<string> }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const q = useQuality();
  return (
    <div ref={ref} data-cursor="drag" style={{ position: "absolute", inset: 0, cursor: "grab" }}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={q.dpr}
        camera={{ position: [0, 0.4, 8.5], fov: 32 }}
        gl={q.gl}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
            <group rotation={[0.1, Math.PI - 0.5, 0.05]}>
              <GlbPhone color={color} low={q.low} />
            </group>
          </Float>
          {/* baked once after the model loads: a live contact shadow re-renders the whole scene every frame */}
          <WarmUp />
          <ContactShadows position={[0, -2.1, 0]} opacity={0.55} scale={8} blur={2.6} far={3} resolution={512} frames={1} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
        <Studio low={q.low} />
      </Canvas>
    </div>
  );
}
