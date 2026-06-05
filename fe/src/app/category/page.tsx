"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FadeInUp from "../../components/animation/FadeInUp";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import SpinIn from "../../components/animation/SpinIn";
import ViewportScaler from "../../components/ui/ViewportScaler";
import { useProducts } from "../../hooks/useProducts";
import type { CategoryItem } from "../../types/product";
import ProductModal from "../../features/category/components/ProductModal";
import { labelColors } from "../../constants";
import { matchesCategory } from "../../utils/search";

function ProductCard({ cat, i, onProductClick }: { cat: CategoryItem; i: number; onProductClick: (product: CategoryItem) => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  return (
    <FadeInUp>
      <div
        className="relative pt-10 pr-4 group cursor-pointer"
        onClick={() => onProductClick(cat)}
      >
        <div className="absolute top-0 right-0 bottom-10 left-4 rounded-xl bg-[#E6B5A8] rotate-6 origin-bottom-left transition-transform duration-300 -translate-x-4 translate-y-4 group-hover:translate-x-5 group-hover:-translate-y-5" />
        <div className="absolute top-4 right-2 bottom-6 left-2 rounded-xl bg-[#93B1D8] rotate-3 origin-bottom-left transition-transform duration-300 -translate-x-3 translate-y-3 group-hover:translate-x-2 group-hover:-translate-y-2" />
        <div className="relative border-4 border-[#927615] rounded-t-xl overflow-hidden bg-white transition-transform duration-300 group-hover:scale-105">
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-200" />
            )}
            <Image
              src={cat.image || "/baju.png"}
              alt={cat.name}
              fill
              className={`object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
            />
          </div>
          <div className="py-2 md:py-3 text-center" style={{ backgroundColor: cat.bg || labelColors[i % 4] }}>
            {imgLoaded ? (
              <p className="text-white font-bold text-sm md:text-lg">{cat.name}</p>
            ) : (
              <div className="mx-auto h-4 w-20 rounded animate-pulse bg-white/40" />
            )}
          </div>
        </div>
      </div>
    </FadeInUp>
  );
}

function CategoryGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-20 px-4 sm:px-8 md:px-16">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="relative pt-10 pr-4">
          <div className="absolute top-0 right-0 bottom-10 left-4 rounded-xl bg-[#E6B5A8]/50 rotate-6" />
          <div className="absolute top-4 right-2 bottom-6 left-2 rounded-xl bg-[#93B1D8]/50 rotate-3" />
          <div className="relative border-4 border-[#927615]/30 rounded-t-xl overflow-hidden">
            <div className="aspect-square animate-pulse bg-gray-200" />
            <div className="py-2 md:py-3 flex justify-center bg-gray-200 animate-pulse">
              <div className="h-4 w-20 rounded bg-gray-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryGrid({ items, isLoading, onProductClick }: { items: CategoryItem[]; isLoading: boolean; onProductClick: (product: CategoryItem) => void }) {
  if (isLoading) return <CategoryGridSkeleton count={6} />;
  if (items.length === 0) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-20 px-4 sm:px-8 md:px-16">
      {items.map((cat, i) => (
        <ProductCard key={cat.id ?? cat.name} cat={cat} i={i} onProductClick={onProductClick} />
      ))}
    </div>
  );
}

function SectionHeader({ title, showLogos }: { title: string; showLogos: boolean }) {
  return (
    <FadeInUp>
      <div className="flex flex-col items-center mb-8 md:mb-12">
        {showLogos && (
          <div className="flex items-center gap-1 mb-4">
            <SpinIn><Image src="/Rectangle 17.png" alt="logo" width={100} height={100} /></SpinIn>
            <SpinIn><Image src="/Rectangle 19.png" alt="logo" width={100} height={100} /></SpinIn>
          </div>
        )}
        <div className="relative px-8 sm:px-16 py-5">
          <span className="absolute top-0 right-0 w-20 h-12 border-t-6 border-r-6 border-[#fae8e4]" />
          <span className="absolute bottom-0 left-0 w-20 h-12 border-b-6 border-l-6 border-[#fae8e4]" />
          <p className="text-[#4a7fc1] text-2xl sm:text-3xl font-bold">{title}</p>
        </div>
      </div>
    </FadeInUp>
  );
}

export default function CategoryPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<CategoryItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleProductClick = (cat: CategoryItem) => {
    if (isMobile && cat.id) {
      router.push(`/product/${cat.id}`);
    } else {
      setSelectedProduct(cat);
    }
  };
  const pakaianProducts = useProducts("pakaian");
  const merchProducts = useProducts("merch");

  const filteredPakaian = pakaianProducts.items.filter((c) => matchesCategory(c, query));
  const filteredMerch = merchProducts.items.filter((c) => matchesCategory(c, query));
  const hasResults = filteredPakaian.length > 0 || filteredMerch.length > 0;
  const isLoading = pakaianProducts.isLoading || merchProducts.isLoading;

  return (
    <ViewportScaler>
    <main className="min-h-screen bg-white">
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <Navbar variant="transparent" />
      {/* Hero Header */}
      <div
        className={`relative flex flex-col items-center text-center px-4 sm:px-8 transition-all duration-300 ${
          query
            ? "pt-20 pb-4"
            : "pt-20 min-h-screen md:min-h-0 md:pb-16"
        }`}
        style={{ background: "radial-gradient(ellipse at 50% 40%, #f5d0c0 0%, #fceee8 35%, #ffffff 70%)" }}
      >

        {/* Main content group */}
        <div className="flex flex-col items-center w-full md:my-auto">
          {/* Title + subtitle — sembunyikan di mobile saat search aktif */}
          <div className={`flex flex-col items-center w-full md:contents transition-all duration-200 ${query ? "hidden" : ""}`}>
            <div className="flex flex-col items-center gap-2 mb-6 mt-16 sm:mt-32 md:mt-40">
              <span className="bg-[#7C6000] text-white font-bold text-2xl sm:text-4xl md:text-5xl px-4 sm:px-8 py-2">
                Katalog Produk
              </span>
              <span className="bg-[#7C6000] text-white font-bold text-2xl sm:text-4xl md:text-5xl px-4 sm:px-8 py-2 w-full text-center">
                Apparel &amp; Merchandise
              </span>
            </div>
            <p className="text-[#7C6000] text-sm sm:text-base max-w-2xl mb-8 md:mb-10 leading-snug px-2">
              Temukan berbagai pilihan pakaian dan merchandise custom untuk
              kebutuhan event, organisasi, corporate, dan brand kamu.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 border-2 border-[#7C6000] rounded-full px-4 sm:px-5 py-3 w-full max-w-sm sm:max-w-lg bg-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="flex-1 bg-transparent outline-none text-base md:text-sm text-gray-700 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            )}
          </div>
        </div>

        {/* Chevron — pinned to bottom of viewport on mobile via mt-auto */}
        <button
          onClick={() => {
            const target = document.getElementById("section-pakaian");
            if (!target) return;
            const start = window.scrollY;
            const end = target.getBoundingClientRect().top + window.scrollY;
            const duration = 1200;
            const startTime = performance.now();
            const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const step = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              window.scrollTo(0, start + (end - start) * ease(progress));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }}
          className={`mt-auto mb-8 md:mb-0 md:mt-6 cursor-pointer transition-opacity duration-200 ${query ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <Image src="/Line 14.png" alt="scroll down" width={96} height={64} />
        </button>
      </div>

      {!hasResults && !isLoading && (
        <div className="text-center py-16 md:py-24 text-[#7C6000] text-lg md:text-xl px-4">
          Produk &quot;{query}&quot; tidak ditemukan.
        </div>
      )}

      {/* Pakaian Section */}
      <div id="section-pakaian" className={`px-0 pb-4 ${query ? "pt-4" : "pt-12 md:pt-16"}`}>
        <SectionHeader title="Pakaian" showLogos={!query} />
        <CategoryGrid items={filteredPakaian} isLoading={isLoading} onProductClick={handleProductClick} />
      </div>

      {/* Merch Section */}
      <div className={`px-0 pb-12 md:pb-16 ${query ? "pt-4" : "pt-12 md:pt-16"}`}>
        <SectionHeader title="Merch" showLogos={!query} />
        <CategoryGrid items={filteredMerch} isLoading={isLoading} onProductClick={handleProductClick} />
      </div>

      <Footer />
    </main>
    </ViewportScaler>
  );
}
