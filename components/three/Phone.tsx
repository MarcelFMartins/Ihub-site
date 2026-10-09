"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const W = 1.5;
export const H = 3.1;
export const D = 0.17;
const R = 0.3; // outer corner radius
const BEVEL_T = 0.055; // frame roundness along depth
const BEVEL_S = 0.05; // frame roundness across the face

type Radii = number | [number, number, number, number]; // tl, tr, br, bl

/**
 * Rounded rectangle with squircle corners (continuous curvature, like the iPhone's body).
 * n = 2 is a circular corner; higher values give the Apple "squircle" look.
 */
function squircle(w: number, h: number, radii: Radii, n = 3.4, seg = 22) {
  const [tl, tr, br, bl] = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
  const x = -w / 2;
  const y = -h / 2;
  const pts: THREE.Vector2[] = [];
  const corner = (cx: number, cy: number, r: number, sx: number, sy: number, from: number, to: number) => {
    const rr = Math.max(r, 0.001);
    for (let i = 0; i <= seg; i++) {
      const t = from + ((to - from) * i) / seg;
      const c = Math.pow(Math.max(Math.cos(t), 0), 2 / n);
      const s = Math.pow(Math.max(Math.sin(t), 0), 2 / n);
      pts.push(new THREE.Vector2(cx + sx * rr * c, cy + sy * rr * s));
    }
  };
  const q = Math.PI / 2;
  corner(x + w - br, y + br, br, 1, -1, q, 0); // bottom-right
  corner(x + w - tr, y + h - tr, tr, 1, 1, 0, q); // top-right
  corner(x + tl, y + h - tl, tl, -1, 1, q, 0); // top-left
  corner(x + bl, y + bl, bl, -1, -1, 0, q); // bottom-left
  return new THREE.Shape(pts);
}

export function plateGeometry(w: number, h: number, r: Radii, n?: number) {
  const geo = new THREE.ShapeGeometry(squircle(w, h, r, n), 1);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** Extruded, bevelled slab with smooth (welded) normals. */
function slabGeometry(w: number, h: number, r: Radii, depth: number, bt: number, bs: number, segments = 10) {
  const inner: Radii = Array.isArray(r) ? (r.map((v) => Math.max(v - bs, 0.01)) as Radii) : Math.max(r - bs, 0.01);
  const g = new THREE.ExtrudeGeometry(squircle(w - 2 * bs, h - 2 * bs, inner), {
    depth: depth - 2 * bt,
    bevelEnabled: true,
    bevelThickness: bt,
    bevelSize: bs,
    bevelOffset: 0,
    bevelSegments: segments,
    curveSegments: 1,
  });
  g.translate(0, 0, -(depth - 2 * bt) / 2);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  const merged = mergeVertices(g, 1e-4);
  merged.computeVertexNormals();
  return merged;
}

const APPLE_PATH =
  "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z";

function useAppleLogoTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    ctx.translate(51, 26);
    ctx.scale(0.4, 0.4);
    ctx.fillStyle = "#fff";
    ctx.fill(new Path2D(APPLE_PATH));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/** Lock-screen wallpaper in the iHub palette, drawn on a canvas. */
export function useScreenTexture() {
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

// camera plateau
const PLATEAU_W = W - 0.03;
const PLATEAU_H = 1.12;
const PLATEAU_DEPTH = 0.03;
const PLATEAU_BEVEL = 0.014;
const PLATEAU_TOP = PLATEAU_DEPTH + PLATEAU_BEVEL; // protrusion from the back surface
const PLATEAU_CY = H / 2 - PLATEAU_H / 2 - 0.012;

/** Camera lens: polished ring, dark glass, inner element and a faint violet coating ring. Axis = +z. */
function Lens({ ring, glass, element, x, y }: { ring: THREE.Material; glass: THREE.Material; element: THREE.Material; x: number; y: number }) {
  const ringGeo = useMemo(() => {
    const pts = [
      [0.146, 0.012],
      [0.146, 0.04],
      [0.152, 0.052],
      [0.168, 0.058],
      [0.192, 0.057],
      [0.212, 0.049],
      [0.222, 0.035],
      [0.224, 0.018],
      [0.218, 0.006],
      [0.2, 0],
    ].map(([r, h]) => new THREE.Vector2(r, h));
    return new THREE.LatheGeometry(pts, 72);
  }, []);
  return (
    <group position={[x, y, 0]}>
      <mesh geometry={ringGeo} material={ring} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, 0, 0.02]} material={glass}>
        <circleGeometry args={[0.148, 56]} />
      </mesh>
      <mesh position={[0, 0, 0.022]} scale={[1, 0.3, 1]} rotation={[Math.PI / 2, 0, 0]} material={element}>
        <sphereGeometry args={[0.1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <torusGeometry args={[0.121, 0.0035, 8, 72]} />
        <meshStandardMaterial color="#7d6bff" emissive="#3a2fa8" emissiveIntensity={0.2} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.056]}>
        <circleGeometry args={[0.026, 24]} />
        <meshStandardMaterial color="#0c1646" emissive="#2a3fb5" emissiveIntensity={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

export default function Phone({ color }: Props) {
  const screenTex = useScreenTexture();
  const logoTex = useAppleLogoTexture();
  const tmp = useMemo(() => new THREE.Color(), []);
  const white = useMemo(() => new THREE.Color("#ffffff"), []);

  const frame = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: color.current, metalness: 0.95, roughness: 0.3, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const panel = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: color.current, metalness: 0.25, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.6 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const ring = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: color.current, metalness: 1, roughness: 0.24, clearcoat: 0.4, side: THREE.DoubleSide }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const black = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#040406", roughness: 0.06, metalness: 0.5, clearcoat: 1 }), []);
  const lensGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#05070f", roughness: 0.04, metalness: 0.4, clearcoat: 1, envMapIntensity: 2.6 }), []);
  const lensElement = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0a0f2e", roughness: 0.05, metalness: 0.7, clearcoat: 1, iridescence: 0.35, iridescenceIOR: 1.4, envMapIntensity: 3 }),
    []
  );
  const screenMat = useMemo(() => new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), [screenTex]);

  const bodyGeo = useMemo(() => slabGeometry(W, H, R, D, BEVEL_T, BEVEL_S, 10), []);
  const plateauGeo = useMemo(
    () => slabGeometry(PLATEAU_W, PLATEAU_H, [R - 0.02, R - 0.02, 0.16, 0.16], PLATEAU_DEPTH + 2 * PLATEAU_BEVEL, PLATEAU_BEVEL, PLATEAU_BEVEL, 6),
    []
  );
  const frontGlass = useMemo(() => plateGeometry(W - 2 * BEVEL_S, H - 2 * BEVEL_S, R - BEVEL_S), []);
  const screenGeo = useMemo(() => plateGeometry(W - 0.17, H - 0.17, R - 0.085), []);
  const islandGeo = useMemo(() => plateGeometry(0.4, 0.115, 0.0575, 2), []);
  const panelH = H - PLATEAU_H - 0.1;
  const panelGeo = useMemo(() => plateGeometry(W - 0.15, panelH, [0.05, 0.05, R - 0.075, R - 0.075]), [panelH]);
  const panelCY = -H / 2 + 0.075 + panelH / 2;

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.002, dt);
    tmp.set(color.current);
    frame.color.lerp(tmp, k);
    panel.color.copy(frame.color).multiplyScalar(0.9);
    ring.color.copy(frame.color).lerp(white, 0.1);
  });

  const lensY = PLATEAU_CY;
  const lensZ = PLATEAU_TOP;

  return (
    <group>
      {/* chassis: bevelled squircle slab */}
      <mesh geometry={bodyGeo} material={frame} />

      {/* ---------- front ---------- */}
      <mesh geometry={frontGlass} material={black} position={[0, 0, D / 2 + 0.0008]} />
      <mesh geometry={screenGeo} material={screenMat} position={[0, 0, D / 2 + 0.0016]} />
      <mesh geometry={islandGeo} material={black} position={[0, H / 2 - 0.21, D / 2 + 0.0026]} />

      {/* ---------- back (local +z of this group = world -z) ---------- */}
      <group position={[0, 0, -D / 2]} rotation={[0, Math.PI, 0]}>
        {/* glass panel under the plateau */}
        <mesh geometry={panelGeo} material={panel} position={[0, panelCY, 0.0012]} />
        <mesh position={[0, panelCY, 0.002]}>
          <planeGeometry args={[0.36, 0.36]} />
          <meshBasicMaterial map={logoTex} transparent opacity={0.28} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* camera plateau */}
        <mesh geometry={plateauGeo} material={frame} position={[0, PLATEAU_CY, -PLATEAU_BEVEL + 0.001]} />

        {/* three lenses (triangle) */}
        <group position={[0, 0, lensZ]}>
          <Lens ring={ring} glass={lensGlass} element={lensElement} x={-0.4} y={lensY + 0.265} />
          <Lens ring={ring} glass={lensGlass} element={lensElement} x={-0.4} y={lensY - 0.265} />
          <Lens ring={ring} glass={lensGlass} element={lensElement} x={0.02} y={lensY} />

          {/* flash */}
          <mesh position={[0.5, lensY + 0.3, 0.004]}>
            <circleGeometry args={[0.06, 32]} />
            <meshStandardMaterial color="#fff1d1" emissive="#ffd48a" emissiveIntensity={0.55} roughness={0.3} />
          </mesh>
          <mesh position={[0.5, lensY + 0.3, 0.002]}>
            <circleGeometry args={[0.075, 32]} />
            <meshPhysicalMaterial color="#0a0a0d" roughness={0.1} metalness={0.6} clearcoat={1} />
          </mesh>
          {/* LiDAR + mic */}
          <mesh position={[0.5, lensY - 0.08, 0.003]} material={black}>
            <circleGeometry args={[0.062, 32]} />
          </mesh>
          <mesh position={[0.5, lensY - 0.08, 0.001]}>
            <circleGeometry args={[0.078, 32]} />
            <meshStandardMaterial color="#2b2b30" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0.5, lensY - 0.27, 0.003]} material={black}>
            <circleGeometry args={[0.018, 16]} />
          </mesh>
        </group>
      </group>

      {/* ---------- side hardware ---------- */}
      {/* left: action button + volume */}
      <RoundedBox args={[0.034, 0.13, 0.05]} radius={0.016} smoothness={4} position={[-W / 2, 0.95, 0]} material={frame} />
      <RoundedBox args={[0.034, 0.25, 0.05]} radius={0.016} smoothness={4} position={[-W / 2, 0.58, 0]} material={frame} />
      <RoundedBox args={[0.034, 0.25, 0.05]} radius={0.016} smoothness={4} position={[-W / 2, 0.24, 0]} material={frame} />
      {/* right: side button + camera control */}
      <RoundedBox args={[0.034, 0.42, 0.05]} radius={0.016} smoothness={4} position={[W / 2, 0.55, 0]} material={frame} />
      <RoundedBox args={[0.03, 0.2, 0.05]} radius={0.015} smoothness={4} position={[W / 2, -0.5, 0]} material={black} />
      {/* bottom: USB-C + speaker slots */}
      <RoundedBox args={[0.17, 0.018, 0.045]} radius={0.01} smoothness={3} position={[0, -H / 2 + 0.003, 0]} material={black} />
      {[-1, 1].map((s) => (
        <group key={s}>
          {[0.2, 0.28, 0.36, 0.44].map((o) => (
            <mesh key={o} position={[s * o + s * 0.1, -H / 2 + 0.002, 0]} material={black}>
              <boxGeometry args={[0.03, 0.012, 0.03]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
