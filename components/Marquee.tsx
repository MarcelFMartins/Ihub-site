"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const ITEMS = ["iPhone 18 Pro", "iPhone Duo", "MacBook", "iPad", "AirPods", "Apple Watch", "Capas & Películas"];

/** Infinite marquee whose speed and skew react to scroll velocity. */
export default function Marquee({ tone = "orange", reverse = false }: { tone?: "orange" | "navy"; reverse?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current!.querySelector(".marquee__track")!;
      const dir = reverse ? 1 : -1;
      const loop = gsap.to(track, { xPercent: dir * 50, duration: 28, ease: "none", repeat: -1 });
      if (reverse) gsap.set(track, { xPercent: -50 });
      const skew = gsap.quickTo(track, "skewX", { duration: 0.4, ease: "power3" });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (s) => {
          const v = s.getVelocity();
          loop.timeScale(1 + Math.min(Math.abs(v) / 300, 5));
          skew(gsap.utils.clamp(-12, 12, v / -150));
        },
        onLeave: () => loop.timeScale(1),
      });
    },
    { scope: root }
  );

  const row = [...ITEMS, ...ITEMS];
  return (
    <div className={`marquee marquee--${tone}`} ref={root}>
      <div className="marquee__track">
        {row.concat(row).map((t, i) => (
          <span key={i} className="marquee__item">
            {t}
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
