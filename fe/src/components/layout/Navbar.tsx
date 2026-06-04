"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar({ variant = "default" }: { variant?: "default" | "transparent" | "light" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuRendered, setMenuRendered] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openMobileMenu() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMenuRendered(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuOpen(true)));
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    closeTimerRef.current = setTimeout(() => setMenuRendered(false), 300);
  }

  function toggleMobileMenu() {
    if (menuOpen) closeMobileMenu();
    else openMobileMenu();
  }

  const isOverlay = variant === "transparent" || variant === "light";
  const isLight = variant === "light";

  const linkClass = isLight
    ? "text-white text-sm font-medium hover:text-gray-200 transition-colors"
    : "text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors";

  const navClass = isOverlay
    ? "w-full fixed md:absolute top-0 left-0 right-0 z-50 md:z-20 bg-white/85 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between"
    : "w-full fixed md:static top-0 left-0 right-0 z-50 md:z-auto bg-[#F8F3E9] px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between";

  const burgerBar = `block w-6 h-0.5 transition-all duration-300 ${isLight ? "bg-gray-700 md:bg-white" : "bg-gray-700"}`;

  const mobileLinkClass = "text-[#7C6000] border-[#d4b86a]/30 text-base font-medium py-3 px-3 border-b transition-all duration-150 active:bg-[#f0e5c8] active:scale-[0.98] rounded-sm cursor-pointer";

  return (
    <>
      <nav className={navClass}>
        {/* Logo */}
        <Link href="/">
          <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <Image src="/logoesize.png" alt="Esize" width={120} height={40} className="h-8 w-auto" />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/category" className={linkClass}>Katalog Produk</Link>
          <Link href="/about" className={linkClass}>Tentang Kami</Link>
          <Link href="/partnership" className={linkClass}>Partnership</Link>
          <a
            href="https://drive.google.com/file/d/1p5fWSs8g53_neR7JYbf8lEuKdUs-4mdg/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Booklet
          </a>
        </div>

        {/* Desktop CTA Button */}
        <Link href="/editor" className="hidden md:block">
          <button className="bg-[#2b5fd4] hover:bg-[#1e4fc0] text-white font-semibold text-sm rounded-lg px-6 py-2.5 transition-colors">
            Design Custom
          </button>
        </Link>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`${burgerBar} ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`${burgerBar} ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`${burgerBar} ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {menuRendered && (
        <div
          className={`fixed top-14 left-0 right-0 z-50 md:hidden shadow-lg bg-[#F8F3E9]/90 backdrop-blur-md origin-top transition-all duration-300 ease-out ${
            menuOpen ? "translate-y-0 scale-y-100 opacity-100" : "-translate-y-3 scale-y-95 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col px-6 py-4 gap-1">
            <Link href="/category" className={`${mobileLinkClass} transition-all duration-300 ${menuOpen ? "translate-y-0 opacity-100 delay-75" : "-translate-y-2 opacity-0"}`} onClick={closeMobileMenu}>
              Katalog Produk
            </Link>
            <Link href="/about" className={`${mobileLinkClass} transition-all duration-300 ${menuOpen ? "translate-y-0 opacity-100 delay-100" : "-translate-y-2 opacity-0"}`} onClick={closeMobileMenu}>
              Tentang Kami
            </Link>
            <Link href="/partnership" className={`${mobileLinkClass} transition-all duration-300 ${menuOpen ? "translate-y-0 opacity-100 delay-150" : "-translate-y-2 opacity-0"}`} onClick={closeMobileMenu}>
              Partnership
            </Link>
            <a
              href="https://drive.google.com/file/d/1p5fWSs8g53_neR7JYbf8lEuKdUs-4mdg/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className={`${mobileLinkClass} transition-all duration-300 ${menuOpen ? "translate-y-0 opacity-100 delay-200" : "-translate-y-2 opacity-0"}`}
              onClick={closeMobileMenu}
            >
              Booklet
            </a>
            <Link href="/editor" className={`mt-4 transition-all duration-300 ${menuOpen ? "translate-y-0 opacity-100 delay-300" : "-translate-y-2 opacity-0"}`} onClick={closeMobileMenu}>
              <button className="w-full bg-[#2b5fd4] hover:bg-[#1e4fc0] text-white font-semibold text-sm rounded-lg px-6 py-3 transition-colors">
                Design Custom
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
