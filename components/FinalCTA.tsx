"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, wa } from "@/lib/data";
import Magnetic from "./Magnetic";

export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".cta__title",
        { scale: 0.7, opacity: 0.2 },
        { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 60%", scrub: true } }
      );
      gsap.fromTo(".cta__phone", { yPercent: 60, rotate: -20 }, { yPercent: 0, rotate: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
      gsap.fromTo(".cta__phone--b", { yPercent: 70, rotate: 22 }, { yPercent: 5, rotate: 10, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
    },
    { scope: root }
  );

  return (
    <section className="cta" ref={root} data-bar="#0b1533">
      <div className="cta__glow" />
      <div className="cta__phone">
        <Image src="/products/18pro-burgundy.webp" alt="" fill sizes="30vw" />
      </div>
      <div className="cta__phone cta__phone--b">
        <Image src="/products/18pro-glacier.webp" alt="" fill sizes="30vw" />
      </div>
      <h2 className="cta__title">
        Seu próximo iPhone
        <br />
        <span className="grad">está a uma mensagem.</span>
      </h2>
      <div className="cta__btns">
        <Magnetic>
          <a className="btn btn--orange btn--lg" href={wa()} target="_blank" rel="noopener">
            Chamar no WhatsApp
          </a>
        </Magnetic>
        <Magnetic>
          <a className="btn btn--ghost btn--lg" href={INSTAGRAM_URL} target="_blank" rel="noopener">
            {INSTAGRAM_HANDLE}
          </a>
        </Magnetic>
      </div>

    </section>
  );
}
