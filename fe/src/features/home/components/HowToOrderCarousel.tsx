"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import FadeInUp from "../../../components/animation/FadeInUp";

const steps = [
  {
    num: "01",
    img: "/howto1.png",
    title: "Konsultasi Produk & Harga",
    desc: "Informasikan kebutuhan anda untuk produk yang di inginkan, lalu customer service kami akan memberikan pilihan produk yang sesuai dan harga nya",
  },
  {
    num: "02",
    img: "/howto2.png",
    title: "Pengisian Form Pemesanan",
    desc: "Klien yang telah menyetujui akan diberikan form yang berisi detail produk dan design pemesanan",
  },
  {
    num: "03",
    img: "/howto3.png",
    title: "Invoice & Pembayaran",
    desc: "Admin akan proses design sesuai dengan form yang sudah di setujui dan klien segera dapat payment",
  },
  {
    num: "04",
    img: "/howto4.png",
    title: "Proses Produksi",
    desc: "Proses produksi akan dimulai setelah pembayaran berhasil",
  },
  {
    num: "05",
    img: "/howto5.png",
    title: "Pengiriman dan Pelunasan",
    desc: "Admin Esize akan mengirimkan anda ke alamat pengiriman",
  },
];

export default function HowToOrderCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const goTo = (idx: number) => {
    setCurrent(Math.max(0, Math.min(steps.length - 1, idx)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 8) isDragging.current = true;
    const clamped =
      current === 0 && delta > 0 ? delta / 3 :
      current === steps.length - 1 && delta < 0 ? delta / 3 :
      delta;
    setDragDelta(clamped);
  };

  const handleTouchEnd = () => {
    if (dragDelta < -50) goTo(current + 1);
    else if (dragDelta > 50) goTo(current - 1);
    setDragDelta(0);
    touchStartX.current = null;
  };

  return (
    <>
      {/* ── Mobile carousel (< lg) ── */}
      <div className="lg:hidden mb-6">
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${current * 100}% + ${dragDelta}px))`,
              transition: dragDelta !== 0 ? "none" : "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
            }}
          >
            {steps.map((step) => (
              <div key={step.num} className="w-full flex-none px-1 select-none">
                <div className="bg-[#F8F3E9] rounded-2xl shadow-md overflow-hidden flex flex-col">
                  {/* Image block */}
                  <div className="relative bg-[#e8e8e8] rounded-xl mx-4 mt-4 mb-4 overflow-hidden">
                    <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#DFAA14] flex items-center justify-center text-white text-sm font-bold z-10">
                      {step.num}
                    </span>
                    <div className="relative w-full h-48">
                      <Image src={step.img} alt={step.title} fill className="object-cover pointer-events-none" />
                    </div>
                  </div>
                  {/* Text block */}
                  <div className="px-5 pb-5">
                    <p className="font-bold text-gray-800 mb-2">{step.title}</p>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="h-1.5 bg-[#d4795e] rounded-b-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation: arrow ← dots → arrow */}
        <div className="flex items-center justify-between px-1 mt-5">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-25 transition-opacity active:scale-95"
            aria-label="Langkah sebelumnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-[#d4795e]" : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Pergi ke langkah ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(current + 1)}
            disabled={current === steps.length - 1}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-25 transition-opacity active:scale-95"
            aria-label="Langkah berikutnya"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">
          Langkah {current + 1} dari {steps.length}
        </p>
      </div>

      {/* ── Desktop flex row (≥ lg) ── */}
      <div className="hidden lg:flex lg:items-stretch mb-12">
        {steps.map((step, i) => (
          <FadeInUp key={step.num} className="flex items-start flex-1">
            <div className="flex-1 h-full bg-[#F8F3E9] rounded-2xl shadow-md overflow-hidden flex flex-col relative transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-xl">
              <div className="flex-1 flex flex-col">
                <div className="relative bg-[#e8e8e8] rounded-xl mx-4 mt-4 mb-4 overflow-hidden">
                  <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#DFAA14] flex items-center justify-center text-white text-sm font-bold z-10">
                    {step.num}
                  </span>
                  <div className="relative w-full h-30">
                    <Image src={step.img} alt={step.title} fill className="object-cover" />
                  </div>
                </div>
                <div className="flex-1 px-4 pb-4">
                  <p className="font-bold text-gray-800 mb-2 text-sm">{step.title}</p>
                  <p className="text-gray-500 text-xs font-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
              <div className="h-1 bg-[#d4795e] rounded-b-2xl" />
              {i < 4 && <div className="absolute top-19 right-0 w-4 border-t border-gray-300" />}
            </div>
            {i < 4 && <div className="w-6 shrink-0 border-t border-gray-300 mt-19" />}
          </FadeInUp>
        ))}
      </div>
    </>
  );
}
