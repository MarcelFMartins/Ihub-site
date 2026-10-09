"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import Phone from "./Phone";

type Shared = {
  /** 0..1 scroll progress for the hero choreography */
  progress?: React.MutableRefObject<number>;
  /** 0..1 intro reveal driven by GSAP */
  intro?: React.MutableRefObject<number>;
  color: React.MutableRefObject<string>;
};

function HeroRig({ progress, intro, color }: Shared) {
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
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const e = ease(THREE.MathUtils.clamp((p - 0.18) / 0.7, 0, 1));
    // intro: rise + spin in; scroll: turn from back (cameras) to front (screen)
    const ry = Math.PI - 0.55 + (1 - i) * -2.4 + e * (Math.PI + 0.55) + mouse.current.x * 0.5;
    const rx = 0.12 + (1 - i) * 0.6 - e * 0.12 + mouse.current.y * 0.25;
    const rz = (1 - i) * 0.5 + 0.08 * (1 - e);
    const k = 1 - Math.pow(0.0008, dt);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, ry, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, rx, k);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, rz, k);
    const aspect = state.viewport.aspect;
    const sideX = aspect > 1 ? 1.75 : 0;
    g.position.x = THREE.MathUtils.lerp(g.position.x, sideX * (1 - e), k);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (1 - i) * -5 + (aspect > 1 ? 0 : -1.45) * (1 - e), k);
    const s = (aspect > 1 ? 1 : 0.68) * (1 + e * (aspect > 1 ? 0.35 : 0.45));
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, k));
  });

  return (
    <group ref={group} rotation={[0.7, Math.PI - 3, 0.5]} position={[0, -5, 0]}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.35}>
        <Phone color={color} />
      </Float>
    </group>
  );
}

function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
        <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
        <Lightformer form="ring" color="#E8892B" intensity={8} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={4} />
        <Lightformer form="rect" color="#3b6bff" intensity={5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[0, 0, 8]} scale={[10, 10, 1]} />
      </group>
    </Environment>
  );
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
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 9], fov: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <spotLight position={[-6, 2, 3]} intensity={12} color="#E8892B" angle={0.5} penumbra={1} />
        <HeroRig {...props} />
        <Studio />
      </Canvas>
    </div>
  );
}

export function OrbitPhoneCanvas({ color }: { color: React.MutableRefObject<string> }) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, cursor: "grab" }}>
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 8.5], fov: 32 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
          <group rotation={[0.1, Math.PI - 0.5, 0.05]}>
            <Phone color={color} />
          </group>
        </Float>
        <ContactShadows position={[0, -2.1, 0]} opacity={0.55} scale={8} blur={2.6} far={3} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
        <Studio />
      </Canvas>
    </div>
  );
}
