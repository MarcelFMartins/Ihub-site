"use client";

import Image from "next/image";
import { useState } from "react";
import { CONDITIONS, STOCK, wa, type Condition } from "@/lib/data";

/** Estoque filtrável por condição: lacrado, seminovo e usado. */
export default function Catalog() {
  const [filter, setFilter] = useState<Condition | "todos">("todos");
  const items = filter === "todos" ? STOCK : STOCK.filter((s) => s.condition === filter);
  const label = (c: Condition) => CONDITIONS.find((x) => x.id === c)!.label;

  return (
    <section className="catalog" id="catalogo">
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
          <article className="catalog__card" key={`${s.model}-${s.storage}-${s.color}-${s.condition}`}>
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
          </article>
        ))}
      </div>
    </section>
  );
}
