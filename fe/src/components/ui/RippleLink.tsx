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

  function handleMouseEnter(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    el.style.setProperty("--ripple-x", `${x}%`);
    el.style.setProperty("--ripple-y", `${y}%`);
    el.classList.add("ripple-active");
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("ripple-active");
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
