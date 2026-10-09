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
      const loop = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, duration: 28, ease: "none", repeat: -1 });
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
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <circle cx="12" cy="12" r="12" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
