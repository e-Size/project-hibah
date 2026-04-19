"use client";

import { useState } from "react";
import Image from "next/image";

const TIPE = ["Bomber", "Parka", "Coach", "Varsity", "Semi Parka/Trucker"];

const BAHAN = [
  {
    name: "Taslan/Soft Parasut",
    desc: "Bahan ini biasanya digunakan pada pakaian olahraga atau aktivitas outdoor, karena dapat melindungi dari angin dan air.",
    img: "/American Drill.png",
  },
  {
    name: "Scott Purna",
    desc: "Terbuat dari polyster dan silk dengan tingkat konsentrasi tinggi, sehingga kainnya halus dan tekstur yang rapi. Scott puma biasanya digunakan pada jaket bomber dan coach.",
    img: "/Japan Drill.png",
  },
];

const WARNA = [
  { name: "Hitam", hex: "#111111", border: "#927615" },
  { name: "Navy", hex: "#1a3a6b", border: "transparent" },
  { name: "Maroon", hex: "#6b1a1a", border: "transparent" },
  { name: "Hijau Tua", hex: "#1a4a2a", border: "transparent" },
  { name: "Cream", hex: "#e8d5b0", border: "transparent" },
  { name: "Ungu", hex: "#8b1a8b", border: "transparent" },
];

interface Props {
  onClose: () => void;
}

export default function JacketModal({ onClose }: Props) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [selectedTipe, setSelectedTipe] = useState("Bomber");
  const [selectedBahan, setSelectedBahan] = useState("Taslan/Soft Parasut");
  const [selectedWarna, setSelectedWarna] = useState("Hitam");
  const [qty, setQty] = useState(24);
  const [imgIndex, setImgIndex] = useState(0);
  const images = ["/H2.png", "/H2.png", "/H2.png", "/H2.png", "/H2.png"];

  return (
    <>
    {sizeGuideOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60" onClick={() => setSizeGuideOpen(false)}>
        <div className="relative max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
          <Image src="/jacketbooklet.png" alt="Size Guide" width={800} height={600} className="w-full h-auto rounded-xl shadow-2xl" />
        </div>
      </div>
    )}
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[#fdf6f0] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 p-6 relative flex flex-col md:flex-row gap-6 h-[74vh] 2xl:h-[58vh]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Left — image carousel (fixed, no scroll) */}
        <div className="flex flex-col items-center gap-3 md:w-[45%] flex-shrink-0 overflow-hidden">
          <div className="relative w-full aspect-square bg-[#7a6a30] rounded-xl overflow-hidden flex items-center justify-center mb-5" style={{ minHeight: "380px" }}>
            <Image src={images[imgIndex]} alt="Jacket" fill className="object-contain p-6 " />
            <button
              onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-700 hover:bg-gray-100"
            >
              ‹
            </button>
            <button
              onClick={() => setImgIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-700 hover:bg-gray-100"
            >
              ›
            </button>
            <div className="absolute bottom-3 flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`h-2 rounded-full cursor-pointer transition-all ${i === imgIndex ? "bg-white w-5" : "bg-white/50 w-2"}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${i === imgIndex ? "border-[#927615]" : "border-transparent"} bg-[#7a6a30]`}
              >
                <Image src={src} alt="" width={56} height={56} className="object-contain w-full h-full p-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Right — scrollable product info */}
        <div className="flex flex-col gap-4 md:w-[55%] overflow-y-auto pr-1 h-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedTipe} Jacket Premium</h2>
            <p className="text-[#e8734a] font-bold text-2xl mt-1">Rp150.000</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Jaket varsity premium dengan kualitas jahitan terbaik dan desain yang bisa dicustom sesuai keinginan. Tersedia berbagai pilihan tipe, bahan, dan warna!
            </p>
          </div>

          {/* Tipe */}
          <div>
            <p className="font-bold text-gray-800 mb-2">Pilih Tipe Jaket</p>
            <div className="flex flex-wrap gap-2">
              {TIPE.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTipe(t)}
                  className={`px-4 py-1.5 rounded-full border text-sm transition-colors ${
                    selectedTipe === t
                      ? "bg-[#e8734a] border-[#e8734a] text-white"
                      : "border-gray-300 text-gray-700 hover:border-[#e8734a]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Bahan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-gray-800 flex items-center gap-1">
                <span>📦</span> Pilih Bahan
              </p>
              <button onClick={() => setSizeGuideOpen(true)} className="text-[#4273B2] text-sm flex items-center gap-1 hover:underline">
                Size Guide →
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {BAHAN.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSelectedBahan(b.name)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedBahan === b.name
                      ? "border-[#4273B2] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 relative">
                    <Image src={b.img} alt={b.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-sm">{b.name}</p>
                      {selectedBahan === b.name && (
                        <span className="w-5 h-5 rounded-full bg-[#4273B2] flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warna */}
          <div>
            <p className="font-bold text-gray-800 mb-2">
              Pilih Warna: <span className="text-[#e8734a]">{selectedWarna}</span>
            </p>
            <div className="flex gap-3 pl-2 flex-wrap">
              {WARNA.map((w) => (
                <button
                  key={w.name}
                  onClick={() => setSelectedWarna(w.name)}
                  title={w.name}
                  className="w-10 h-10 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: w.hex,
                    outline: selectedWarna === w.name ? "3px solid #927615" : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Qty */}
          <div>
            <p className="font-bold text-gray-800 mb-2">Jumlah Pesanan (pcs)<span className="text-red-500">*</span></p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(24, q - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value === "" ? 0 : Number(e.target.value))}
                onBlur={() => setQty((q) => (q < 24 ? 24 : q))}
                className="flex-1 text-center border border-gray-300 rounded-lg py-2 text-gray-800 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-1 text-center">Minimum order jacket adalah 24</p>
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/6281385774811?text=${encodeURIComponent(
              `Halo Esize! Saya ingin memesan:\n\n` +
              `*Produk:* ${selectedTipe} Jacket Premium\n` +
              `*Tipe:* ${selectedTipe}\n` +
              `*Bahan:* ${selectedBahan}\n` +
              `*Warna:* ${selectedWarna}\n` +
              `*Jumlah:* ${qty} pcs\n\n` +
              `Mohon info lebih lanjut mengenai harga dan proses pemesanan. Terima kasih!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-base rounded-xl py-4 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            ORDER VIA WHATSAPP
          </a>

          <div className="border border-yellow-300 bg-yellow-50 rounded-xl py-3 text-center text-sm text-gray-500">
            ✨ Harga yang tertera hanya patokan
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
