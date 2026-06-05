"use client";
import { useEffect, useState } from "react";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setReady(true);
    const t = setTimeout(() => setHidden(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!hidden && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#e8e8e6] transition-opacity duration-500"
          style={{ opacity: ready ? 0 : 1, pointerEvents: ready ? "none" : "auto" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#7C6000] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
