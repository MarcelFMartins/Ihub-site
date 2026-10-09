"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Logo from "./Logo";
import { useLenis } from "./SmoothScroll";

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      if (!lenis) return;
      lenis.stop();
      window.scrollTo(0, 0);
      const strokes = root.current!.querySelectorAll<SVGGeometryElement>("path, circle");
      strokes.forEach((s) => {
        const len = s.getTotalLength?.() ?? 300;
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });
      const count = { v: 0 };
      const num = root.current!.querySelector(".loader__num")!;
      gsap
        .timeline({
          onComplete: () => {
            lenis.start();
            if (root.current) root.current.style.display = "none";
          },
        })
        .to(strokes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06, ease: "power2.inOut" })
        .to(count, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(count.v)).padStart(3, "0")) }, 0)
        .to(".loader svg circle[fill], .loader svg text", { opacity: 1, duration: 0.4 }, 1.1)
        .to(".loader__inner", { scale: 0.9, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.2")
        .add(() => window.dispatchEvent(new Event("ihub:loaded")), "-=0.1")
        .to(".loader__panel", { yPercent: -100, duration: 1, stagger: 0.07, ease: "expo.inOut" }, "-=0.15");
    },
    { scope: root, dependencies: [lenis] }
  );

  return (
    <div className="loader" ref={root} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="loader__panel" style={{ left: `${i * 20}%` }} />
      ))}
      <div className="loader__inner">
        <Logo className="loader__logo" ink="#ffffff" />
        <span className="loader__num">000</span>
      </div>
    </div>
  );
}
