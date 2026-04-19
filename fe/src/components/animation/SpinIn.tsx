"use client";
import { useEffect, useRef } from "react";

export default function SpinIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("animate-spin-in");
          void el.offsetHeight; // force reflow to restart animation
          el.classList.add("animate-spin-in");
          el.style.opacity = "1";
        } else {
          el.classList.remove("animate-spin-in");
          el.style.opacity = "0";
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ opacity: 0 }} className={className}>
      {children}
    </div>
  );
}
