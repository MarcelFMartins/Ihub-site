"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Soft follower cursor that grows over interactive elements (pointer devices only). */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current!;
    el.style.display = "block";
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const t = e.target as HTMLElement;
      el.classList.toggle("is-hover", !!t.closest("a, button"));
      el.classList.toggle("is-drag", !!t.closest("[data-cursor=drag]"));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden>
      <span>Girar</span>
    </div>
  );
}
