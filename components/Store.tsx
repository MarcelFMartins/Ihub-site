"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ADDRESS, CITY, INSTAGRAM_HANDLE, INSTAGRAM_URL, MAPS_EMBED, MAPS_URL, STORE_PHOTO, WHATSAPP_DISPLAY, wa } from "@/lib/data";

/** Physical store: full-bleed navy section — statement and contacts on the left, map bleeding to the edge on the right, flowing into the final CTA. */
export default function Store() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(".shop__map", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out", scrollTrigger: { trigger: ".shop", start: "top 85%", end: "top 20%", scrub: true } });
      gsap.from(".shop__info > *", { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".shop__card", start: "top 70%" } });
      gsap.from(".shop__pin", { y: -30, opacity: 0, duration: 1, ease: "back.out(2)", scrollTrigger: { trigger: ".shop__card", start: "top 60%" } });
    },
    { scope: root }
  );

  return (
    <section className="shop" id="loja" ref={root}>
      <div className="shop__card">
        <div className="shop__info">
          <p className="eyebrow">Nossa loja</p>
          <h2 className="shop__title">
            Venha tomar um café com a <span className="grad">gente.</span>
          </h2>
          <p className="shop__lead">Veja os aparelhos de perto, tire suas dúvidas com calma e saia com o seu iPhone configurado e pronto para usar.</p>

          <ul className="shop__rows">
            <li>
              <a href={MAPS_URL} target="_blank" rel="noopener">
                <i aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                </i>
                <span>
                  <small>Endereço</small>
                  {ADDRESS}
                  <em>{CITY}</em>
                </span>
              </a>
            </li>
            <li>
              <a href={wa()} target="_blank" rel="noopener">
                <i aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z" />
                  </svg>
                </i>
                <span>
                  <small>WhatsApp</small>
                  {WHATSAPP_DISPLAY}
                </span>
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
                <i aria-hidden>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </i>
                <span>
                  <small>Instagram</small>
                  {INSTAGRAM_HANDLE}
                </span>
              </a>
            </li>
          </ul>

          <div className="shop__ctas">
            <a className="btn btn--orange" href={MAPS_URL} target="_blank" rel="noopener">
              Como chegar →
            </a>
            <a className="btn btn--ghost" href={wa()} target="_blank" rel="noopener">
              Falar com um vendedor
            </a>
          </div>
        </div>

        <a className="shop__map" href={MAPS_URL} target="_blank" rel="noopener" aria-label="Abrir a loja no Google Maps">
          {STORE_PHOTO ? (
            <Image src={STORE_PHOTO} alt="Fachada da loja iHub Brasil" fill sizes="(max-width: 900px) 100vw, 50vw" />
          ) : (
            <iframe title="Mapa da loja iHub Brasil" src={MAPS_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
          )}
          <span className="shop__fade" aria-hidden />
          <span className="shop__pin">
            <b aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
            </b>
            <span>
              <strong>iHub Brasil</strong>
              {CITY}
            </span>
          </span>
        </a>
      </div>
    </section>
  );
}
