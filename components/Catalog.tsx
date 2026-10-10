"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Tilt from "./Tilt";
import { CONDITIONS, STOCK, wa, type Condition } from "@/lib/data";

/** Estoque filtrável por condição: lacrado, seminovo e usado. */
export default function Catalog() {
  const [filter, setFilter] = useState<Condition | "todos">("todos");
  const items = filter === "todos" ? STOCK : STOCK.filter((s) => s.condition === filter);
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        gsap.from(".catalog__head > *, .catalog__filters", { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
        gsap.from(".catalog__card", { y: 80, opacity: 0, scale: 0.96, stagger: 0.07, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ".catalog__grid", start: "top 85%" } });
      } else {
        gsap.fromTo(".catalog__card", { y: 30, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, stagger: 0.05, duration: 0.6, ease: "expo.out", overwrite: true });
      }
    },
    { scope: root, dependencies: [filter] }
  );

  const label = (c: Condition) => CONDITIONS.find((x) => x.id === c)!.label;

  return (
    <section className="catalog" id="catalogo" ref={root}>
      <div className="catalog__head">
        <p className="eyebrow eyebrow--dark">Catálogo</p>
        <h2 className="h-xl">Pronta entrega.</h2>
        <p className="muted-dark">Lacrados, seminovos e usados revisados. Estoque atualizado — chame no WhatsApp para reservar.</p>
      </div>

      <div className="catalog__filters" role="tablist">
        {(["todos", ...CONDITIONS.map((c) => c.id)] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={filter === id}
            className={`catalog__filter ${filter === id ? "is-active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {id === "todos" ? "Todos" : label(id)}
            <span>{id === "todos" ? STOCK.length : STOCK.filter((s) => s.condition === id).length}</span>
          </button>
        ))}
      </div>
      {filter !== "todos" && <p className="catalog__desc">{CONDITIONS.find((c) => c.id === filter)!.desc}</p>}

      <div className="catalog__grid">
        {items.map((s) => (
          <Tilt className="catalog__card" max={6} key={`${s.model}-${s.storage}-${s.color}-${s.condition}`}>
            <span className={`catalog__tag catalog__tag--${s.condition}`}>{label(s.condition)}</span>
            <div className="catalog__img">
              <Image src={s.img} alt={`${s.model} ${s.color}`} fill sizes="(max-width: 700px) 90vw, 300px" />
            </div>
            <h3>{s.model}</h3>
            <ul className="catalog__specs">
              <li>{s.storage}</li>
              <li>{s.color}</li>
              {s.battery && <li>Bateria {s.battery}%</li>}
            </ul>
            {s.note && <p className="catalog__note">{s.note}</p>}
            <a
              className="btn btn--navy btn--sm"
              href={wa(`Olá, iHub! Tenho interesse no ${s.model} ${s.storage} ${s.color} (${label(s.condition)}). Ainda está disponível?`)}
              target="_blank"
              rel="noopener"
            >
              Reservar
            </a>
          </Tilt>
        ))}
      </div>
    </section>
  );
}
