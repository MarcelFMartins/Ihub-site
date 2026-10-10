"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DEFAULT_COLOR, PRO_COLORS, wa } from "@/lib/data";

const OrbitPhoneCanvas = dynamic(() => import("./three/PhoneScene").then((m) => m.OrbitPhoneCanvas), { ssr: false });

const SPECS = [
  ["Câmeras Pro", "Sistema triplo com zoom óptico"],
  ["Chip Pro", "Desempenho de última geração"],
  ["Bateria", "Para o dia inteiro — e mais"],
  ["Tela Super Retina", "OLED com ProMotion"],
];

export default function Explore360() {
  const root = useRef<HTMLElement>(null);
  const color = useRef(PRO_COLORS[DEFAULT_COLOR].hex);
  const [active, setActive] = useState(DEFAULT_COLOR);
  const [touched, setTouched] = useState(false);

  useGSAP(
    () => {
      gsap.from(".explore__spec", {
        x: (i) => (i % 2 ? 80 : -80),
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 55%" },
      });
      gsap.from(".explore__title .char", {
        yPercent: 110,
        stagger: 0.02,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
      gsap.fromTo(".explore__ring", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
    },
    { scope: root }
  );

  return (
    <section className="explore" ref={root}>
      <div className="explore__head">
        <p className="eyebrow">Experiência 360°</p>
        <h2 className="h-xl explore__title">
          {"Gire. Explore.".split("").map((c, i) => (
            <span className="char" key={i}>
              {c === " " ? " " : c}
            </span>
          ))}
        </h2>
        <p className="muted">Arraste o iPhone para ver todos os ângulos.</p>
      </div>

      <div className="explore__stage" onPointerDown={() => setTouched(true)}>
        <div className="explore__ring" />
        <OrbitPhoneCanvas color={color} />
        <div className={`explore__drag ${touched ? "is-hidden" : ""}`} aria-hidden>
          <span>←</span> Arraste para girar <span>→</span>
        </div>
        <div className="explore__specs">
          {SPECS.map(([t, d]) => (
            <div className="explore__spec" key={t}>
              <strong>{t}</strong>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="explore__foot">
        <div className="swatches">
          {PRO_COLORS.map((c, i) => (
            <button
              key={c.id}
              className={`swatch ${i === active ? "is-active" : ""}`}
              style={{ "--c": c.hex } as React.CSSProperties}
              onClick={() => {
                setActive(i);
                color.current = c.hex;
              }}
              aria-label={c.name}
            />
          ))}
          <span className="swatches__label">{PRO_COLORS[active].name}</span>
        </div>
        <a className="btn btn--orange" href={wa(`Olá, iHub! Quero o iPhone 18 Pro ${PRO_COLORS[active].name}.`)} target="_blank" rel="noopener">
          Comprar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}
