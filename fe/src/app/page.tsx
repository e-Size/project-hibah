import Image from "next/image";
import Link from "next/link";
import RippleLink from "../components/ui/RippleLink";
import FadeInLeft from "../components/animation/FadeInLeft";
import FadeInRight from "../components/animation/FadeInRight";
import SpinIn from "../components/animation/SpinIn";
import FadeInUp from "../components/animation/FadeInUp";
import ParallaxScroll from "../components/animation/ParallaxScroll";
import CategoryCarousel from "../features/home/components/CategoryCarousel";
import HowToOrderCarousel from "../features/home/components/HowToOrderCarousel";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import ViewportScaler from "../components/ui/ViewportScaler";

export default function Home() {
  return (
    <ViewportScaler>
      <main className="min-h-screen" style={{ margin: 0, padding: 0 }}>
        <Navbar variant="transparent" />

        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden flex flex-col h-screen md:block md:h-[calc(100vh/var(--page-scale,1))]">
          <Image
            src="/bg herokeren.png"
            alt="Hero background"
            fill
            className="object-cover object-[30%_center] md:object-center -z-10"
            priority
          />

          {/* Gradient overlay: vertical on mobile, horizontal on desktop */}
          <div className="absolute inset-0 bg-linear-to-b from-white/70 via-white/50 to-white/20 md:hidden" />
          <div className="absolute inset-0 hidden md:block bg-linear-to-r from-white/65 via-white/35 to-transparent" />

          {/* Hero content */}
          <div className="relative z-10 flex flex-col shrink-0 w-full md:max-w-5xl md:h-full items-start md:justify-start text-left pt-16 sm:pt-20 md:pt-40 pb-3 md:pb-20 px-6 sm:px-8 md:px-16 2xl:px-32">
            <h1 className="font-(family-name:--font-red-rose) text-2xl md:text-3xl xl:text-6xl text-black leading-tight mb-3 md:mb-8 uppercase">
              Solusi Terpercaya{" "}
              <br className="hidden sm:block" />
              untuk Merchandise &amp;
              <br className="hidden sm:block" /> Promosi
            </h1>

            <p className="font-(family-name:--font-red-rose) text-sm md:text-base text-black mb-6 md:mb-10 max-w-sm md:max-w-md">
              Custom apparel dan promotional products berkualitas tinggi untuk kebutuhan bisnis Anda
            </p>

            {/* CTA buttons — one row on all sizes */}
            <div className="flex flex-row gap-2 md:gap-4">
              <Link
                href="/category"
                className="px-4 py-2 md:px-8 md:py-3 rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-colors border border-[#C0980D] text-xs md:text-sm font-medium text-center"
              >
                Lihat Produk
              </Link>
              <a
                href="https://wa.me/6281223344556"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 md:px-8 md:py-3 rounded-full bg-[#C0980D] text-white hover:bg-[#a07a0b] transition-colors text-xs md:text-sm font-medium text-center shadow-md"
              >
                Pesan Sekarang
              </a>
            </div>

            {/* Contact info — inline below CTAs on mobile only */}
            <div className="hidden flex-wrap justify-center gap-4 mt-6 md:hidden font-(family-name:--font-poppins) font-normal text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Image src="/Vector-2.png" alt="" width={20} height={20} className="h-4 w-auto" />
                <span>esize.id</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image src="/Vector.png" alt="" width={20} height={20} className="h-4 w-auto" />
                <span>085156043052</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Image src="/ph_tiktok-logo.png" alt="" width={20} height={20} className="h-4 w-auto" />
                <span>esize.konveksi</span>
              </div>
            </div>

            {/* Scroll hint — mobile only */}
            <div className="hidden flex-col items-center gap-1 mt-8 md:hidden animate-bounce opacity-60">
              <span className="text-xs text-gray-500 font-light">Scroll ke bawah</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Decorative models — mobile only, in-flow below content */}
          <div className="md:hidden flex-1 min-h-0 relative z-5 flex items-end justify-center overflow-hidden">
            <div className="relative w-[52%] h-full">
              <Image
                src="/gambarcowo.png"
                alt="Model pria"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
            <div className="relative w-[42%] h-full -translate-x-12 z-10">
              <Image
                src="/gambarcewe.png"
                alt="Model wanita"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </div>

          {/* Bottom-left contact info — desktop only */}
          <div className="hidden md:flex absolute bottom-13 left-16 2xl:left-32 z-10 flex-wrap items-center gap-10 font-(family-name:--font-poppins) font-normal text-xl text-black">
            <div className="flex items-center gap-3">
              <Image src="/Vector-2.png" alt="" width={32} height={32} className="h-7 w-auto" />
              <span>esize.id</span>
            </div>
            <div className="flex items-center gap-3">
              <Image src="/Vector.png" alt="" width={32} height={32} className="h-7 w-auto" />
              <span>085156043052</span>
            </div>
            <div className="flex items-center gap-3">
              <Image src="/ph_tiktok-logo.png" alt="" width={32} height={32} className="h-7 w-auto" />
              <span>esize.konveksi</span>
            </div>
          </div>

          {/* Decorative models — desktop only */}
          <ParallaxScroll
            speed={0.5}
            className="pointer-events-none hidden md:flex absolute inset-y-0 -right-44 w-1/2 items-end justify-center"
          >
            <div className="relative w-53/100 h-250">
              <Image
                src="/gambarcowo.png"
                alt="Model pria"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
            <div className="relative w-43/100 h-250 -translate-x-52 z-10">
              <Image
                src="/gambarcewe.png"
                alt="Model wanita"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
          </ParallaxScroll>

        </section>

        {/* About Section */}
        <section className="bg-[#f5f5f3] py-10 md:py-20 overflow-hidden">
          <div className="w-full flex flex-col md:flex-row items-center gap-8 md:gap-16 px-5 sm:px-8 md:px-16">
            <FadeInLeft className="flex-1 w-full">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3">
                <span className="text-[#9F7A04]">About</span>{" "}
                <span className="text-[#7C6000]">Esize</span>
              </h2>
              <hr className="border-t-2 border-[#7C6000] mb-4 md:mb-8 w-full" />
            

              {/* 2×2 Image Grid — mobile only, between heading and paragraph */}
              <div className="md:hidden grid grid-cols-2 gap-2 w-full mb-6">
                <div className="rounded-tl-2xl rounded-br-2xl bg-[#4a7fc1] aspect-square relative p-3">
                  <div className="relative w-full h-full rounded-tl-xl rounded-br-xl overflow-hidden">
                    <Image src="/ataskanan.png" alt="Produk 1" fill className="object-cover" />
                  </div>
                </div>
                <div className="rounded-tr-2xl rounded-bl-2xl bg-[#c0553a] aspect-square relative p-3">
                  <div className="relative w-full h-full rounded-tr-xl rounded-bl-xl overflow-hidden">
                    <Image src="/ataskiri.png" alt="Produk 2" fill className="object-cover" />
                  </div>
                </div>
                <div className="rounded-tr-2xl rounded-bl-2xl bg-[#7C6000] aspect-square relative p-3">
                  <div className="relative w-full h-full rounded-tr-xl rounded-bl-xl overflow-hidden">
                    <Image src="/bawahkiri.png" alt="Produk 3" fill className="object-cover" />
                  </div>
                </div>
                <div className="rounded-tl-2xl rounded-br-2xl bg-[#4a7fc1] aspect-square relative p-3">
                  <div className="relative w-full h-full rounded-tl-xl rounded-br-xl overflow-hidden">
                    <Image src="/bawahkanan.png" alt="Produk 4" fill className="object-cover" />
                  </div>
                </div>
              </div>

              <h3 className="text-base sm:text-2xl md:text-3xl font-bold text-[#7C6000] mb-4 md:mb-10 leading-tight">
                Produksi Seragam &amp; Suvenir<br />
                Skala Besar Tanpa Ribet
              </h3>
              <p className="text-sm text-justify sm:text-lg md:text-xl text-[#7C6000] leading-relaxed mb-8">
                Sejak 2019, Esize melayani produksi konveksi dan suvenir skala
                besar ke seluruh Indonesia hingga luar negeri. Didukung fasilitas
                modern dan tim berpengalaman, kami menghadirkan kualitas
                terjaga, proses efisien, dan pengiriman tepat waktu dengan harga
                bersahabat.
              </p>
              <RippleLink href="/about" className="px-6 py-2 rounded-full text-white font-light">
                Selengkapnya →
              </RippleLink>
            </FadeInLeft>

            {/* 2×2 Image Grid — desktop only */}
            <div className="hidden md:grid grid-cols-2 gap-2 md:w-105 md:max-w-none mx-auto md:mx-0">
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
        <section className="bg-[#f5f5f3] py-8 px-5 sm:px-8 md:px-16">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1">
              <SpinIn><Image src="/Rectangle 17.png" alt="logo" width={80} height={80} className="rotate-180" /></SpinIn>
              <SpinIn><Image src="/Rectangle 19.png" alt="logo" width={80} height={80} className="rotate-180" /></SpinIn>
            </div>
          </div>

          <hr className="border-t-2 border-[#c0553a] mb-8 md:mb-12 mx-0 sm:mx-8 md:mx-32" />

          {/* Stats: stacked on mobile, 3-column on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 text-center mb-8 md:mb-12">
            {[
              { value: "2.000+", label: "Universities" },
              { value: "20.000+", label: "Customer" },
              { value: "6+", label: "Years Operating" },
            ].map((stat, i) => (
              <FadeInUp key={i}>
                <div className="relative px-6 py-5 bg-white shadow-md rounded-xl md:bg-transparent md:shadow-none md:rounded-none md:px-10 md:py-6">
                  <span className="absolute top-0 right-0 w-8 h-8 md:w-12 md:h-12 border-t-4 border-r-4 md:border-t-6 md:border-r-6 border-[#fae8e4]" />
                  <span className="absolute bottom-0 left-0 w-8 h-8 md:w-12 md:h-12 border-b-4 border-l-4 md:border-b-6 md:border-l-6 border-[#fae8e4]" />
                  <p className="text-2xl md:text-3xl font-bold text-[#927615]">{stat.value}</p>
                  <p className="text-gray-600 text-sm md:text-base text-center font-light">{stat.label}</p>
                </div>
              </FadeInUp>
            ))}
          </div>

          <FadeInUp>
            <div className="bg-[#d4795e] py-3 text-center mb-8 md:mb-12 mx-0 sm:mx-8 md:mx-48">
              <p className="text-white text-sm sm:text-2xl md:text-3xl font-bold px-3 sm:px-4">Pengiriman Dalam Negeri dan Luar Negeri</p>
            </div>
          </FadeInUp>

          <hr className="border-t-2 border-[#c0553a] mb-4 mx-0 sm:mx-8 md:mx-32" />

          <div className="flex justify-center">
            <div className="flex items-center gap-1">
              <SpinIn><Image src="/Rectangle 19.png" alt="logo" width={80} height={80} /></SpinIn>
              <SpinIn><Image src="/Rectangle 17.png" alt="logo" width={80} height={80} /></SpinIn>
            </div>
          </div>
        </section>

        {/* Kategori Produk Section */}
        <section className="bg-[#f5f5f3] py-12 md:py-16 px-5 sm:px-8 md:px-16">
          <FadeInUp>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7C6000] mb-2">Kategori Produk</h2>
            <p className="text-sm text-gray-500 font-light mb-8 md:mb-10">Berbagai pilihan merchandise berkualitas untuk kebutuhan Anda</p>
          </FadeInUp>
          <div className="mb-8 md:mb-10">
            <CategoryCarousel />
          </div>
          <FadeInUp>
            <RippleLink href="/category" className="px-8 py-2 rounded-full text-white font-light mx-0 sm:mx-6 shadow-lg">
              Lihat Semua Produk
            </RippleLink>
          </FadeInUp>
        </section>

        {/* How To Order Section */}
        <section className="bg-[#f5f5f3] py-12 md:py-16 px-5 sm:px-8 md:px-16">
          <FadeInUp>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#7C6000] mb-2">How To Order?</h2>
            <p className="text-sm text-black italic font-light mb-8 md:mb-12">Size the sequence, to your perfect size.</p>
          </FadeInUp>

          <HowToOrderCarousel />

          <FadeInUp className="flex justify-center">
            <RippleLink
              href="https://wa.me/6281223344556"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-full text-white font-light shadow-lg"
            >
              Pesan Sekarang
            </RippleLink>
          </FadeInUp>
        </section>

        <Footer />
      </main>
    </ViewportScaler>
  );
}
