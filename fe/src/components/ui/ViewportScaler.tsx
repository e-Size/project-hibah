"use client";

import { useEffect, useState } from "react";

const BASE_WIDTH = 1440;
const MOBILE_BREAKPOINT = 1024; // below this → real responsive layout; above → zoom to desktop

export default function ViewportScaler({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<React.CSSProperties>({
    width: "100%",
    "--page-scale": 1,
  } as React.CSSProperties);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width < MOBILE_BREAKPOINT) {
        setStyle({ width: "100%", "--page-scale": 1 } as React.CSSProperties);
      } else {
        const scale = width / BASE_WIDTH;
        setStyle({ zoom: scale, width: BASE_WIDTH, "--page-scale": scale } as React.CSSProperties);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return <div style={style}>{children}</div>;
}
