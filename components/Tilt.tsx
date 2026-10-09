"use client";

import { useRef } from "react";
import { gsap } from "gsap";

type Props = React.HTMLAttributes<HTMLDivElement> & { max?: number };

/** 3D perspective tilt that follows the pointer, with a moving specular glare. */
export default function Tilt({ children, className = "", max = 10, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * max * 2, rotateX: -y * max * 2, duration: 0.6, ease: "power3.out", transformPerspective: 900 });
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1, 0.5)" });

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
      <span className="tilt__glare" aria-hidden />
    </div>
  );
}
