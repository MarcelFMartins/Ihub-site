"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { CONDITIONS, STOCK } from "@/lib/data";
import { useStock } from "@/lib/stock";

/** Introdução na home que leva à página /catalogo. */
export default function CatalogTeaser() {
  const root = useRef<HTMLElement>(null);
  const { items } = useStock();
  const shots = [STOCK[1], STOCK[0], STOCK[2]];

  useGSAP(
    () => {
      const st = { trigger: root.current, start: "top 70%" };
      gsap.from(".cteaser__copy > *", { y: 60, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: st });
      gsap.from(".cteaser__shot", { y: 120, opacity: 0, rotate: 0, stagger: 0.12, duration: 1.2, ease: "expo.out", scrollTrigger: st });
    },
    { scope: root }
  );

  return (
    <section className="cteaser" id="catalogo" ref={root}>
      <div className="cteaser__copy">
        <p className="eyebrow eyebrow--dark">Catálogo</p>
        <h2 className="h-xl">
          Pronta
          <br />
          entrega.
        </h2>
        <p className="muted-dark">Lacrados, seminovos e usados revisados. Veja tudo o que temos em estoque agora.</p>
        <ul className="cteaser__chips">
          {CONDITIONS.map((c) => (
            <li key={c.id}>
              {c.label} <span>{items.filter((s) => s.condition === c.id).length}</span>
            </li>
          ))}
        </ul>
        <Link className="btn btn--navy" href="/catalogo">
          Ver catálogo completo →
        </Link>
      </div>
      <div className="cteaser__shots" aria-hidden>
        {shots.map((s, i) => (
          <div className={`cteaser__shot cteaser__shot--${i}`} key={s.model}>
            <Image src={s.img} alt="" fill sizes="320px" />
          </div>
        ))}
      </div>
    </section>
  );
}
