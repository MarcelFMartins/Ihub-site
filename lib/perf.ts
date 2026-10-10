/** Rough low-end device check, used to scale down the 3D scenes. */
export function isLowEnd() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const touch = window.matchMedia("(pointer: coarse)").matches;
  return cores <= 2 || mem <= 2 || (cores <= 4 && mem <= 4) || (touch && (cores <= 4 || mem <= 4));
}
