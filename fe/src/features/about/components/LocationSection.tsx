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
    hours: "08.30 – 16.30 WIB",
    photo: "/esizesolo.png",
    borderColor: "#4273B2",
    titleColor: "#4273B2",
    rounded: "rounded-tl-3xl rounded-br-3xl",
    mapEmbed: "https://maps.google.com/maps?q=Ruko+Victoria,+Jalan+Tentara+Pelajar+No.+3,+Gilingan,+Banjarsari,+Surakarta,+Jawa+Tengah&output=embed&hl=id",
    mapLink: "https://maps.google.com/?q=Ruko+Victoria,+Jalan+Tentara+Pelajar+No.+3,+Gilingan,+Banjarsari,+Surakarta,+Jawa+Tengah",
  },
  {
    name: "Bandung",
    address: "Jl. Sukasirna No.30, RT.03/RW.12, Padasuka, Kec. Cibeunying Kidul, Kota Bandung, Jawa Barat 40122",
    hours: "08.30 – 16.30 WIB",
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
      <section className="bg-[#f0f0ee] py-12 md:py-16 px-4 sm:px-8 md:px-16">
        <h2 className="text-center text-[#7C6000] font-semibold text-3xl sm:text-4xl md:text-5xl mb-10 md:mb-18">
          Lokasi Kami
        </h2>

        <div className="flex flex-col md:flex-row gap-6 md:gap-15 justify-center items-stretch">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className={`w-full md:max-w-140 border-[6px] bg-[#fdf6f0] flex flex-col sm:flex-row p-4 gap-4 sm:gap-5 ${loc.rounded}`}
              style={{ borderColor: loc.borderColor }}
            >
              {/* Photo */}
              <div className="relative w-full sm:w-60 h-52 sm:h-60 shrink-0 overflow-hidden rounded-lg sm:rounded-none sm:self-center">
                <Image src={loc.photo} alt={loc.name} fill className="object-cover" />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center px-2 sm:px-7 py-2 sm:py-7 gap-3 sm:gap-4">
                <h3 className="font-bold text-2xl sm:text-3xl text-center" style={{ color: loc.titleColor }}>
                  {loc.name}
                </h3>
                <div className="flex items-start gap-3">
                  <svg className="flex-shrink-0 mt-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={loc.borderColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <p className="text-gray-500 text-sm leading-relaxed">{loc.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={loc.borderColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><polyline points="16 2 16 6" /><polyline points="8 2 8 6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 16 11 18 15 14" />
                  </svg>
                  <p className="text-gray-500 text-sm">{loc.hours}</p>
                </div>
                <button
                  onClick={() => setActiveLocation(loc)}
                  className="bg-[#C8A96E] hover:bg-[#b8973a] text-white font-semibold rounded-full py-3 px-6 transition-colors"
                >
                  Lihat Lokasi
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {activeLocation && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setActiveLocation(null)}
        >
          <div
            className={`bg-[#fdf6f0] border-[6px] w-full max-w-5xl p-5 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-8 relative my-4 sm:my-0 ${activeLocation.rounded}`}
            style={{ borderColor: activeLocation.borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveLocation(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors z-10"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Google Maps embed */}
            <div className="w-full sm:w-112.5 h-64 sm:h-112.5 shrink-0 rounded-2xl overflow-hidden">
              <iframe
                src={activeLocation.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Photo + button */}
            <div className="flex flex-col gap-4 sm:gap-5 justify-center items-center flex-1 min-w-0">
              <div className="relative w-full h-52 sm:h-72 md:h-96 rounded-2xl overflow-hidden">
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
