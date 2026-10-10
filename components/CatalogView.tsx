"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CONDITIONS, STOCK, wa, type StockItem } from "@/lib/data";
import Tilt from "./Tilt";

const lacrados = STOCK.filter((s) => s.condition === "lacrado");
const line18 = lacrados.filter((s) => s.model.includes("18"));
const line17 = lacrados.filter((s) => s.model.includes("17"));
const others = STOCK.filter((s) => s.condition !== "lacrado");
const label = (c: StockItem["condition"]) => CONDITIONS.find((x) => x.id === c)!.label;
const ask = (s: StockItem) => wa(`Olá, iHub! Tenho interesse no ${s.model} ${s.storage} ${s.color} (${label(s.condition)}). Ainda está disponível?`);

export default function CatalogView() {
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);
  const [filter, setFilter] = useState<"todos" | "seminovo" | "usado">("todos");
  const list = filter === "todos" ? others : others.filter((s) => s.condition === filter);

  useGSAP(
    () => {
      gsap.from(".cat__hero > *", { y: 70, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", delay: 0.1 });
      gsap.utils.toArray<HTMLElement>(".cat__reveal").forEach((el) =>
        gsap.from(el.children, { y: 70, opacity: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 82%" } })
      );
      gsap.utils.toArray<HTMLElement>(".cat__float").forEach((img) =>
        gsap.fromTo(img, { y: 30, rotate: -4 }, { y: -30, rotate: 4, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } })
      );
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (first.current) return void (first.current = false);
      gsap.fromTo(".cat__row", { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "expo.out", overwrite: true });
    },
    { scope: root, dependencies: [filter] }
  );

  const Card = ({ s, big }: { s: StockItem; big?: boolean }) => (
    <Tilt className={`cat__card ${big ? "cat__card--big" : ""}`} max={5} style={{ "--tint": s.tint } as React.CSSProperties}>
      <span className="cat__tag">Lacrado</span>
      <div className="cat__imgwrap">
        <div className="cat__float">
          <Image src={s.img} alt={`${s.model} ${s.color}`} fill sizes={big ? "(max-width: 800px) 90vw, 560px" : "(max-width: 800px) 90vw, 360px"} priority={big} />
        </div>
      </div>
      <div className="cat__info">
        <div>
          <h3>{s.model}</h3>
          <p>
            {s.storage} · {s.color}
          </p>
        </div>
        <a className="btn btn--navy btn--sm" href={ask(s)} target="_blank" rel="noopener">
          Consultar valor
        </a>
      </div>
    </Tilt>
  );

  return (
    <section className="cat" ref={root}>
      <div className="cat__hero">
        <p className="eyebrow eyebrow--dark">Catálogo</p>
        <h1 className="h-xl">Em estoque.</h1>
        <p className="muted-dark">Lacrados, seminovos e usados revisados. Chame no WhatsApp para reservar.</p>
      </div>

      <div className="cat__block">
        <div className="cat__label cat__reveal">
          <span>Lançamento</span>
          <h2>iPhone 18</h2>
        </div>
        <div className="cat__grid cat__grid--2 cat__reveal">
          {line18.map((s) => (
            <Card s={s} big key={s.model} />
          ))}
        </div>
      </div>

      <div className="cat__block">
        <div className="cat__label cat__reveal">
          <span>Lacrados</span>
          <h2>iPhone 17</h2>
        </div>
        <div className="cat__grid cat__grid--3 cat__reveal">
          {line17.map((s) => (
            <Card s={s} key={s.model} />
          ))}
        </div>
      </div>

      <div className="cat__block">
        <div className="cat__label cat__reveal">
          <span>Revisados e com garantia</span>
          <h2>Seminovos e usados</h2>
        </div>
        <div className="cat__filters" role="tablist">
          {(["todos", "seminovo", "usado"] as const).map((id) => (
            <button key={id} role="tab" aria-selected={filter === id} className={filter === id ? "is-active" : ""} onClick={() => setFilter(id)}>
              {id === "todos" ? "Todos" : label(id)}
            </button>
          ))}
        </div>
        <ul className="cat__list">
          {list.map((s) => (
            <li className="cat__row" key={`${s.model}-${s.condition}`}>
              <div className="cat__thumb">
                <Image src={s.img} alt="" fill sizes="80px" />
              </div>
              <div className="cat__rowinfo">
                <h3>{s.model}</h3>
                <p>
                  {s.storage} · {s.color}
                  {s.battery ? ` · Bateria ${s.battery}%` : ""}
                </p>
              </div>
              <span className={`cat__state cat__state--${s.condition}`}>{label(s.condition)}</span>
              <a className="cat__ask" href={ask(s)} target="_blank" rel="noopener">
                Consultar →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
