"use client";

import Image from "next/image";
import { useState } from "react";
import FadeInUp from "../components/FadeInUp";
import { pakaian, merch } from "../data/categories";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import JacketModal from "../components/JacketModal";
import SpinIn from "../components/SpinIn";
const labelColors = ["#4a7fc1", "#d4795e", "#4a7fc1", "#d4795e"];

function CategoryGrid({ items, onJacketClick }: { items: { name: string; bg: string }[]; onJacketClick: () => void }) {
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
      {items.map((cat, i) => (
        <FadeInUp key={cat.name}>
          <div
            className="relative pt-10 pr-4 group cursor-pointer"
            onClick={cat.name === "Jacket" ? onJacketClick : undefined}
          >
            {/* Salmon layer - furthest back, more tilted */}
            <div className="absolute top-0 right-0 bottom-10 left-4 rounded-xl bg-[#E6B5A8] rotate-6 origin-bottom-left transition-transform duration-300 -translate-x-4 translate-y-4 group-hover:translate-x-5 group-hover:-translate-y-5" />
            {/* Blue layer - middle, slightly tilted */}
            <div className="absolute top-4 right-2 bottom-6 left-2 rounded-xl bg-[#93B1D8] rotate-3 origin-bottom-left transition-transform duration-300 -translate-x-3 translate-y-3 group-hover:translate-x-2 group-hover:-translate-y-2" />
            {/* Main card */}
            <div className="relative border-4 border-[#927615] rounded-t-xl overflow-hidden bg-white">
              <div className="aspect-square relative overflow-hidden">
                <Image src="/baju.png" alt={cat.name} fill className="object-cover" />
              </div>
              <div className="py-3 text-center" style={{ backgroundColor: labelColors[i % 4] }}>
                <p className="text-white font-bold text-lg">{cat.name}</p>
              </div>
            </div>
          </div>
        </FadeInUp>
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const [jacketOpen, setJacketOpen] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();
  const filteredPakaian = pakaian.filter((c) => c.name.toLowerCase().includes(q));
  const filteredMerch = merch.filter((c) => c.name.toLowerCase().includes(q));
  const hasResults = filteredPakaian.length > 0 || filteredMerch.length > 0;

  return (
    <main className="min-h-screen bg-white">
      {jacketOpen && <JacketModal onClose={() => setJacketOpen(false)} />}
      <Navbar variant="transparent" />
      {/* Hero Header */}
      <div className="relative flex flex-col items-center justify-center text-center pt-20 pb-16 px-8"
        style={{ background: "radial-gradient(ellipse at 50% 40%, #f5d0c0 0%, #fceee8 35%, #ffffff 70%)" }}>
        {/* Title blocks */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="bg-[#7C6000] text-white font-bold text-4xl md:text-5xl px-8 py-2">
            Katalog Produk
          </span>
          <span className="bg-[#7C6000] text-white font-bold text-4xl md:text-5xl px-8 py-2 w-full text-center">
            Apparel &amp; Merchandise
          </span>
        </div>

        {/* Subtitle */}
        <p className="text-[#7C6000] text-l max-w-2xl mb-10 leading-snug">
          Temukan berbagai pilihan pakaian dan merchandise custom untuk<br />
          kebutuhan event, organisasi, corporate, dan brand kamu
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-2 border-2 border-[#7C6000] rounded-full px-5 py-3 w-full max-w-lg bg-white/80 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
          )}
        </div>

        {/* Chevron */}
        <Image src="/Line 14.png" alt="scroll down" width={96} height={64} />
      </div>

      {!hasResults && (
        <div className="text-center py-24 text-[#7C6000] text-xl">
          Produk &quot;{query}&quot; tidak ditemukan.
        </div>
      )}

      {/* Pakaian Section */}
      {filteredPakaian.length > 0 && (
        <div className="px-16 2xl:px-80 pt-16 pb-4">
          <FadeInUp>
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-center gap-1 mb-4">
                <SpinIn><Image src="/Rectangle 17.png" alt="logo" width={100} height={100} /></SpinIn>
                <SpinIn><Image src="/Rectangle 19.png" alt="logo" width={100} height={100} /></SpinIn>
              </div>
              <div className="relative px-16 py-5">
                <span className="absolute top-0 right-0 w-20 h-12 border-t-6 border-r-6 border-[#fae8e4]" />
                <span className="absolute bottom-0 left-0 w-20 h-12 border-b-6 border-l-6 border-[#fae8e4]" />
                <p className="text-[#4a7fc1] text-3xl font-bold">Pakaian</p>
              </div>
            </div>
          </FadeInUp>
          <CategoryGrid items={filteredPakaian} onJacketClick={() => setJacketOpen(true)} />
        </div>
      )}

      {/* Merch Section */}
      {filteredMerch.length > 0 && (
        <div className="px-16 2xl:px-80 pt-16 pb-16">
          <FadeInUp>
            <div className="flex flex-col items-center mb-12">
              <div className="flex items-center gap-1 mb-4">
                <SpinIn><Image src="/Rectangle 17.png" alt="logo" width={100} height={100} /></SpinIn>
                <SpinIn><Image src="/Rectangle 19.png" alt="logo" width={100} height={100} /></SpinIn>
              </div>
              <div className="relative px-16 py-5">
                <span className="absolute top-0 right-0 w-20 h-12 border-t-6 border-r-6 border-[#fae8e4]" />
                <span className="absolute bottom-0 left-0 w-20 h-12 border-b-6 border-l-6 border-[#fae8e4]" />
                <p className="text-[#4a7fc1] text-3xl font-bold">Merch</p>
              </div>
            </div>
          </FadeInUp>
          <CategoryGrid items={filteredMerch} onJacketClick={() => setJacketOpen(true)} />
        </div>
      )}

      <Footer />
    </main>
  );
}
