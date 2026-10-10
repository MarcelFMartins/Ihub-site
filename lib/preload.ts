import { PRO_COLORS } from "./data";

/** Images shown early in the page, fetched and decoded while the loader is up. */
export const CRITICAL_IMAGES = [...PRO_COLORS.map((c) => c.img), "/apple/main_camera_endframe.webp", "/logo-white.svg"];

/** Fired by the hero phone once the 3D model is loaded and its shaders are compiled. */
export const MODEL_READY = "ihub:model-ready";
let modelReady = false;
export function markModelReady() {
  if (modelReady) return;
  modelReady = true;
  window.dispatchEvent(new Event(MODEL_READY));
}
export const isModelReady = () => modelReady;

export function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve()) : resolve());
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function waitModel() {
  return new Promise<void>((resolve) => {
    if (modelReady) return resolve();
    window.addEventListener(MODEL_READY, () => resolve(), { once: true });
  });
}
