"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const CARDS = [
  {
    n: "01",
    title: "Produtos originais Apple.",
    text: "Aparelhos lacrados e seminovos revisados, com procedência garantida e nota fiscal. Zero surpresa.",
    img: "/products/18promax-burgundy.webp",
    theme: "wine",
  },
  {
    n: "02",
    title: "Seu usado vale desconto.",
    text: "Traga seu iPhone antigo, avaliamos na hora e ele entra como parte do pagamento do novo.",
    img: "/products/17pro-orange.webp",
    theme: "orange",
  },
  {
    n: "03",
    title: "Crédito descomplicado.",
    text: "Parceria iHub + Banco do Planalto Norte: condições especiais e parcelamento facilitado para o seu novo iPhone.",
    img: "/products/18pro-glacier.webp",
    theme: "cream",
    chips: ["Condições especiais", "Crédito facilitado", "Banco do Planalto Norte"],
  },
  {
    n: "04",
    title: "Compre e receba em casa.",
    text: "Atendimento pelo WhatsApp e envio seguro e rastreado para todo o Brasil.",
    img: "/products/duo-starwhite.webp",
    theme: "burgundy",
  },
];

/** Sticky stacking cards: each new card slides over and the previous one recedes in depth. */
export default function WhyStack() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".stack__card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const st = { trigger: cards[i + 1], start: "top bottom", end: "top 12%", scrub: true };
        gsap.to(card, { scale: 0.9, rotateX: 6, ease: "none", scrollTrigger: st });
        gsap.to(card.querySelector(".stack__shade"), { opacity: 0.35, ease: "none", scrollTrigger: { ...st } });
      });
      cards.forEach((card) => {
        gsap.from(card.querySelector(".stack__img"), {
          scale: 0.6,
          rotate: -15,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 60%" },
        });
      });
    },
    { scope: root }
  );

  return (
    <section className="stack" id="porque" ref={root}>
      <div className="section-head section-head--center">
        <p className="eyebrow eyebrow--dark">Por que a iHub</p>
        <h2 className="h-xl">
          Comprar Apple
          <br />
          <span className="grad-dark">sem medo.</span>
        </h2>
      </div>
      <div className="stack__list">
        {CARDS.map((c, i) => (
          <article className={`stack__card stack__card--${c.theme}`} key={c.n} style={{ top: `calc(10vh + ${i * 22}px)` }}>
            <span className="stack__shade" aria-hidden />
            <div className="stack__txt">
              <span className="stack__n">{c.n}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
            <div className={`stack__img ${c.img.startsWith("/insta") ? "is-photo" : ""}`}>
              <Image src={c.img} alt="" fill sizes="(max-width: 900px) 80vw, 40vw" quality={90} />
              {"chips" in c && c.chips && (
                <ul className="stack__chips">
                  {c.chips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
