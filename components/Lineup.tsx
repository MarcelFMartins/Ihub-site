"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { LINEUP, wa } from "@/lib/data";
import Tilt from "./Tilt";

/** Horizontal, scroll-pinned product rail on desktop; native swipe rail on mobile. */
export default function Lineup() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const track = root.current!.querySelector<HTMLElement>(".lineup__track")!;
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>(".lineup__img").forEach((img) => {
          gsap.fromTo(
            img,
            { rotate: -12, y: 40 },
            { rotate: 8, y: -20, ease: "none", scrollTrigger: { trigger: img, containerAnimation: tween, start: "left right", end: "right left", scrub: true } }
          );
        });
      });
      gsap.from(".lineup__head > *", { y: 80, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%" } });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="lineup" id="linha" ref={root}>
      <div className="lineup__track">
        <div className="lineup__head">
          <p className="eyebrow eyebrow--dark">Linha iPhone</p>
          <h2 className="h-xl">
            Escolha
            <br />o seu.
          </h2>
          <p className="muted-dark">Todos os modelos e capacidades, originais e lacrados. Consulte disponibilidade e condições.</p>
        </div>
        {LINEUP.map((p) => (
          <Tilt className="lineup__card" key={p.name} style={{ "--tint": p.tint } as React.CSSProperties}>
            {p.badge && <span className="badge">{p.badge}</span>}
            <div className="lineup__imgwrap">
              <div className="lineup__img">
                <Image src={p.img} alt={p.name} fill sizes="380px" />
              </div>
            </div>
            <h3>{p.name}</h3>
            <p>{p.tagline}</p>
            <a className="btn btn--navy btn--sm" href={wa(`Olá, iHub! Quero saber valores e condições do ${p.name}.`)} target="_blank" rel="noopener">
              Consultar valor
            </a>
          </Tilt>
        ))}
        <div className="lineup__card lineup__card--more">
          <h3>Não achou o seu modelo?</h3>
          <p>Trabalhamos com toda a linha Apple, novos e seminovos. Chame a gente e receba uma proposta na hora.</p>
          <a className="btn btn--orange" href={wa("Olá, iHub! Estou procurando um modelo específico.")} target="_blank" rel="noopener">
            Pedir cotação →
          </a>
        </div>
      </div>
    </section>
  );
}
