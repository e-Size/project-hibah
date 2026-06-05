"use client";

import { useEffect, useRef, useState } from "react";

export default function WordFadeText({
  text,
  className = "",
  wordDelay = 45,
}: {
  text: string;
  className?: string;
  wordDelay?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [inView, setInView] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px 120px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`inline-block transition-all duration-500 ease-out ${
            inView ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
          style={{ transitionDelay: `${index * wordDelay}ms` }}
        >
          {word}
          {index < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </p>
  );
}
