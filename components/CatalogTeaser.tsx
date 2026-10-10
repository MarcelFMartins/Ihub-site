"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { type Condition } from "@/lib/data";
import { useStock } from "@/lib/stock";

const CARDS: { id: Condition; title: string; text: string; img: string; tint: string }[] = [
  { id: "lacrado", title: "Lacrados", text: "Novos, na caixa e com garantia Apple. A linha iPhone 18 e 17 já disponível.", img: "/products/18promax-glacier.webp", tint: "#8fa9c8" },
  { id: "seminovo", title: "Seminovos", text: "Estado de novo, revisados e testados, com garantia iHub e bateria conferida.", img: "/catalogo/16promax.png", tint: "#e8c9a0" },
  { id: "usado", title: "Usados", text: "O melhor preço. Aparelhos revisados, com a saúde da bateria informada.", img: "/catalogo/14promax.png", tint: "#b9a4d6" },
];

/** Segunda dobra da home: explica o catálogo (lacrado, seminovo, usado) e leva até /catalogo. */
export default function CatalogTeaser() {
  const root = useRef<HTMLElement>(null);
  const { items, loading } = useStock();

  useGSAP(
    () => {
      const st = { trigger: root.current, start: "top 75%" };
      gsap.from(".cteaser__head > *", { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: st });
      gsap.from(".cteaser__card", { y: 90, opacity: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".cteaser__cards", start: "top 85%" } });
    },
    { scope: root }
  );

  return (
    <section className="cteaser" id="catalogo" ref={root}>
      <div className="cteaser__head">
        <p className="eyebrow eyebrow--dark">Catálogo</p>
        <h2 className="h-xl">
          Veja o que temos
          <br />
          em estoque.
        </h2>
        <p className="muted-dark">Escolha entre iPhones lacrados, seminovos e usados, todos à pronta entrega. É só abrir o catálogo, ver as fotos e reservar pelo WhatsApp.</p>
      </div>

      <div className="cteaser__cards">
        {CARDS.map((c) => {
          const n = items.filter((s) => s.condition === c.id).length;
          return (
            <Link href="/catalogo" className={`cteaser__card cteaser__card--${c.id}`} key={c.id} style={{ "--tint": c.tint } as React.CSSProperties}>
              <span className="cteaser__count">{loading ? "…" : n === 0 ? "Consulte" : `${n} ${n === 1 ? "aparelho" : "aparelhos"}`}</span>
              <div className="cteaser__img">
                <Image src={c.img} alt="" fill sizes="(max-width: 900px) 70vw, 280px" />
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <span className="cteaser__go">
                Ver {c.title.toLowerCase()} <i aria-hidden>→</i>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="cteaser__foot">
        <ul>
          <li>Aparelhos revisados e testados</li>
          <li>Garantia iHub</li>
          <li>Reserva rápida pelo WhatsApp</li>
        </ul>
        <Link className="btn btn--orange" href="/catalogo">
          Abrir catálogo completo →
        </Link>
      </div>
    </section>
  );
}
