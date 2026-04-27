"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { allCategories } from "../../../data/categories";

const labelColors = ["#4a7fc1", "#d4795e", "#4a7fc1", "#d4795e"];

const VISIBLE = 4;
const GAP = 36; // gap-9 = 36px
const total = allCategories.length; // 18
const items = [...allCategories, ...allCategories]; // duplicate for seamless loop


export default function CategoryCarousel() {
  const [cardWidth, setCardWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      setCardWidth((w - GAP * (VISIBLE - 1)) / VISIBLE);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // step = one card width + one gap (margin-right per card)
  const step = cardWidth + GAP;
  // total distance to scroll = first half of the duplicated track
  const dist = total * step;

  return (
    <div ref={containerRef} className="overflow-hidden w-full py-4">
      {cardWidth > 0 && (
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
              key={i}
              className="flex-none relative transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:z-10"
              style={{ width: cardWidth, marginRight: GAP }}
            >
              <div className="border-4 border-[#927615] rounded-t-xl overflow-hidden bg-white">
                <div className="aspect-square relative overflow-hidden">
                  <Image src="/baju.png" alt={cat.name} fill className="object-cover" />
                </div>
                <div className="py-3 text-center" style={{ backgroundColor: labelColors[i % 4] }}>
                  <p className="text-white font-bold text-lg">{cat.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
