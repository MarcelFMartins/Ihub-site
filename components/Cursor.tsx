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
    const last = { x: -100, y: -100 };
    const update = () => {
      const t = document.elementFromPoint(last.x, last.y) as HTMLElement | null;
      el.classList.toggle("is-hover", !!t?.closest("a, button"));
      el.classList.toggle("is-drag", !!t?.closest("[data-cursor=drag]"));
    };
    const move = (e: PointerEvent) => {
      last.x = e.clientX;
      last.y = e.clientY;
      x(e.clientX);
      y(e.clientY);
      update();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <div className="cursor" ref={ref} aria-hidden>
      <span>Girar</span>
    </div>
  );
}
