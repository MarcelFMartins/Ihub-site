"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Logo from "./Logo";
import { useLenis } from "./SmoothScroll";
import { CRITICAL_IMAGES, preloadImage, waitModel } from "@/lib/preload";

/** Longest the loader waits on slow connections before revealing the page anyway. */
const MAX_WAIT = 9000;

export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      if (!lenis) return;
      lenis.stop();
      window.scrollTo(0, 0);
      const strokes = root.current!.querySelectorAll<SVGGeometryElement>("path, circle");
      strokes.forEach((s) => {
        const len = s.getTotalLength?.() ?? 300;
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      });

      const num = root.current!.querySelector(".loader__num")!;
      const count = { v: 0 };
      const render = () => (num.textContent = String(Math.round(count.v)).padStart(3, "0"));
      const advance = (to: number, duration = 0.6) => gsap.to(count, { v: to, duration, ease: "power2.out", overwrite: true, onUpdate: render });

      // real work: model + shaders, fonts and the first images
      let finished = false;
      const tasks: Promise<unknown>[] = [waitModel(), document.fonts?.ready ?? Promise.resolve(), ...CRITICAL_IMAGES.map(preloadImage)];
      let done = 0;
      tasks.forEach((t) =>
        t.then(() => {
          done++;
          if (!finished) advance((done / tasks.length) * 96);
        })
      );

      const intro = gsap
        .timeline()
        .to(strokes, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06, ease: "power2.inOut" })
        .to(".loader svg circle[fill], .loader svg text", { opacity: 1, duration: 0.4 }, 1.1);
      const introDone = new Promise<void>((r) => intro.eventCallback("onComplete", () => r()));
      const timeout = new Promise<void>((r) => setTimeout(r, MAX_WAIT));

      const finish = () => {
        if (finished) return;
        finished = true;
        gsap
          .timeline({
            onComplete: () => {
              num.textContent = "100";
              lenis.start();
              if (root.current) root.current.style.display = "none";
            },
          })
          .to(count, { v: 100, duration: 0.35, ease: "power2.out", overwrite: true, onUpdate: render })
          .to(".loader__inner", { scale: 0.9, opacity: 0, duration: 0.5, ease: "power3.in" }, "+=0.1")
          .add(() => window.dispatchEvent(new Event("ihub:loaded")), "-=0.1")
          .to(".loader__panel", { yPercent: -100, duration: 1, stagger: 0.07, ease: "expo.inOut" }, "-=0.15");
      };
      Promise.race([Promise.all([introDone, Promise.all(tasks)]), timeout]).then(finish);
    },
    { scope: root, dependencies: [lenis] }
  );

  return (
    <div className="loader" ref={root} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="loader__panel" style={{ left: `${i * 20}%` }} />
      ))}
      <div className="loader__inner">
        <Logo className="loader__logo" ink="#ffffff" />
        <span className="loader__num">000</span>
      </div>
    </div>
  );
}
