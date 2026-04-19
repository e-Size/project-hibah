"use client";

import { useState } from "react";
import Image from "next/image";

type Location = {
  name: string;
  address: string;
  hours: string;
  photo: string;
  borderColor: string;
  titleColor: string;
  rounded: string;
  mapEmbed: string;
  mapLink: string;
};

const locations: Location[] = [
  {
    name: "Surakarta",
    address: "Ruko Victoria, Jalan Tentara Pelajar No. 3, Gilingan, Kec. Banjarsari, Kota Surakarta, Jawa Tengah 57134",
    hours: "10.00 – 19.00 WIB",
    photo: "/lokasi1.png",
    borderColor: "#4273B2",
    titleColor: "#4273B2",
    rounded: "rounded-tl-3xl rounded-br-3xl",
    mapEmbed: "https://maps.google.com/maps?q=Ruko+Victoria,+Jalan+Tentara+Pelajar+No.+3,+Gilingan,+Banjarsari,+Surakarta,+Jawa+Tengah&output=embed&hl=id",
    mapLink: "https://maps.google.com/?q=Ruko+Victoria,+Jalan+Tentara+Pelajar+No.+3,+Gilingan,+Banjarsari,+Surakarta,+Jawa+Tengah",
  },
  {
    name: "Bandung",
    address: "Jl. Sukasirna No.30, RT.03/RW.12, Padasuka, Kec. Cibeunying Kidul, Kota Bandung, Jawa Barat 40122",
    hours: "10.00 – 19.00 WIB",
    photo: "/lokasi2.png",
    borderColor: "#e8734a",
    titleColor: "#e8734a",
    rounded: "rounded-tr-3xl rounded-bl-3xl",
    mapEmbed: "https://maps.google.com/maps?q=Jl.+Sukasirna+No.30,+Padasuka,+Cibeunying+Kidul,+Bandung,+Jawa+Barat&output=embed&hl=id",
    mapLink: "https://maps.google.com/?q=Jl.+Sukasirna+No.30,+Padasuka,+Cibeunying+Kidul,+Bandung,+Jawa+Barat",
  },
];

export default function LocationSection() {
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);

  return (
    <>
      {/* Location Cards */}
      <section className="bg-[#f0f0ee] py-16 px-16 2xl:px-80">
        <h2 className="text-center text-[#7C6000] font-semibold text-5xl mb-18">Lokasi Kami</h2>
        <div className="flex flex-col md:flex-row gap-15">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className={`flex-1 border-[6px] bg-[#fdf6f0] flex flex-row p-4 gap-5 ${loc.rounded}`}
              style={{ borderColor: loc.borderColor }}
            >
              <div className="relative w-60 h-60 flex-shrink-0 overflow-hidden self-center">
                <Image src={loc.photo} alt={loc.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center px-7 py-7 gap-4">
                <h3 className="font-bold text-3xl text-center" style={{ color: loc.titleColor }}>{loc.name}</h3>
                <div className="flex items-start gap-3">
                  <svg className="flex-shrink-0 mt-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={loc.borderColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <p className="text-gray-500 text-sm leading-relaxed">{loc.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={loc.borderColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><polyline points="16 2 16 6"/><polyline points="8 2 8 6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>
                  <p className="text-gray-500 text-sm">{loc.hours}</p>
                </div>
                <button
                  onClick={() => setActiveLocation(loc)}
                  className="bg-[#C8A96E] hover:bg-[#b8973a] text-white font-semibold rounded-full py-3 px-6 transition-colors"
                >
                  {loc.name === "Bandung" ? "Lihat Lokasi" : "Lihat Lokasi"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {activeLocation && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
          onClick={() => setActiveLocation(null)}
        >
          <div
            className={`bg-[#fdf6f0] border-[6px] w-full max-w-5xl p-8 flex flex-col sm:flex-row gap-8 relative ${activeLocation.rounded}`}
            style={{ borderColor: activeLocation.borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveLocation(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {/* Google Maps embed */}
            <div className="w-[450px] h-[450px] flex-shrink-0 rounded-2xl overflow-hidden">
              <iframe
                src={activeLocation.mapEmbed}
                width="520"
                height="520"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Photo + button */}
            <div className="flex flex-col gap-5 justify-center items-center sm:w-96 flex-shrink-0">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden">
                <Image src={activeLocation.photo} alt={activeLocation.name} fill className="object-cover" />
              </div>
              <a
                href={activeLocation.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#C8A96E] hover:bg-[#b8973a] text-white font-semibold rounded-full py-3 px-6 transition-colors text-center"
              >
                Lihat Lokasi di Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
