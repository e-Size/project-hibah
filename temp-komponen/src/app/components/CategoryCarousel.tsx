"use client";

import { useState, useEffect, useRef } from "react";
import { allCategories } from "../data/categories";

const VISIBLE = 4;
const GAP = 36; // gap-9 = 36px
const total = allCategories.length; // 18
const items = [...allCategories, ...allCategories]; // duplicate for seamless loop

function CategoryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#4a7fc1"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

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
    <div ref={containerRef} className="overflow-hidden w-full">
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
              className="flex-none bg-white rounded-2xl shadow-md p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              style={{ width: cardWidth, marginRight: GAP }}
            >
              <div
                className="rounded-xl flex items-center justify-center aspect-square mb-4"
                style={{ backgroundColor: cat.bg }}
              >
                <CategoryIcon />
              </div>
              <p className="text-center text-gray-800 font-light">{cat.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
