"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useLenis } from "./SmoothScroll";
import { wa } from "@/lib/data";

const LINKS = [
  ["Catálogo", "/catalogo"],
  ["iPhone 18 Pro", "#cores"],
  ["Linha iPhone", "#linha"],
  ["Mac & iPad", "#ecossistema"],
  ["Por que a iHub", "#porque"],
  ["Loja", "#loja"],
] as const;

export default function Nav() {
  const lenis = useLenis();
  const home = usePathname() === "/";
  const url = (href: string) => (home || !href.startsWith("#") ? href : `/${href}`);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!lenis) return;
    let last = 0;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setScrolled(scroll > 40);
      setHidden(scroll > last && scroll > 600);
      last = scroll;
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  const go = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    if (!home || !href.startsWith("#")) return;
    e.preventDefault();
    lenis?.scrollTo(href === "#top" ? 0 : href, { offset: 0, duration: href === "#top" ? 2.2 : 1.6 });
  };

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden && !open ? "is-hidden" : ""} ${open ? "is-open" : ""}`}>
      <a href={url("#top")} className="nav__logo" onClick={(e) => go(e, "#top")} aria-label="iHub Brasil — início">
        <Logo ink="#fff" sub badge={false} />
      </a>
      <nav className="nav__links">
        {LINKS.map(([label, href], i) => (
          <a key={href} href={url(href)} onClick={(e) => go(e, href)} style={{ "--i": i } as React.CSSProperties}>
            {label}
          </a>
        ))}
        <a className="btn btn--orange nav__links-cta" href={wa()} target="_blank" rel="noopener">
          Comprar agora
        </a>
      </nav>
      <a className="btn btn--orange btn--sm nav__cta" href={wa()} target="_blank" rel="noopener">
        Comprar agora
      </a>
      <button className="nav__burger" aria-label="Abrir menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i />
        <i />
      </button>
    </header>
  );
}
