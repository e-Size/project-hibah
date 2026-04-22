"use client";
import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

export type TourStep = {
  targetRef: RefObject<HTMLElement | null>;
  title: string;
  description: string;
  placement?: "right" | "bottom" | "left" | "top";
};

export default function OnboardingTour({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const el = steps[current]?.targetRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current, steps]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!rect) return null;

  const step = steps[current];
  const placement = step.placement ?? "right";
  const gap = 24;
  const popupWidth = 320;

  const popupStyle: React.CSSProperties = {};
  const arrowStyle: React.CSSProperties = {};

  if (placement === "right") {
    popupStyle.left = rect.right + gap;
    popupStyle.top = rect.top + rect.height / 2;
    popupStyle.transform = "translateY(-50%)";
    arrowStyle.left = -6;
    arrowStyle.top = "50%";
    arrowStyle.transform = "translateY(-50%) rotate(45deg)";
  } else if (placement === "left") {
    popupStyle.left = rect.left - gap - popupWidth;
    popupStyle.top = rect.top + rect.height / 2;
    popupStyle.transform = "translateY(-50%)";
    arrowStyle.right = -6;
    arrowStyle.top = "50%";
    arrowStyle.transform = "translateY(-50%) rotate(45deg)";
  } else if (placement === "bottom") {
    popupStyle.left = rect.left + rect.width / 2;
    popupStyle.top = rect.bottom + gap;
    popupStyle.transform = "translateX(-50%)";
    arrowStyle.top = -6;
    arrowStyle.left = "50%";
    arrowStyle.transform = "translateX(-50%) rotate(45deg)";
  } else {
    popupStyle.left = rect.left + rect.width / 2;
    popupStyle.top = rect.top - gap;
    popupStyle.transform = "translate(-50%, -100%)";
    arrowStyle.bottom = -6;
    arrowStyle.left = "50%";
    arrowStyle.transform = "translateX(-50%) rotate(45deg)";
  }

  const next = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
    else onClose();
  };

  const progress = ((current + 1) / steps.length) * 100;
  const isLast = current === steps.length - 1;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />

      <div
        className="fixed z-[9999] rounded-xl pointer-events-none"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow:
            "0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 24px 6px rgba(255, 255, 255, 0.45)",
        }}
      />

      <div
        className="fixed z-[10000] bg-white rounded-2xl shadow-2xl p-6"
        style={{ ...popupStyle, width: popupWidth }}
      >
        <div
          className="absolute w-3 h-3 bg-white"
          style={arrowStyle}
        />

        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h3 className="font-bold text-lg text-gray-900 mb-3 pr-6">{step.title}</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{step.description}</p>

        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {current + 1} dari {steps.length}
          </span>
          <button
            onClick={next}
            className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isLast ? "Selesai" : "Selanjutnya"}
          </button>
        </div>
      </div>
    </>
  );
}
