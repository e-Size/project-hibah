import Image from "next/image";
import FadeInLeft from "./components/FadeInLeft";
import FadeInRight from "./components/FadeInRight";
import SpinIn from "./components/SpinIn";
import FadeInUp from "./components/FadeInUp";
import CategoryCarousel from "./components/CategoryCarousel";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HeroMouseEffect from "./components/HeroMouseEffect";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar variant="transparent" />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <HeroMouseEffect />
        {/* Background Image */}
        <Image
          src="/bg hero section.png"
          alt="Merchandise background"
          fill
          className="object-cover object-center"
          priority
        />


        {/* Content */}
        <div data-hero-content className="relative z-10 w-full flex flex-col items-center text-center px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-black leading-tight mb-15 max-w-3xl">
            Solusi Terpercaya untuk Merchandise &amp; Promosi
          </h1>
          <p className="text-2xl text-black mb-10 max-w-3xl">
            Custom apparel dan promotional products berkualitas tinggi untuk kebutuhan bisnis Anda
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 rounded-[16px] bg-white text-gray-900 hover:bg-gray-100 transition-colors border-1 border-[#927615]">
              Lihat Produk
            </button>
            <button className="px-8 py-3 rounded-[16px] bg-[#927615] text-white hover:bg-[#6a6a2e] transition-colors border-1 border-[#927615]">
              Pesan Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#f5f5f3] py-20">
        <div className="w-full flex flex-col md:flex-row items-center gap-16 px-16 2xl:px-80">
          {/* Left */}
          <FadeInLeft className="flex-1">
            <h2 className="text-5xl font-bold mb-3">
              <span className="text-[#9F7A04]">About</span>{" "}
              <span className="text-[#7C6000]">Esize</span>
            </h2>
            <hr className="border-t-2 border-[#7C6000] mb-8 w-full" />
            <h3 className="text-3xl font-bold text-[#7C6000] mb-10 leading-tight">
              Produksi Seragam &amp; Souvenir<br />Skala Besar Tanpa Ribet
            </h3>
            <p className="text-xl text-[#7C6000] leading-tight mb-8">
              Sejak 2019, Esize melayani produksi konveksi dan souvenir skala<br />
              besar ke seluruh Indonesia hingga luar negeri. Didukung fasilitas<br />
              modern dan tim berpengalaman, kami menghadirkan kualitas<br />
              terjaga, proses efisien, dan pengiriman tepat waktu dengan harga<br />
              bersahabat.
            </p>
            <button className="px-6 py-2 rounded-full bg-[#DFAA14] text-white font-light hover:bg-[#7a6210] transition-colors">
              Selengkapnya →
            </button>
          </FadeInLeft>

          {/* Right - 2x2 Image Grid */}
          <div className="grid grid-cols-2 gap-2 w-[420px]">
            <FadeInLeft>
              <div className="rounded-tl-2xl rounded-br-2xl bg-[#4a7fc1] aspect-square relative p-3">
                <div className="relative w-full h-full rounded-tl-xl rounded-br-xl overflow-hidden">
                  <Image src="/ataskanan.png" alt="Produk 1" fill className="object-cover" />
                </div>
              </div>
            </FadeInLeft>
            <FadeInRight>
              <div className="rounded-tr-2xl rounded-bl-2xl bg-[#c0553a] aspect-square relative p-3">
                <div className="relative w-full h-full rounded-tr-xl rounded-bl-xl overflow-hidden">
                  <Image src="/ataskiri.png" alt="Produk 2" fill className="object-cover" />
                </div>
              </div>
            </FadeInRight>
            <FadeInLeft>
              <div className="rounded-tr-2xl rounded-bl-2xl bg-[#7C6000] aspect-square relative p-3">
                <div className="relative w-full h-full rounded-tr-xl rounded-bl-xl overflow-hidden">
                  <Image src="/bawahkiri.png" alt="Produk 3" fill className="object-cover" />
                </div>
              </div>
            </FadeInLeft>
            <FadeInRight>
              <div className="rounded-tl-2xl rounded-br-2xl bg-[#4a7fc1] aspect-square relative p-3">
                <div className="relative w-full h-full rounded-tl-xl rounded-br-xl overflow-hidden">
                  <Image src="/bawahkanan.png" alt="Produk 4" fill className="object-cover" />
                </div>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#f5f5f3] py-8 px-16 2xl:px-80">
        {/* Logo Top */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-1">
            <SpinIn>
              <Image src="/Rectangle 17.png" alt="logo" width={80} height={80} className="rotate-180" />
            </SpinIn>
            <SpinIn>
              <Image src="/Rectangle 19.png" alt="logo" width={80} height={80} className="rotate-180" />
            </SpinIn>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-[#c0553a] mb-12 mx-32" />

        {/* Stats */}
        <div className="flex justify-around mb-12 ">
          {[
            { value: "20.000+", label: "Customer" },
            { value: "20.000+", label: "Customer" },
            { value: "20.000+", label: "Customer" },
          ].map((stat, i) => (
            <FadeInUp key={i}>
              <div className="relative px-10 py-6">
                {/* Top-right corner */}
                <span className="absolute top-0 right-0 w-12 h-12 border-t-6 border-r-6 border-[#fae8e4]" />
                {/* Bottom-left corner */}
                <span className="absolute bottom-0 left-0 w-12 h-12 border-b-6 border-l-6 border-[#fae8e4]" />
                <p className="text-3xl font-bold text-[#927615]">{stat.value}</p>
                <p className="text-gray-600 text-center font-light">{stat.label}</p>
              </div>
            </FadeInUp>
          ))}
        </div>

        {/* Banner */}
        <FadeInUp>
          <div className="bg-[#d4795e] py-3 text-center mb-12 mx-48">
            <p className="text-white text-3xl font-bold">Pengiriman Dalam Negeri dan Luar Negeri</p>
          </div>
        </FadeInUp>

        {/* Divider */}
        <hr className="border-t-2 border-[#c0553a] mb-4 mx-32" />

        {/* Logo Bottom */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1">
            <SpinIn>
              <Image src="/Rectangle 19.png" alt="logo" width={80} height={80} />
            </SpinIn>
            <SpinIn>
              <Image src="/Rectangle 17.png" alt="logo" width={80} height={80} />
            </SpinIn>
          </div>
        </div>
      </section>
      {/* Kategori Produk Section */}
      <section className="bg-[#f5f5f3] py-16 px-16 2xl:px-80">
        <FadeInUp>
          <h2 className="text-3xl font-bold text-[#7C6000] mb-2">Kategori Produk</h2>
          <p className="text-gray-500 font-light mb-10">Berbagai pilihan merchandise berkualitas untuk kebutuhan Anda</p>
        </FadeInUp>

        <div className="mb-10">
          <CategoryCarousel />
        </div>

        <FadeInUp>
          <button className="px-8 py-2 rounded-full bg-[#DFAA14] text-white font-light hover:bg-[#c49510] transition-colors mx-6 shadow-lg">
            Lihat Semua Produk
          </button>
        </FadeInUp>
      </section>

      {/* How To Order Section */}
      <section className="bg-[#f5f5f3] py-16 px-16 2xl:px-80">
        <FadeInUp>
          <h2 className="text-5xl font-semibold text-[#7C6000] mb-2 mx-6">How To Order?</h2>
          <p className="text-black italic font-light mb-12 mx-6">Size the sequence, to your perfect size.</p>
        </FadeInUp>

        <div className="flex items-stretch mb-12">
          {[
            { num: "01", title: "Konsultasi Produk & Harga", desc: "Informasikan kebutuhan anda untuk produk yang di inginkan, lalu customer service kami akan memberikan pilihan produk yang sesuai dan harga nya" },
            { num: "02", title: "Pengisian Form Pemesanan", desc: "Klien yang telah menyetujui akan diberikan form yang berisi detail produk dan design pemesanan" },
            { num: "03", title: "Konsultasi Produk & Harga", desc: "Admin akan proses design sesuai dengan form yang sudah di setujui dan klien segera dapat payment" },
            { num: "04", title: "Konsultasi Produk & Harga", desc: "Proses produksi akan dimulai setelah pembayaran berhasil" },
            { num: "05", title: "Pengiriman dan Pelunasan", desc: "Admin Esize akan mengirimkan anda ke alamat pengiriman" },
          ].map((step, i) => (
            <FadeInUp key={step.num} className="flex items-start flex-1">
              <div className="flex-1 h-full bg-[#F8F3E9] rounded-2xl shadow-md overflow-hidden flex flex-col relative">
                <div className="flex-1 flex flex-col">
                  <div className="relative bg-[#e8e8e8] rounded-xl mx-4 mt-4 mb-4">
                    <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#DFAA14] flex items-center justify-center text-white text-sm font-bold z-10">
                      {step.num}
                    </span>
                    <div className="flex justify-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 px-4 pb-4">
                    <p className="font-bold text-gray-800 mb-2 text-sm">{step.title}</p>
                    <p className="text-gray-500 text-xs font-light leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                <div className="h-1 bg-[#d4795e] rounded-b-2xl" />
                {/* Right-side connector line: from gray area right edge to card right edge */}
                {i < 4 && <div className="absolute top-[76px] right-0 w-4 border-t border-gray-300" />}
              </div>
              {i < 4 && <div className="w-6 flex-shrink-0 border-t border-gray-300 mt-[76px]" />}
            </FadeInUp>
          ))}
        </div>

        <FadeInUp className="flex justify-center">
          <button className="px-4 py-3 rounded-full bg-[#DFAA14] text-white font-light hover:bg-[#c49510] transition-colors shadow-lg">
            Pesan Sekarang
          </button>
        </FadeInUp>
      </section>
      <Footer />
    </main>
  );
}
