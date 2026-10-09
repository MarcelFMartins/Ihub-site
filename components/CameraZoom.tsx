"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/** Pinned: the real lens close-up grows from a small card to full-bleed while copy swaps over it. */
export default function CameraZoom() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=260%", pin: true, scrub: 1 },
      });
      tl.fromTo(
        ".zoom__frame",
        { clipPath: "inset(30% 34% 30% 34% round 40px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut", duration: 1 }
      )
        .fromTo(".zoom__frame img", { scale: 1.3 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
        .to(".zoom__intro", { opacity: 0, scale: 0.9, duration: 0.4 }, 0)
        .from(".zoom__line--1", { yPercent: 100, opacity: 0, duration: 0.4 }, 0.8)
        .to(".zoom__line--1", { yPercent: -100, opacity: 0, duration: 0.4 }, 1.5)
        .from(".zoom__line--2", { yPercent: 100, opacity: 0, duration: 0.4 }, 1.6)
        .to(".zoom__line--2", { yPercent: -100, opacity: 0, duration: 0.4 }, 2.3)
        .from(".zoom__line--3", { yPercent: 100, opacity: 0, duration: 0.4 }, 2.4)
        .to(".zoom__frame img", { scale: 1.12, duration: 2, ease: "none" }, 1);
    },
    { scope: root }
  );

  return (
    <section className="zoom" ref={root}>
      <div className="zoom__intro">
        <p className="eyebrow">Sistema de câmeras Pro</p>
        <h2 className="h-xl">Cada detalhe.</h2>
      </div>
      <div className="zoom__frame">
        <Image src="/apple/main_camera_endframe.webp" alt="Câmera do iPhone 18 Pro em detalhe" fill sizes="100vw" unoptimized />
        <div className="zoom__shade" />
      </div>
      <div className="zoom__lines">
        <h3 className="zoom__line zoom__line--1">
          Fotos de cinema.
          <small>Câmeras Pro com zoom óptico e modo noite.</small>
        </h3>
        <h3 className="zoom__line zoom__line--2">
          Vídeo profissional.
          <small>Grave como os grandes estúdios, direto do bolso.</small>
        </h3>
        <h3 className="zoom__line zoom__line--3">
          No seu bolso.
          <small>Garanta o seu na iHub com pronta entrega.</small>
        </h3>
      </div>
    </section>
  );
}
