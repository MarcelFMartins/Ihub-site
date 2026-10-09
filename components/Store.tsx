"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ADDRESS, CITY, MAPS_EMBED, MAPS_URL, STORE_PHOTO, WHATSAPP_DISPLAY, wa } from "@/lib/data";

/** Physical store: storefront photo (or the Google Maps embed until one is provided). */
export default function Store() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".store__media",
        { clipPath: "inset(12% 10% 12% 10% round 48px)", scale: 0.92 },
        { clipPath: "inset(0% 0% 0% 0% round 32px)", scale: 1, ease: "none", scrollTrigger: { trigger: ".store__media", start: "top bottom", end: "center center", scrub: true } }
      );
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
      <div className="store__media">
        {STORE_PHOTO ? (
          <Image src={STORE_PHOTO} alt="Fachada da loja iHub Brasil" fill sizes="(max-width: 900px) 100vw, 50vw" quality={90} />
        ) : (
          <iframe
            title="Mapa da loja iHub Brasil"
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
        <a className="store__pin" href={MAPS_URL} target="_blank" rel="noopener">
          <strong>iHub Brasil</strong>
          <span>{ADDRESS}</span>
        </a>
      </div>
    </section>
  );
}
