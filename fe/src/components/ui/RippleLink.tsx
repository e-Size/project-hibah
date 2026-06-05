"use client";

import Link from "next/link";
import { useRef, MouseEvent, ReactNode } from "react";

interface RippleLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

export default function RippleLink({ href, className = "", children, target, rel }: RippleLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const rafRef = useRef<number | null>(null);

  function animateRipple(from: number, to: number, duration: number) {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();

    function tick(now: number) {
      const target = ref.current;
      if (!target) return;
      const t = Math.min((now - start) / duration, 1);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const size = from + (to - from) * eased;
      target.style.setProperty("--ripple-size", `${size}%`);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }

  function handleMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--ripple-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--ripple-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    animateRipple(0, 120, 700);
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    const current = parseFloat(el.style.getPropertyValue("--ripple-size") || "0");
    animateRipple(current, 0, 400);
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={`ripple-link ${className}`}
      target={target}
      rel={rel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}
