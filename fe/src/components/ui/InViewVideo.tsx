"use client";
import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  threshold?: number;
  rootMargin?: string;
};

export default function InViewVideo({
  src,
  className = "",
  threshold = 0.3,
  rootMargin,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.currentTime = 0;
          el.play().catch(() => {});
        } else {
          el.pause();
          el.currentTime = 0;
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      preload="auto"
      className={className}
    />
  );
}
