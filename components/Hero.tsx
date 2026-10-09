"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { PRO_COLORS, wa } from "@/lib/data";
import SplitText from "./SplitText";

const HeroPhoneCanvas = dynamic(() => import("./three/PhoneScene").then((m) => m.HeroPhoneCanvas), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const intro = useRef(0);
  const color = useRef(PRO_COLORS[0].hex);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);

  useGSAP(
    () => {
      const el = root.current!;
      const chars = el.querySelectorAll(".hero__title .char");
      const fades = el.querySelectorAll("[data-fade]");
      gsap.set(chars, { yPercent: 120, rotate: 8 });
      gsap.set(fades, { y: 30, opacity: 0 });

      const play = () => {
        const tl = gsap.timeline();
        tl.to(intro, { current: 1, duration: 2.2, ease: "expo.out" }, 0)
          .to(chars, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.025, ease: "expo.out" }, 0.15)
          .to(fades, { y: 0, opacity: 1, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.5);
      };
      window.addEventListener("ihub:loaded", play, { once: true });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=160%",
            pin: true,
            scrub: 1,
            onUpdate: (s) => (progress.current = s.progress),
            onLeave: () => setRunning(false),
            onEnterBack: () => setRunning(true),
          },
        })
        .to(".hero__copy", { y: -140, opacity: 0, ease: "none", duration: 0.22 }, 0)
        .to(".hero__colors, .hero__hint", { y: 30, opacity: 0, ease: "none", duration: 0.18 }, 0)
        .to(".hero__glow", { scale: 1.8, ease: "none", duration: 1 }, 0)
        .fromTo(".hero__reveal", { opacity: 0, y: 80 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.6);

      return () => window.removeEventListener("ihub:loaded", play);
    },
    { scope: root }
  );

  const pick = (i: number) => {
    setActive(i);
    color.current = PRO_COLORS[i].hex;
  };

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__glow" />
      <div className="hero__grid" />
      <div className="hero__canvas">
        <HeroPhoneCanvas active={running} progress={progress} intro={intro} color={color} />
      </div>

      <div className="hero__copy">
        <p className="eyebrow eyebrow--live" data-fade>
          Lançamento · Pronta entrega
        </p>
        <h1 className="hero__title">
          <SplitText text="iPhone 18 Pro." />
          <br />
          <SplitText text="Chegou na iHub." className="grad" />
        </h1>
        <p className="hero__lead" data-fade>
          Originais, lacrados e com garantia. Compre sem sair de casa — enviamos para todo o Brasil.
        </p>
        <div className="hero__ctas" data-fade>
          <a className="btn btn--orange" href={wa("Olá, iHub! Quero garantir o meu iPhone 18 Pro.")} target="_blank" rel="noopener">
            Garantir o meu
          </a>
          <a className="btn btn--ghost" href="#linha">
            Ver todos os modelos
          </a>
        </div>
      </div>

      <div className="hero__colors" data-fade>
        <div className="swatches">
          {PRO_COLORS.map((c, i) => (
            <button
              key={c.id}
              className={`swatch ${i === active ? "is-active" : ""}`}
              style={{ "--c": c.hex } as React.CSSProperties}
              onClick={() => pick(i)}
              aria-label={c.name}
              title={c.name}
            />
          ))}
          <span className="swatches__label">{PRO_COLORS[active].name}</span>
        </div>
      </div>

      <div className="hero__hint" data-fade>
        <i />
        Role para girar
      </div>

      <div className="hero__reveal">
        <p className="eyebrow">Arraste. Gire. Escolha a cor.</p>
        <h2>
          O máximo. <span className="grad">Em todos os sentidos.</span>
        </h2>
      </div>
    </section>
  );
}
