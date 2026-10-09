"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { wa } from "@/lib/data";

const SEEN_KEY = "ihub:wa-bubble";

/** Floating WhatsApp: pops in after the loader, ripples, wiggles, and nudges once with a chat bubble. */
export default function WhatsAppFloat() {
  const root = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState(false);

  useEffect(() => {
    const el = root.current!;
    let shown = false;
    let t1: number | undefined;
    let t2: number | undefined;

    gsap.set(el, { scale: 0, opacity: 0, transformOrigin: "100% 100%" });

    const reveal = () => {
      if (shown) return;
      shown = true;
      gsap.to(el, { scale: 1, opacity: 1, duration: 1.2, delay: 0.5, ease: "elastic.out(1, 0.55)" });
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {}
      if (!seen && window.innerWidth >= 900) {
        t1 = window.setTimeout(() => setBubble(true), 4500);
        t2 = window.setTimeout(() => setBubble(false), 14000);
      }
    };

    window.addEventListener("ihub:loaded", reveal, { once: true });
    const fallback = window.setTimeout(reveal, 7000); // in case the loader event was missed

    return () => {
      window.removeEventListener("ihub:loaded", reveal);
      window.clearTimeout(fallback);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const close = () => {
    setBubble(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  };

  return (
    <div className="wa" ref={root}>
      <div className={`wa__bubble ${bubble ? "is-open" : ""}`} role="status" aria-hidden={!bubble}>
        <button className="wa__close" onClick={close} aria-label="Fechar">
          ×
        </button>
        <div className="wa__head">
          <span className="wa__avatar">iH</span>
          <div>
            <strong>iHub Brasil</strong>
            <small>
              <i /> online agora
            </small>
          </div>
        </div>
        <p>Olá! 👋 Quer ajuda para escolher o seu iPhone? Responde aqui rapidinho.</p>
        <a href={wa()} target="_blank" rel="noopener" onClick={close}>
          Iniciar conversa →
        </a>
      </div>

      <a className="wa__btn" href={wa()} target="_blank" rel="noopener" aria-label="Falar com a iHub no WhatsApp">
        <span className="wa__label">Fale com a gente</span>
        <span className="wa__icon">
          <span className="wa__ring" />
          <span className="wa__ring wa__ring--2" />
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="wa__badge">1</span>
        </span>
      </a>
    </div>
  );
}
