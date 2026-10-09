"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PRO_COLORS, wa } from "@/lib/data";

/**
 * Pinned section: scrolling cycles through the real iPhone 18 Pro finishes.
 * Background tint, product shot and label crossfade with each colour.
 */
export default function ColorShowcase() {
  const root = useRef<HTMLElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);

  useGSAP(
    () => {
      const n = PRO_COLORS.length;
      const shots = gsap.utils.toArray<HTMLElement>(".colors__shot");
      gsap.set(shots, { opacity: 0, scale: 1.08 });
      gsap.set(shots[0], { opacity: 1, scale: 1 });

      const go = (next: number) => {
        const prev = idxRef.current;
        if (next === prev) return;
        idxRef.current = next;
        setIdx(next);
        gsap.to(shots[prev], { opacity: 0, scale: 1.08, duration: 0.9, ease: "power3.out" });
        gsap.fromTo(shots[next], { opacity: 0, scale: 0.94, rotate: next > prev ? -3 : 3 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: "expo.out" });
        gsap.to(root.current, { backgroundColor: PRO_COLORS[next].bg, duration: 1, ease: "power2.out" });
        gsap.fromTo(".colors__name .char-line", { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "expo.out" });
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: `+=${n * 70}%`,
        pin: true,
        scrub: true,
        onUpdate: (s) => {
          go(Math.min(n - 1, Math.floor(s.progress * n)));
          gsap.set(".colors__bar i", { scaleX: s.progress });
        },
      });

      gsap.from(".colors__head > *", {
        y: 60,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root }
  );

  const c = PRO_COLORS[idx];
  return (
    <section className="colors" id="cores" ref={root} style={{ backgroundColor: PRO_COLORS[0].bg }}>
      <div className="colors__head">
        <p className="eyebrow">iPhone 18 Pro · Cores</p>
        <h2 className="h-xl">
          Escolha a sua
          <br />
          <span className="grad">personalidade.</span>
        </h2>
      </div>

      <div className="colors__stage">
        {PRO_COLORS.map((col, i) => (
          <div className="colors__shot" key={col.id}>
            <Image src={col.scene} alt={`iPhone 18 Pro ${col.name}`} fill sizes="(max-width: 900px) 100vw, 70vw" priority={i === 0} />
          </div>
        ))}
      </div>

      <div className="colors__foot">
        <div className="colors__name">
          <span className="char-line" key={c.id}>
            {c.name}
          </span>
        </div>
        <div className="colors__dots">
          {PRO_COLORS.map((col, i) => (
            <span key={col.id} className={i === idx ? "is-active" : ""} style={{ "--c": col.hex } as React.CSSProperties} />
          ))}
        </div>
        <a className="btn btn--light btn--sm" href={wa(`Olá, iHub! Quero o iPhone 18 Pro na cor ${c.name}.`)} target="_blank" rel="noopener">
          Quero o {c.name} →
        </a>
      </div>
      <div className="colors__bar">
        <i />
      </div>
    </section>
  );
}
