"use client";

import { useEffect, useState } from "react";

const BASE_WIDTH = 1440;

export default function ViewportScaler({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => setScale(window.innerWidth / BASE_WIDTH);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      style={
        {
          zoom: scale,
          width: BASE_WIDTH,
          "--page-scale": scale,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
