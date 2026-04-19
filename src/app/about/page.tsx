import Image from "next/image";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import LocationSection from "../components/LocationSection";
import SpinIn from "../components/SpinIn";
import FadeInUp from "../components/FadeInUp";
import FadeInRight from "../components/FadeInRight";
import FadeInLeft from "../components/FadeInLeft";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar variant="light" />
      {/* Hero Section */}
      <section className="w-full">
        <Image
          src="/Hero Sect.png"
          alt="About Esize"
          width={1440}
          height={600}
          className="w-full h-auto"
          priority
        />
      </section>

      {/* About Section */}
      <section className="bg-[#f0f0ee] py-16 px-16 2xl:px-80">
        {/* Icons */}
        <div className="flex justify-center gap-1 mb-4">
          <SpinIn>
            <Image src="/Rectangle 17.png" alt="" width={100} height={100} className="h-28 w-auto" />
          </SpinIn>
          <SpinIn>
            <Image src="/Rectangle 19.png" alt="" width={100} height={100} className="h-28 w-auto" />
          </SpinIn>
        </div>

        {/* Top divider */}
        <div className="w-full h-px bg-[#c0392b] mb-10" />

        {/* Text */}
        <div className="text-center text-[#7C6000] font-semibold text-xl md:text-2xl leading-snug max-w-4xl mx-auto flex flex-col items-center gap-0.5">
          <FadeInUp delay={0}>Esize adalah sebuah perusahaan yang bergerak di bidang</FadeInUp>
          <FadeInUp delay={100}>penyediaan barang dan jasa konveksi serta suvenir. Didirikan pada</FadeInUp>
          <FadeInUp delay={200}>tahun 2019 kini esize telah bertransformasi menjadi sebuah</FadeInUp>
          <FadeInUp delay={300}>perusahaan yang memiliki kemampuan untuk memproduksi dan</FadeInUp>
          <FadeInUp delay={400}>menyediakan kebutuhan pelanggan dengan kapasitas besar ke</FadeInUp>
          <FadeInUp delay={500}>seluruh Indonesia dan luar</FadeInUp>
        </div>

        {/* Bottom divider */}
        <div className="w-full h-px bg-[#c0392b] mt-10 mb-8" />
      </section>

      {/* Feature Section */}
      <section className="px-0 2xl:px-64 bg-[#f0f0ee]">
        {/* Top row: image left, text right */}
        <FadeInRight className="flex flex-col md:flex-row">
          <div className="flex-1 relative min-h-[420px]">
            <Image
              src="/about1.png"
              alt="Fasilitas Produksi"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 bg-[#f5e8e0] flex items-center justify-center px-12 py-16">
            <p className="text-[#7C6000] font-semibold text-[28px] leading-snug text-end">
              Didukung <span className="bg-[#F8F3E9] px-1">fasilitas produksi modern</span> dan<br />
              <span className="bg-[#F8F3E9] px-1">tim berpengalaman lebih dari 10 tahun,</span><br />
              kami siap memenuhi kebutuhan konveksi<br />
              dan suvenir seperti <span className="bg-[#F8F3E9] px-1">seragam,</span><span className="bg-[#F8F3E9] px-1">kaos event,</span><br />
              <span className="bg-[#F8F3E9] px-1">jaket,</span><span className="bg-[#F8F3E9] px-1">ID card,</span><span className="bg-[#F8F3E9] px-1">tote bag,</span><span className="bg-[#F8F3E9] px-1">dan lainnya</span>.
            </p>
          </div>
        </FadeInRight>

        {/* Bottom row: text left, image right */}
        <FadeInLeft className="flex flex-col-reverse md:flex-row ">
          <div className="flex-1 bg-[#dce8f5] flex items-center justify-center px-12 py-16">
            <p className="text-[#7C6000] font-semibold text-[28px] leading-snug text-start">
              Kami berkomitmen menghadirkan produk<br />
              berstandar tinggi dengan <span className="bg-[#F8F3E9] px-1">layanan terbaik,</span><br />
              <span className="bg-[#F8F3E9] px-1">proses efisien,</span><span className="bg-[#F8F3E9] px-1">pengiriman tepat waktu,</span><br />
              dan <span className="bg-[#F8F3E9] px-1">harga yang tetap bersahabat.</span>
            </p>
          </div>
          <div className="flex-1 relative min-h-[420px]">
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
  );
}
