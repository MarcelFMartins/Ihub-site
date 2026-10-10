"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CONDITIONS, photosOf, wa, type StockItem } from "@/lib/data";
import { useStock } from "@/lib/stock";
import { useLenis } from "./SmoothScroll";
import Tilt from "./Tilt";

const label = (c: StockItem["condition"]) => CONDITIONS.find((x) => x.id === c)!.label;
const ask = (s: StockItem) => wa(`Olá, iHub! Tenho interesse no ${s.model} ${s.storage} ${s.color} (${label(s.condition)}). Ainda está disponível?`);
const tag = (s: StockItem) => (s.status === "reservado" ? "Reservado" : s.badge || label(s.condition));
const keyOf = (s: StockItem) => s.id ?? `${s.model}-${s.color}-${s.condition}`;
const isRemote = (src: string) => src.startsWith("data:");

export default function CatalogView() {
  const root = useRef<HTMLElement>(null);
  const first = useRef(true);
  const { items, loading } = useStock();
  const featured = items.filter((s) => s.featured);
  const lacrados = items.filter((s) => !s.featured && s.condition === "lacrado");
  const others = items.filter((s) => !s.featured && s.condition !== "lacrado");
  const [filter, setFilter] = useState<"todos" | "seminovo" | "usado">("todos");
  const list = filter === "todos" ? others : others.filter((s) => s.condition === filter);
  const [open, setOpen] = useState<StockItem | null>(null);

  useGSAP(
    () => {
      if (loading) return;
      gsap.utils.toArray<HTMLElement>(".cat__reveal").forEach((el) =>
        gsap.from(el.children, { y: 70, opacity: 0, stagger: 0.12, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 82%" } })
      );
      gsap.utils.toArray<HTMLElement>(".cat__float").forEach((img) =>
        gsap.fromTo(img, { y: 30, rotate: -4 }, { y: -30, rotate: 4, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } })
      );
    },
    { scope: root, dependencies: [loading, items.length] }
  );

  useGSAP(
    () => {
      gsap.from(".cat__hero > *", { y: 70, opacity: 0, stagger: 0.1, duration: 1.1, ease: "expo.out", delay: 0.1 });
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

  const card = (s: StockItem, big?: boolean) => (
    <Tilt
      className={`cat__card ${big ? "cat__card--big" : ""}`}
      max={5}
      style={{ "--tint": s.tint } as React.CSSProperties}
      key={keyOf(s)}
      role="button"
      tabIndex={0}
      aria-label={`Ver fotos e detalhes do ${s.model}`}
      onClick={() => setOpen(s)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setOpen(s))}
    >
      <span className={`cat__tag ${s.status === "reservado" ? "cat__tag--res" : s.badge ? "cat__tag--badge" : ""}`}>{tag(s)}</span>
      {photosOf(s).length > 1 && <span className="cat__count">{photosOf(s).length} fotos</span>}
      <div className="cat__imgwrap">
        <div className="cat__float">
          <Image src={s.img} alt={`${s.model} ${s.color}`} fill sizes={big ? "(max-width: 800px) 90vw, 560px" : "(max-width: 800px) 90vw, 360px"} priority={big} unoptimized={isRemote(s.img)} />
        </div>
      </div>
      <div className="cat__info">
        <div>
          <h3>{s.model}</h3>
          <p>
            {s.storage} · {s.color}
            {s.condition !== "lacrado" ? ` · ${label(s.condition)}` : ""}
          </p>
        </div>
        <span className="btn btn--navy btn--sm">Ver detalhes</span>
      </div>
    </Tilt>
  );

  return (
    <section className="cat" ref={root}>
      <div className="cat__hero">
        <Link className="cat__back" href="/">
          <span aria-hidden>←</span> Voltar ao início
        </Link>
        <p className="eyebrow eyebrow--dark">Catálogo</p>
        <h1 className="h-xl">Em estoque.</h1>
        <p className="muted-dark">Lacrados, seminovos e usados revisados. Toque em um aparelho para ver as fotos e reservar pelo WhatsApp.</p>
      </div>

      {!loading && items.length === 0 && <p className="cat__empty">Estoque sendo atualizado. Chame a gente no WhatsApp para saber o que temos disponível.</p>}

      {featured.length > 0 && (
        <div className="cat__block">
          <div className="cat__label cat__reveal">
            <span>Em destaque</span>
            <h2>Destaques</h2>
          </div>
          <div className={`cat__grid ${featured.length === 1 ? "cat__grid--1" : "cat__grid--2"} cat__reveal`}>{featured.map((s) => card(s, true))}</div>
        </div>
      )}

      {lacrados.length > 0 && (
        <div className="cat__block">
          <div className="cat__label cat__reveal">
            <span>Novos na caixa</span>
            <h2>Lacrados</h2>
          </div>
          <div className="cat__grid cat__grid--3 cat__reveal">{lacrados.map((s) => card(s))}</div>
        </div>
      )}

      {others.length > 0 && (
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
              <li key={keyOf(s)}>
                <button className="cat__row" onClick={() => setOpen(s)}>
                  <span className="cat__thumb">
                    <Image src={s.img} alt="" fill sizes="80px" unoptimized={isRemote(s.img)} />
                  </span>
                  <span className="cat__rowinfo">
                    <strong>{s.model}</strong>
                    <small>
                      {s.storage} · {s.color}
                      {s.battery ? ` · Bateria ${s.battery}%` : ""}
                    </small>
                  </span>
                  <span className={`cat__state cat__state--${s.status === "reservado" ? "reservado" : s.condition}`}>{tag(s)}</span>
                  <span className="cat__ask">Ver →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && <ProductModal item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function ProductModal({ item, onClose }: { item: StockItem; onClose: () => void }) {
  const lenis = useLenis();
  const track = useRef<HTMLDivElement>(null);
  const shots = photosOf(item);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(idx + 1);
      if (e.key === "ArrowLeft") go(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  });

  const go = (i: number) => {
    const n = Math.max(0, Math.min(shots.length - 1, i));
    track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const t = track.current!;
    setIdx(Math.round(t.scrollLeft / t.clientWidth));
  };

  return (
    <div className="pm" role="dialog" aria-modal="true" aria-label={item.model} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pm__box" data-lenis-prevent>
        <button className="pm__x" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        <div className="pm__gallery" style={{ "--tint": item.tint } as React.CSSProperties}>
          <div className="pm__track" ref={track} onScroll={onScroll}>
            {shots.map((src, i) => (
              <div className="pm__slide" key={i}>
                <Image src={src} alt={`${item.model} — foto ${i + 1} de ${shots.length}`} fill sizes="(max-width: 860px) 100vw, 520px" priority={i === 0} unoptimized={isRemote(src)} />
              </div>
            ))}
          </div>
          {shots.length > 1 && (
            <>
              <button className="pm__nav pm__nav--prev" onClick={() => go(idx - 1)} disabled={idx === 0} aria-label="Foto anterior">
                ‹
              </button>
              <button className="pm__nav pm__nav--next" onClick={() => go(idx + 1)} disabled={idx === shots.length - 1} aria-label="Próxima foto">
                ›
              </button>
              <div className="pm__dots">
                {shots.map((_, i) => (
                  <button key={i} className={i === idx ? "is-active" : ""} onClick={() => go(i)} aria-label={`Ir para a foto ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="pm__info">
          <div className="pm__tags">
            <span className={`cat__state cat__state--${item.status === "reservado" ? "reservado" : item.condition}`}>{item.status === "reservado" ? "Reservado" : label(item.condition)}</span>
            {item.badge && <span className="pm__badge">{item.badge}</span>}
          </div>
          <h2>{item.model}</h2>
          <ul className="pm__specs">
            <li>{item.storage}</li>
            <li>{item.color}</li>
            {item.battery ? <li>Bateria {item.battery}%</li> : null}
          </ul>
          {item.description && <p className="pm__desc">{item.description}</p>}
          {item.note && <p className="pm__note">{item.note}</p>}
          <a className="btn btn--orange pm__cta" href={ask(item)} target="_blank" rel="noopener">
            Reservar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
