import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Chatbot from "./components/Chatbot";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-poppins)]">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
