"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { H, plateGeometry, useScreenTexture } from "./Phone";

export const MODEL_URL = "/models/iphone.glb";
useGLTF.preload(MODEL_URL);

// Materials of the Sketchfab model that carry the body colour.
const TINTED = ["17ProMax_color", "17ProMax_color2", "17ProMax_color3", "17ProMax_G", "17ProMax_Logo", "Material.002"];
const LENSES = ["17ProMax_Lens", "17ProMax_Lens2.001", "17ProMax_glass"];

/** iPhone 18 Pro Max model (Sketchfab, CC-BY "Pro Animator"), normalised to H tall, centred, back facing -z. */
export default function GlbPhone({ color }: { color: React.MutableRefObject<string> }) {
  const { scene } = useGLTF(MODEL_URL);

  const { model, tinted, dims } = useMemo(() => {
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
    const dims = { w: size.x * s, h: size.y * s, d: size.z * s };
    return { model: wrap, tinted, dims };
  }, [scene]);

  const target = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    target.set(color.current);
    const k = 1 - Math.pow(0.002, dt);
    tinted.forEach(({ mat, dark }) => mat.color.lerp(tmp.copy(target).multiplyScalar(dark), k));
  });

  const screenTex = useScreenTexture();
  const screenGeo = useMemo(() => plateGeometry(dims.w * 0.905, dims.h * 0.955, dims.w * 0.12), [dims]);

  return (
    <group>
      <primitive object={model} />
      <mesh geometry={screenGeo} position={[0, 0, dims.d / 2 + 0.002]}>
        <meshBasicMaterial map={screenTex} toneMapped={false} />
      </mesh>
    </group>
  );
}
