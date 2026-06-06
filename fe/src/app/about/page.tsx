import Image from "next/image";
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import LocationSection from "../../features/about/components/LocationSection";
import SpinIn from "../../components/animation/SpinIn";
import FadeInRight from "../../components/animation/FadeInRight";
import FadeInLeft from "../../components/animation/FadeInLeft";
import ViewportScaler from "../../components/ui/ViewportScaler";
import WordFadeText from "../../components/ui/WordFadeText";

export default function AboutPage() {
  return (
    <ViewportScaler>
    <main className="min-h-screen">
      <Navbar variant="light" />
      {/* Hero Section — landscape on mobile, full-height on desktop */}
      <section className="relative w-full aspect-video md:hidden">
        <Image src="/AboutSec.png" alt="About Esize" fill className="object-contain" priority />
      </section>
      <section className="relative w-full hidden md:block" style={{ height: "calc(100vh / var(--page-scale, 1))" }}>
        <Image src="/AboutSec.png" alt="About Esize" fill className="object-cover object-center" priority />
      </section>

      {/* About Section */}
      <section className="bg-[#f0f0ee] py-8 sm:py-12 md:py-16 px-4 sm:px-8 md:px-16">
        {/* Icons */}
        <div className="flex justify-center gap-1 mb-4">
          <SpinIn>
            <Image src="/Rectangle 17.png" alt="" width={100} height={100} className="h-16 sm:h-20 md:h-28 w-auto" />
          </SpinIn>
          <SpinIn>
            <Image src="/Rectangle 19.png" alt="" width={100} height={100} className="h-16 sm:h-20 md:h-28 w-auto" />
          </SpinIn>
        </div>

        {/* Top divider */}
        <div className="w-full h-px bg-[#c0392b] mb-6 md:mb-10" />

        {/* Text */}
        <WordFadeText
          text="Esize adalah sebuah perusahaan yang bergerak di bidang penyediaan barang dan jasa konveksi serta suvenir. Didirikan pada tahun 2019 kini esize telah bertransformasi menjadi sebuah perusahaan yang memiliki kemampuan untuk memproduksi dan menyediakan kebutuhan pelanggan dengan kapasitas besar ke seluruh Indonesia dan luar negeri."
          className="text-center text-[#7C6000] font-semibold text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto"
        />

        {/* Bottom divider */}
        <div className="w-full h-px bg-[#c0392b] mt-6 md:mt-10 mb-8" />
      </section>

      {/* Feature Section */}
      <section className="px-0 bg-[#f0f0ee] overflow-hidden">
        {/* Top row: image left, text right */}
        <FadeInRight className="flex flex-row">
          <div className="flex-1 relative min-h-0">
            <Image
              src="/about1.png"
              alt="Fasilitas Produksi"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 bg-[#f9e9ca] flex items-center justify-center px-3 sm:px-8 md:px-12 py-4 sm:py-12 md:py-16">
            <p className="text-[#7C6000] font-semibold text-xs sm:text-base md:text-lg lg:text-xl leading-snug text-start md:text-end">
              Didukung <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">fasilitas produksi modern</span> dan{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">tim berpengalaman lebih dari 10 tahun,</span>{" "}
              kami siap memenuhi kebutuhan konveksi
              dan suvenir seperti <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">seragam,</span>{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">kaos event,</span>{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">jaket,</span>{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">ID card,</span>{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">tote bag,</span>{" "}
              <span className="rounded-sm bg-[#cfe2f7] px-1.5 text-[#7C6000]">dan lainnya.</span>
            </p>
          </div>
        </FadeInRight>

        {/* Bottom row: text left, image right */}
        <FadeInLeft className="flex flex-row">
          <div className="flex-1 bg-[#cfe2f7] flex items-center justify-center px-3 sm:px-8 md:px-12 py-4 sm:py-12 md:py-16">
            <p className="text-[#7C6000] font-semibold text-xs sm:text-base md:text-lg lg:text-xl leading-snug text-start">
              Kami berkomitmen menghadirkan produk
              berstandar tinggi dengan <span className="bg-[#f9e9ca] px-1 text-[#7C6000]">layanan terbaik,</span>{" "}
              <span className="bg-[#f9e9ca] px-1 text-[#7C6000]">proses efisien,</span>{" "}
              <span className="bg-[#f9e9ca] px-1 text-[#7C6000]">pengiriman tepat waktu,</span>
              dan <span className="bg-[#f9e9ca] px-1 text-[#7C6000]">harga yang tetap bersahabat.</span>
            </p>
          </div>
          <div className="flex-1 relative min-h-0">
            <Image
              src="/about2.png"
              alt="Komitmen Kualitas"
              fill
              className="object-cover"
            />
          </div>
        </FadeInLeft>
      </section>

      <LocationSection />
      <Footer />
    </main>
    </ViewportScaler>
  );
}
