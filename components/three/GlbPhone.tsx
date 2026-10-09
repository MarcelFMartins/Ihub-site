"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { H, useScreenTexture } from "./Phone";

export const MODEL_URL = "/models/iphone.glb";
useGLTF.preload(MODEL_URL);

// Materials of the Sketchfab model that carry the body colour.
const TINTED = ["17ProMax_color", "17ProMax_color2", "17ProMax_color3", "17ProMax_G", "17ProMax_Logo", "Material.002"];
const LENSES = ["17ProMax_Lens", "17ProMax_Lens2.001"];
const GLASS = "17ProMax_glass"; // front cover glass
const SCREEN = "Material.001"; // display panel

/** iPhone 18 Pro Max model (Sketchfab, CC-BY "Pro Animator"), normalised to H tall, centred, back facing -z. */
export default function GlbPhone({ color }: { color: React.MutableRefObject<string> }) {
  const { scene } = useGLTF(MODEL_URL);
  const screenTex = useScreenTexture();

  const { model, tinted } = useMemo(() => {
    const model = scene.clone(true);
    const tinted: { mat: THREE.MeshStandardMaterial; dark: number }[] = [];
    const seen = new Map<THREE.Material, THREE.Material>();
    // drop the studio backdrop plane shipped with the model
    const drop: THREE.Object3D[] = [];
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (/plane/i.test(o.name) || (m.isMesh && !Array.isArray(m.material) && m.material.name === "Material.003")) drop.push(o);
    });
    drop.forEach((o) => o.removeFromParent());
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const out = mats.map((mat) => {
        if (LENSES.includes(mat.name)) {
          if (!seen.has(mat))
            seen.set(mat, new THREE.MeshPhysicalMaterial({ color: "#06081a", metalness: 0.6, roughness: 0.04, clearcoat: 1, iridescence: 0.4, envMapIntensity: 2.5 }));
          return seen.get(mat)!;
        }
        if (mat.name === GLASS) {
          if (!seen.has(mat))
            seen.set(mat, new THREE.MeshPhysicalMaterial({ name: GLASS, color: "#ffffff", transparent: true, opacity: 0.08, roughness: 0, metalness: 0, clearcoat: 1, depthWrite: false }));
          return seen.get(mat)!;
        }
        if (mat.name === SCREEN) {
          if (!seen.has(mat)) seen.set(mat, Object.assign(new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), { name: SCREEN }));
          return seen.get(mat)!;
        }
        if (!TINTED.includes(mat.name)) return mat;
        if (!seen.has(mat)) {
          const c = (mat as THREE.MeshStandardMaterial).clone();
          c.map = null; // the frame texture is gold; drive it by colour instead
          tinted.push({ mat: c, dark: mat.name === "17ProMax_color3" ? 0.18 : mat.name === "17ProMax_Logo" ? 1.35 : 1 });
          seen.set(mat, c);
        }
        return seen.get(mat)!;
      });
      m.material = Array.isArray(m.material) ? out : out[0];
    });

    // orient: longest axis vertical
    let box = new THREE.Box3().setFromObject(model);
    let size = box.getSize(new THREE.Vector3());
    if (size.z > size.y && size.z >= size.x) model.rotation.x = -Math.PI / 2;
    else if (size.x > size.y) model.rotation.z = Math.PI / 2;
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    size = box.getSize(new THREE.Vector3());
    const s = H / size.y;
    const wrap = new THREE.Group();
    wrap.add(model);
    model.position.sub(box.getCenter(new THREE.Vector3()));
    wrap.scale.setScalar(s);
    wrap.rotation.y = Math.PI; // back towards -z, screen towards +z (matches the procedural phone)
    // project planar UVs (in the final, front-facing space) onto the model's own screen mesh
    wrap.updateMatrixWorld(true);
    let screen: THREE.Mesh | null = null;
    wrap.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.Material).name === SCREEN) screen = m;
    });
    if (screen) {
      const sm = screen as THREE.Mesh;
      const geo = sm.geometry.clone();
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < pos.count; i++) pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(sm.matrixWorld).clone());
      const bb = new THREE.Box3().setFromPoints(pts);
      const uv = new Float32Array(pos.count * 2);
      pts.forEach((p, i) => {
        uv[i * 2] = (p.x - bb.min.x) / (bb.max.x - bb.min.x);
        uv[i * 2 + 1] = (p.y - bb.min.y) / (bb.max.y - bb.min.y);
      });
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      sm.geometry = geo;
      sm.name = "__screen";
      sm.material = (sm.material as THREE.Material).clone();
    }
    return { model: wrap, tinted };
  }, [scene, screenTex]);

  const target = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const normal = useMemo(() => new THREE.Vector3(), []);
  const toCam = useMemo(() => new THREE.Vector3(), []);
  const wpos = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, dt) => {
    // screen "wakes up" as it turns towards the viewer
    const scr = model.getObjectByProperty("name", "__screen") as THREE.Mesh | undefined;
    if (scr) {
      model.getWorldPosition(wpos);
      normal.set(0, 0, -1).applyQuaternion(model.getWorldQuaternion(new THREE.Quaternion()));
      toCam.copy(camera.position).sub(wpos).normalize();
      const facing = THREE.MathUtils.smoothstep(normal.dot(toCam), 0.15, 0.75);
      const m = scr.material as THREE.MeshBasicMaterial;
      m.color.setScalar(THREE.MathUtils.lerp(m.color.r, 0.08 + 0.92 * facing, 1 - Math.pow(0.02, dt)));
    }
    target.set(color.current);
    const k = 1 - Math.pow(0.002, dt);
    tinted.forEach(({ mat, dark }) => mat.color.lerp(tmp.copy(target).multiplyScalar(dark), k));
  });

  return <primitive object={model} />;
}
