"use client";

import { useRef, useEffect } from "react";

function spawnImage(x: number, y: number) {
  const size = window.innerWidth >= 1536 ? 260 : 160;
  const src = `/H${Math.floor(Math.random() * 9) + 1}.png`;
  const img = document.createElement("img");
  img.src = src;
  img.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    object-fit: contain;
    transform: translate(-50%, -50%) scale(0);
    pointer-events: none;
    z-index: 9999;
    opacity: 1;
    transition: transform 0.2s ease, opacity 0.8s ease;
  `;
  document.body.appendChild(img);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      img.style.transform = "translate(-50%, -50%) scale(1)";
    });
  });

  setTimeout(() => { img.style.opacity = "0"; }, 600);
  setTimeout(() => { img.remove(); }, 1400);
}

export default function HeroMouseEffect() {
  const divRef = useRef<HTMLDivElement>(null);
  const lastSpawnRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHoveringRef = useRef<boolean>(false);

  useEffect(() => {
    const parent = divRef.current?.parentElement;
    if (!parent) return;

    const isInTextArea = (x: number, y: number) => {
      const contentEl = parent.querySelector("[data-hero-content]");
      if (!contentEl) return false;
      const children = contentEl.querySelectorAll("h1, p, button, a");
      for (const child of children) {
        const rect = child.getBoundingClientRect();
        const padding = 16;
        if (
          x >= rect.left - padding &&
          x <= rect.right + padding &&
          y >= rect.top - padding &&
          y <= rect.bottom + padding
        ) return true;
      }
      return false;
    };

    const startAutoSpawn = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        if (isHoveringRef.current) return;
        const rect = parent.getBoundingClientRect();
        let x: number, y: number, attempts = 0;
        do {
          x = rect.left + Math.random() * rect.width;
          y = rect.top + Math.random() * rect.height;
          attempts++;
        } while (isInTextArea(x, y) && attempts < 10);
        if (!isInTextArea(x, y)) {
          spawnImage(x, y);
          let x2: number, y2: number, attempts2 = 0;
          do {
            x2 = rect.left + Math.random() * rect.width;
            y2 = rect.top + Math.random() * rect.height;
            attempts2++;
          } while (isInTextArea(x2, y2) && attempts2 < 10);
          if (!isInTextArea(x2, y2)) spawnImage(x2, y2);
        }
      }, 800);
    };

    const stopAutoSpawn = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
      stopAutoSpawn();
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      startAutoSpawn();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawnRef.current < 300) return;

      if (isInTextArea(e.clientX, e.clientY)) return;

      lastSpawnRef.current = now;
      spawnImage(e.clientX, e.clientY);
    };

    startAutoSpawn();
    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("mousemove", handleMouseMove);

    return () => {
      stopAutoSpawn();
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <div ref={divRef} className="hidden" />;
}
