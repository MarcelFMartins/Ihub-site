"use client";

import { useEffect } from "react";

/** Bloqueia zoom por pinça, toque duplo e Ctrl+roda/teclado (o iOS ignora user-scalable=no, por isso o reforço em JS). */
export default function NoZoom() {
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault();
    const pinch = (e: TouchEvent) => e.touches.length > 1 && e.preventDefault();
    let last = 0;
    const dbl = (e: TouchEvent) => {
      const now = Date.now();
      if (now - last < 300) e.preventDefault();
      last = now;
    };
    const wheel = (e: WheelEvent) => e.ctrlKey && e.preventDefault();
    const keys = (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key) && e.preventDefault();
    document.addEventListener("gesturestart", stop);
    document.addEventListener("gesturechange", stop);
    document.addEventListener("touchmove", pinch, { passive: false });
    document.addEventListener("touchend", dbl, { passive: false });
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keys);
    return () => {
      document.removeEventListener("gesturestart", stop);
      document.removeEventListener("gesturechange", stop);
      document.removeEventListener("touchmove", pinch);
      document.removeEventListener("touchend", dbl);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keys);
    };
  }, []);
  return null;
}
