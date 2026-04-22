import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "../styles/globals.css";
import Chatbot from "../features/chat/components/Chatbot";
import SmoothScrollProvider from "../components/animation/SmoothScrollProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const redRose = localFont({
  src: "../../public/font/RedRose-Regular.ttf",
  variable: "--font-red-rose",
});

export const metadata: Metadata = {
  title: "Esize",
  description: "Solusi Terpercaya untuk Merchandise & Promosi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${redRose.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-poppins)]">
        <SmoothScrollProvider>
          {children}
          <Chatbot />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
