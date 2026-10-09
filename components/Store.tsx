"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ADDRESS, CITY, MAPS_URL, WHATSAPP_DISPLAY, wa } from "@/lib/data";

const COLS = [
  ["/insta/p2.webp", "/insta/p22.webp", "/insta/p9.webp"],
  ["/insta/p16.webp", "/insta/p6.webp", "/insta/p4.webp"],
];

/** Physical store: real photos from the iHub Instagram in counter-scrolling parallax columns. */
export default function Store() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".store__col--a", { yPercent: 8 }, { yPercent: -18, ease: "none", scrollTrigger: { trigger: root.current, scrub: true } });
      gsap.fromTo(".store__col--b", { yPercent: -22 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: root.current, scrub: true } });
      gsap.from(".store__info > *", { y: 50, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".store__info", start: "top 75%" } });
    },
    { scope: root }
  );

  return (
    <section className="store" id="loja" ref={root}>
      <div className="store__info">
        <p className="eyebrow">Nossa loja</p>
        <h2 className="h-xl">
          Venha tomar
          <br />
          um café com a <span className="grad">gente.</span>
        </h2>
        <p className="muted">
          Conheça a loja física da iHub Brasil, veja os aparelhos de perto e saia com o seu iPhone configurado e pronto para usar.
        </p>
        <ul className="store__list">
          <li>
            <span>Endereço</span>
            <a href={MAPS_URL} target="_blank" rel="noopener">
              {ADDRESS}
              <br />
              {CITY}
            </a>
          </li>
          <li>
            <span>WhatsApp</span>
            <a href={wa()} target="_blank" rel="noopener">
              {WHATSAPP_DISPLAY}
            </a>
          </li>
        </ul>
        <div className="store__ctas">
          <a className="btn btn--orange" href={MAPS_URL} target="_blank" rel="noopener">
            Como chegar
          </a>
          <a className="btn btn--ghost" href={wa()} target="_blank" rel="noopener">
            Falar com um vendedor
          </a>
        </div>
      </div>
      <div className="store__gallery">
        {COLS.map((col, ci) => (
          <div className={`store__col store__col--${ci ? "b" : "a"}`} key={ci}>
            {col.map((src) => (
              <div className="store__ph" key={src}>
                <Image src={src} alt="Loja iHub Brasil" fill sizes="(max-width: 900px) 45vw, 22vw" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
