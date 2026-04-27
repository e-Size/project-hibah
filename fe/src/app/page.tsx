import Image from "next/image";
import Link from "next/link";
import RippleLink from "../components/ui/RippleLink";
import FadeInLeft from "../components/animation/FadeInLeft";
import FadeInRight from "../components/animation/FadeInRight";
import SpinIn from "../components/animation/SpinIn";
import FadeInUp from "../components/animation/FadeInUp";
import ParallaxScroll from "../components/animation/ParallaxScroll";
import CategoryCarousel from "../features/home/components/CategoryCarousel";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import ViewportScaler from "../components/ui/ViewportScaler";

export default function Home() {
  return (
    <ViewportScaler>
      <main className="min-h-screen" style={{ margin: 0, padding: 0 }}>
        <Navbar variant="transparent" />
        {/* Hero Section */}
        <section className="relative overflow-hidden" style={{ height: "calc(100vh / var(--page-scale, 1))" }}>
          <Image
            src="/bg herokeren.png"
            alt="Hero background"
            fill
            className="object-cover object-center -z-10"
            priority
          />
          {/* Left - Text */}
          <div className="relative z-10 flex flex-col max-w-5xl h-full justify-start pt-40 pb-20 px-8 md:px-16 2xl:px-32 ">
            <h1 className="font-[family-name:var(--font-red-rose)] text-5xl md:text-6xl text-black leading-tight mb-8 uppercase">
              Solusi Terpercaya <br />untuk Merchandise &amp;<br /> Promosi
            </h1>
            <p className="font-[family-name:var(--font-red-rose)] text-sm md:text-base text-black mb-10 max-w-md">
              Custom apparel dan promotional products <br /> berkualitas tinggi untuk kebutuhan bisnis Anda
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/category"
                className="px-8 py-3 rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-colors border border-[#C0980D]"
              >
                Lihat Produk
              </Link>
              <a
                href="https://wa.me/6281223344556"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full bg-white text-gray-900 hover:bg-gray-100 transition-colors border border-[#C0980D]"
              >
                Pesan Sekarang
              </a>
            </div>
          </div>

          {/* Bottom-left contact info */}
          <div className="absolute bottom-13 left-8 md:left-16 2xl:left-32 z-10 flex flex-wrap items-center gap-10 font-[family-name:var(--font-poppins)] font-normal text-xl text-black">
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

          <ParallaxScroll
            speed={0.5}
            className="pointer-events-none absolute inset-y-0 -right-44 w-1/2 flex items-end justify-center"
          >
            <div className="relative w-53/100 h-[1000px]">
              <Image
                src="/gambarcowo.png"
                alt="Model pria"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
            <div className="relative w-43/100 h-[1000px] -translate-x-52 z-10">
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
        <section className="bg-[#f5f5f3] py-20">
          <div className="w-full flex flex-col md:flex-row items-center gap-16 px-16">
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
              <RippleLink
                href="/about"
                className="px-6 py-2 rounded-full text-white font-light"
              >
                Selengkapnya →
              </RippleLink>
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
        <section className="bg-[#f5f5f3] py-8 px-16">
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
          <div className="flex justify-around text-center mb-12 mx-30">
            {[
              { value: "2.000+", label: "Universities" },
              { value: "20.000+", label: "Customer" },
              { value: "6+", label: "Years Operating" },
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
        <section className="bg-[#f5f5f3] py-16 px-16">
          <FadeInUp>
            <h2 className="text-3xl font-bold text-[#7C6000] mb-2">Kategori Produk</h2>
            <p className="text-gray-500 font-light mb-10">Berbagai pilihan merchandise berkualitas untuk kebutuhan Anda</p>
          </FadeInUp>

          <div className="mb-10">
            <CategoryCarousel />
          </div>

          <FadeInUp>
            <RippleLink
              href="/about"
              className="px-8 py-2 rounded-full text-white font-light mx-6 shadow-lg"
            >
              Lihat Semua Produk
            </RippleLink>
          </FadeInUp>
        </section>

        {/* How To Order Section */}
        <section className="bg-[#f5f5f3] py-16 px-16">
          <FadeInUp>
            <h2 className="text-5xl font-semibold text-[#7C6000] mb-2 mx-6">How To Order?</h2>
            <p className="text-black italic font-light mb-12 mx-6">Size the sequence, to your perfect size.</p>
          </FadeInUp>

          <div className="flex items-stretch mb-12">
            {[
              { num: "01", img: "/howto1.png", title: "Konsultasi Produk & Harga", desc: "Informasikan kebutuhan anda untuk produk yang di inginkan, lalu customer service kami akan memberikan pilihan produk yang sesuai dan harga nya" },
              { num: "02", img: "/howto2.png", title: "Pengisian Form Pemesanan", desc: "Klien yang telah menyetujui akan diberikan form yang berisi detail produk dan design pemesanan" },
              { num: "03", img: "/howto3.png", title: "Invoice & Pembayaran", desc: "Admin akan proses design sesuai dengan form yang sudah di setujui dan klien segera dapat payment" },
              { num: "04", img: "/howto4.png", title: "Proses Produksi", desc: "Proses produksi akan dimulai setelah pembayaran berhasil" },
              { num: "05", img: "/howto5.png", title: "Pengiriman dan Pelunasan", desc: "Admin Esize akan mengirimkan anda ke alamat pengiriman" },
            ].map((step, i) => (
              <FadeInUp key={step.num} className="flex items-start flex-1">
                <div className="flex-1 h-full bg-[#F8F3E9] rounded-2xl shadow-md overflow-hidden flex flex-col relative transition-transform duration-300 hover:scale-105 hover:z-10 hover:shadow-xl">
                  <div className="flex-1 flex flex-col">
                    <div className="relative bg-[#e8e8e8] rounded-xl mx-4 mt-4 mb-4 overflow-hidden">
                      <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-[#DFAA14] flex items-center justify-center text-white text-sm font-bold z-10">
                        {step.num}
                      </span>
                      <div className="relative w-full h-[120px]">
                        <Image src={step.img} alt={step.title} fill className="object-cover" />
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
