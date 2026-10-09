"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

export const W = 1.5;
export const H = 3.1;
export const D = 0.17;

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function screenGeometry(w: number, h: number, r: number) {
  const geo = new THREE.ShapeGeometry(roundedRectShape(w, h, r), 24);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** Lock-screen wallpaper in the iHub palette, drawn on a canvas. */
function useScreenTexture() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 720;
    c.height = 1488;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

  useEffect(() => {
    const c = texture.image as HTMLCanvasElement;
    const ctx = c.getContext("2d")!;
    const { width: w, height: h } = c;
    const draw = (logo?: HTMLImageElement) => {
      ctx.fillStyle = "#070d22";
      ctx.fillRect(0, 0, w, h);
      const blob = (x: number, y: number, r: number, color: string) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, color);
        g.addColorStop(1, "rgba(7,13,34,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      };
      blob(w * 0.15, h * 0.85, w * 1.05, "rgba(232,137,43,0.95)");
      blob(w * 0.95, h * 0.55, w * 0.9, "rgba(122,32,52,0.9)");
      blob(w * 0.5, h * 0.05, w * 0.9, "rgba(37,72,170,0.85)");
      // glass ribbons
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(255,${190 - i * 20},${120 - i * 10},${0.12 - i * 0.015})`;
        ctx.lineWidth = 60 - i * 8;
        ctx.beginPath();
        ctx.moveTo(-50, h * (0.62 + i * 0.05));
        ctx.bezierCurveTo(w * 0.3, h * (0.4 + i * 0.04), w * 0.7, h * (0.95 - i * 0.03), w + 50, h * (0.6 + i * 0.03));
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.textAlign = "center";
      ctx.font = "600 34px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("sexta-feira, 9 de outubro", w / 2, 250);
      ctx.font = "800 210px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("9:41", w / 2, 440);
      if (logo) {
        const lw = 300;
        ctx.globalAlpha = 0.95;
        ctx.drawImage(logo, (w - lw) / 2, h - 360, lw, lw * (160 / 300));
        ctx.globalAlpha = 1;
      }
      texture.needsUpdate = true;
    };
    draw();
    const img = new Image();
    img.onload = () => draw(img);
    img.src = "/logo-white.svg";
  }, [texture]);

  return texture;
}

type Props = {
  color: React.MutableRefObject<string>;
};

export default function Phone({ color }: Props) {
  const screenTex = useScreenTexture();
  const target = useRef(new THREE.Color(color.current));

  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: color.current,
        metalness: 0.75,
        roughness: 0.28,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const backGlass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: color.current, metalness: 0.55, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35, sheen: 0.4 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#050507", roughness: 0.08, metalness: 0.2, clearcoat: 1 }), []);
  const lensGlass = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0a0f1e", roughness: 0.02, metalness: 0.9, clearcoat: 1, envMapIntensity: 2.2 }),
    []
  );
  const lensInner = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1d2a6b", emissive: "#1a2260", emissiveIntensity: 0.15, roughness: 0.1, metalness: 0.8 }), []);
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), [screenTex]);
  const screenGeo = useMemo(() => screenGeometry(W - 0.09, H - 0.09, 0.2), []);
  const backGeo = useMemo(() => screenGeometry(W - 0.05, H - 0.05, 0.22), []);

  useFrame((_, dt) => {
    target.current.set(color.current);
    const k = 1 - Math.pow(0.002, dt);
    metal.color.lerp(target.current, k);
    backGlass.color.lerp(target.current, k);
  });

  const plateauY = H / 2 - 0.55;
  const lenses: [number, number][] = [
    [0.44, plateauY + 0.21],
    [0.44, plateauY - 0.21],
    [0.08, plateauY],
  ];

  return (
    <group>
      {/* chassis */}
      <RoundedBox args={[W, H, D]} radius={0.075} smoothness={6} material={metal} />
      {/* front: black glass + screen + island */}
      <mesh geometry={backGeo} material={black} position={[0, 0, D / 2 + 0.001]} />
      <mesh geometry={screenGeo} material={screenMat} position={[0, 0, D / 2 + 0.002]} />
      <RoundedBox args={[0.42, 0.12, 0.004]} radius={0.002} position={[0, H / 2 - 0.2, D / 2 + 0.004]} material={black} />

      {/* back glass */}
      <mesh geometry={backGeo} material={backGlass} position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]} />
      {/* camera plateau */}
      <RoundedBox args={[W - 0.06, 1.0, 0.07]} radius={0.03} smoothness={4} position={[0, plateauY, -D / 2 - 0.03]} material={metal} />
      {lenses.map(([x, y], i) => (
        <group key={i} position={[x, y, -D / 2 - 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={metal}>
            <cylinderGeometry args={[0.19, 0.2, 0.08, 48]} />
          </mesh>
          <mesh position={[0, -0.03, 0]} material={lensGlass}>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 48]} />
          </mesh>
          <mesh position={[0, -0.046, 0]} material={lensInner}>
            <cylinderGeometry args={[0.06, 0.06, 0.004, 32]} />
          </mesh>
        </group>
      ))}
      {/* flash + lidar */}
      <mesh position={[-0.4, plateauY + 0.26, -D / 2 - 0.068]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.01, 32]} />
        <meshStandardMaterial color="#fff3d6" emissive="#ffe4a8" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.4, plateauY - 0.2, -D / 2 - 0.068]} rotation={[Math.PI / 2, 0, 0]} material={black}>
        <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
      </mesh>
      {/* side buttons */}
      <RoundedBox args={[0.03, 0.42, 0.06]} radius={0.012} position={[-W / 2 - 0.008, 0.75, 0]} material={metal} />
      <RoundedBox args={[0.03, 0.25, 0.06]} radius={0.012} position={[W / 2 + 0.008, 0.55, 0]} material={metal} />
      <RoundedBox args={[0.03, 0.25, 0.06]} radius={0.012} position={[W / 2 + 0.008, 0.2, 0]} material={metal} />
      <RoundedBox args={[0.025, 0.3, 0.06]} radius={0.012} position={[-W / 2 - 0.006, -0.35, 0]} material={black} />
    </group>
  );
}
