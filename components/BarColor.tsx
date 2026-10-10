"use client";

import { useEffect } from "react";

const IGNORE = ".nav, .wa, .loader, .cursor";

/** Colour of whatever page content sits under a viewport point (ignoring fixed overlays). */
function colourAt(x: number, y: number): string | null {
  const hit = document.elementsFromPoint(x, y).find((el) => !el.closest(IGNORE));
  // start from the enclosing section so cards/buttons inside it don't tint the browser bars
  const section = hit?.closest("[data-bar], section, footer, .marquee") as HTMLElement | null;
  for (let el = (section ?? hit) as HTMLElement | undefined; el; el = el.parentElement ?? undefined) {
    if (el.dataset?.bar) return el.dataset.bar;
    const bg = getComputedStyle(el).backgroundColor;
    const m = bg.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b, a = "1"] = m[1].split(/[ ,/]+/).filter(Boolean);
      if (parseFloat(a) > 0.6) return `rgb(${Math.round(+r)}, ${Math.round(+g)}, ${Math.round(+b)})`;
    }
  }
  return null;
}

/**
 * Mobile browsers tint their top (status/address) and bottom (toolbar) areas from the page.
 * Keep them matched to the section that is currently under each edge.
 */
export default function BarColor() {
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    document.querySelectorAll('meta[name="theme-color"][media]').forEach((m) => m.remove());
    const root = document.documentElement;
    root.style.transition = "background-color 0.35s ease";

    let raf = 0;
    let lastTop = "";
    let lastBottom = "";
    const apply = () => {
      raf = 0;
      const x = window.innerWidth / 2;
      const top = colourAt(x, 2);
      const bottom = colourAt(x, window.innerHeight - 2);
      if (top && top !== lastTop) {
        lastTop = top;
        meta!.content = top;
      }
      if (bottom && bottom !== lastBottom) {
        lastBottom = bottom;
        root.style.backgroundColor = bottom;
        document.body.style.backgroundColor = bottom;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const id = window.setInterval(schedule, 400); // section backgrounds animate (colour showcase)
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
