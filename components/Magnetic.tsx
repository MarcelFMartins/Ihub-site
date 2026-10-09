"use client";

import { useRef } from "react";
import { gsap } from "gsap";

export default function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className="magnetic"
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.4, ease: "power3.out" });
      }}
      onPointerLeave={() => gsap.to(ref.current, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" })}
    >
      {children}
    </span>
  );
}
