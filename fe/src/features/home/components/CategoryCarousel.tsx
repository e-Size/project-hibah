"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useProducts } from "../../../hooks/useProducts";
import type { CategoryItem } from "../../../types/product";

const labelColors = ["#4a7fc1", "#d4795e", "#4a7fc1", "#d4795e"];

function getLayout(vw: number): { visible: number; gap: number } {
  if (vw < 640) return { visible: 2.5, gap: 8 };
  if (vw < 1024) return { visible: 3, gap: 20 };
  return { visible: 4, gap: 36 };
}

export default function CategoryCarousel() {
  const { items: categories } = useProducts();
  const [cardWidth, setCardWidth] = useState(0);
  const [gapPx, setGapPx] = useState(36);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = categories.length;
  const items: CategoryItem[] = [...categories, ...categories];

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const { visible, gap } = getLayout(window.innerWidth);
      const containerW = containerRef.current.offsetWidth;
      setCardWidth((containerW - gap * (visible - 1)) / visible);
      setGapPx(gap);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = cardWidth + gapPx;
  const dist = total * step;

  return (
    <div ref={containerRef} className="overflow-hidden w-full py-3">
      {cardWidth > 0 && total > 0 && (
        <div
          className="flex"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={
            {
              animation: `carousel-scroll ${total * 1.8}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
              "--carousel-dist": `-${dist}px`,
            } as React.CSSProperties
          }
        >
          {items.map((cat, i) => (
            <div
              key={`${cat.id ?? cat.name}-${i}`}
              className="flex-none relative transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:z-10"
              style={{ width: cardWidth, marginRight: gapPx }}
            >
              <div className="border-[3px] border-[#927615] rounded-t-xl overflow-hidden bg-white">
                <div className="aspect-square relative overflow-hidden">
                  <Image src={cat.image || "/baju.png"} alt={cat.name} fill className="object-cover" />
                </div>
                <div
                  className="py-2 text-center"
                  style={{ backgroundColor: cat.bg || labelColors[i % 4] }}
                >
                  <p className="text-white font-bold text-xs sm:text-sm lg:text-base leading-tight px-1 truncate">
                    {cat.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
