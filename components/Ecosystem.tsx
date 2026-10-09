"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ECOSYSTEM, wa } from "@/lib/data";
import Tilt from "./Tilt";

export default function Ecosystem() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".eco__title .word", {
        yPercent: 110,
        stagger: 0.06,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: ".eco__title", start: "top 85%" },
      });
      gsap.utils.toArray<HTMLElement>(".eco__tile").forEach((tile, i) => {
        gsap.from(tile, {
          y: 120,
          rotateX: -25,
          opacity: 0,
          duration: 1.3,
          delay: (i % 3) * 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: tile, start: "top 92%" },
        });
        const img = tile.querySelector(".eco__img");
        if (img)
          gsap.fromTo(img, { yPercent: 6 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: tile, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: root }
  );

  return (
    <section className="eco" id="ecossistema" ref={root}>
      <div className="section-head">
        <p className="eyebrow eyebrow--dark">Ecossistema Apple</p>
        <h2 className="h-xl eco__title">
          {"Tudo Apple. Um só lugar.".split(" ").map((w, i) => (
            <span className="mask" key={i}>
              <span className="word">{w}&nbsp;</span>
            </span>
          ))}
        </h2>
      </div>
      <div className="eco__grid">
        {ECOSYSTEM.map((e) => (
          <Tilt key={e.key} className={`eco__tile eco__tile--${e.key} ${e.span ? `is-${e.span}` : ""}`} max={6}>
            <a href={wa(`Olá, iHub! Tenho interesse em ${e.title}.`)} target="_blank" rel="noopener" className="eco__link">
              <div className="eco__txt">
                <h3>{e.title}</h3>
                <p>{e.line}</p>
                <span className="eco__more">Consultar →</span>
              </div>
              <div className="eco__img">
                <Image src={e.img} alt={e.title} fill sizes="(max-width: 900px) 90vw, 40vw" />
              </div>
            </a>
          </Tilt>
        ))}
      </div>
    </section>
  );
}
