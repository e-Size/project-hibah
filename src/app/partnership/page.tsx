import Image from "next/image";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import FadeInUp from "../components/FadeInUp";
import SpinIn from "../components/SpinIn";
import FadeInLeft from "../components/FadeInLeft";
export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-[#e8e8e6]">
      <Navbar variant="transparent" />
      <section className="px-16 2xl:px-80 py-20">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="bg-[#7C6000] px-35 py-3 mb-4">
            <h1 className="text-white font-bold text-6xl">Building Trust</h1>
          </div>
          <h2 className="text-[#7C6000] font-bold text-6xl mb-5">Across The Globe</h2>
          <p className="text-[#7C6000] text-2xl max-w-3xl leading-snug">
            Berkolaborasi dengan berbagai partner terpercaya untuk<br />
            menghadirkan kualitas dan pengalaman terbaik
          </p>
        </div>

        {/* Map */}
        <FadeInLeft className="px-16">
          <Image
            src="/peta dunia 1.png"
            alt="Peta Dunia"
            width={1200}
            height={650}
            className="w-full h-auto"
          />
        </FadeInLeft>

      </section>

      {/* Stats Section */}
      <section className="px-16 2xl:px-80 pb-20">
        <FadeInUp className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: "2.000+", label: "Universities & Institutions", border: "#4273B2", rounded: "rounded-tl-3xl rounded-br-3xl" },
            { number: "20.000+", label: "Customers",                  border: "#e8734a", rounded: "rounded-tr-3xl rounded-bl-3xl" },
            { number: "3+",     label: "Countries Worldwide",         border: "#4273B2", rounded: "rounded-tl-3xl rounded-br-3xl" },
            { number: "6+",     label: "Years Operating",             border: "#e8734a", rounded: "rounded-tr-3xl rounded-bl-3xl" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-[#fdf6f0] border-[5px] flex flex-col items-center justify-center py-8 px-6 gap-2 ${stat.rounded}`}
              style={{ borderColor: stat.border }}
            >
              <span className="text-[#BE9D2E] font-bold text-5xl">{stat.number}</span>
              <span className="text-[#7C6000] text-l text-base text-center">{stat.label}</span>
            </div>
          ))}
        </FadeInUp>
      </section>

      {/* How to Partnership Section */}
      <section className="px-16 2xl:px-80 py-16 bg-[#e8e8e6]">
        <h2 className="text-[#7C6000] font-light text-5xl mb-14">How to do Partnership?</h2>

        <FadeInUp className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { number: 1, text: "Siapkan proposal partnership" },
            { number: 2, text: "Kirim proposal ke WhatsApp Esize" },
            { number: 3, text: "Diskusi kebutuhan dan penawaran" },
            { number: 4, text: "Deal dan produksi berjalan" },
          ].map((step) => (
            <div key={step.number} className="relative mt-7">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 w-20 h-20 rounded-full bg-[#4273B2] flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-5xl">{step.number}</span>
              </div>

              {/* Card */}
              <div className="overflow-hidden rounded-2xl bg-[#e8734a] mx-6">
                <div className="mt-5 bg-[#fdf6f0] px-6 pt-14 pb-10 text-center border-2 border-[#7C6000] rounded-2xl">
                  <p className="text-black font-light text-xl leading-snug">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </FadeInUp>

        {/* CTA Button */}
        <div className="flex justify-center">
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#D4A253] hover:bg-[#b8973a] text-white font-semibold text-lg rounded-full px-6 py-4 transition-colors shadow-md"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Kirim proposalmu sekarang
          </a>
        </div>
      </section>

      {/* Our Respectable Client Section */}
      <section className="bg-[#e8e8e6] px-16 2xl:px-80 pt-16 pb-5">
        {/* Icons */}
        <div className="flex justify-center gap-1 mb-6">
          <SpinIn><Image src="/Rectangle 17.png" alt="" width={100} height={100} className="h-24 w-auto" /></SpinIn>
          <SpinIn><Image src="/Rectangle 19.png" alt="" width={100} height={100} className="h-24 w-auto" /></SpinIn>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E1785B] mb-6" />

        {/* Title banner */}
        <FadeInUp className="bg-[#E1785B] py-4 mb-14 mx-20">
          <h2 className="text-white font-semibold text-4xl text-center">Our Respectable Client</h2>
        </FadeInUp>

        {/* Client image */}
        <FadeInUp className="mb-20 mx-10">
          <Image src="/client.png" alt="Our Respectable Client" width={1200} height={400} className="w-full h-auto" />
        </FadeInUp>

        <FadeInUp className="bg-[#4273B2] py-4 mb-14 mx-20">
          <h2 className="text-white font-semibold text-4xl text-center">Sponsorship</h2>
        </FadeInUp>

        <FadeInUp className="mb-10 mx-10">
          <Image src="/Sponsorship.png" alt="Sponsorship" width={1200} height={400} className="w-full h-auto" />
        </FadeInUp>

        <div className="w-full h-px bg-[#E1785B] mb-2" />
      </section>

      <Footer />
    </main>
  );
}
