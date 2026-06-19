import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="px-4 sm:px-8 md:px-16 pt-16 pb-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Logo + Tagline */}
          <div className="flex-none flex flex-col gap-4 md:w-52">
            <div className="bg-white rounded-lg px-4 py-2 w-fit">
              <Image src="/logoesize.png" alt="Esize" width={140} height={50} className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-45">
              Your trusted partner for custom promotional products and corporate merchandise.
            </p>
          </div>

          {/* Links row on mobile, columns on md+ */}
          <div className="flex flex-row flex-wrap gap-8 md:contents">
            {/* Menu */}
            <div className="flex-1 min-w-30 flex flex-col gap-4 md:flex-none md:ml-16">
              <h4 className="font-bold text-base">Menu</h4>
              <nav className="flex flex-col gap-3">
                <Link href="/category" className="text-gray-400 text-sm hover:text-white transition-colors">Kategori Produk</Link>
                <Link href="/about" className="text-gray-400 text-sm hover:text-white transition-colors">Tentang Kami</Link>
                <a href="https://wa.me/6285156043052" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">Kontak</a>
                <Link href="/partnership" className="text-gray-400 text-sm hover:text-white transition-colors">Partnership</Link>
              </nav>
            </div>

            {/* Hubungi Kami */}
            <div className="flex-1 min-w-40 flex flex-col gap-4 md:flex-none md:ml-auto">
              <h4 className="font-bold text-base">Hubungi Kami</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.49 2 2 0 0 1 3.55 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z"/></svg>
                  <p className="text-gray-400 text-sm">+62 812-3456-7890</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <p className="text-gray-400 text-sm">info@esize.co.id</p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#9ca3af"/></svg>
                  <p className="text-gray-400 text-sm">@esize.id</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 px-4 sm:px-8 md:px-16 py-5">
        <p className="text-center text-gray-400 text-sm">© 2026 ESIZE. All rights reserved.</p>
      </div>
    </footer>
  );
}
