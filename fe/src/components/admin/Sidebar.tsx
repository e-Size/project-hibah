"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    section: "Utama",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Katalog",
    items: [
      {
        label: "Produk",
        href: "/admin/products",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5zM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Gambar Produk",
        href: "/admin/product-images",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909a.75.75 0 01-1.06 0L6.94 7.5a.75.75 0 00-1.06 0L2.5 11.06zm4-3.56a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Size Guide",
        href: "/admin/size-guides",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 4.75A2.75 2.75 0 014.75 2h10.5A2.75 2.75 0 0118 4.75v10.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25V4.75zM6.5 5.5a.75.75 0 00-1.5 0v1.25H4.5a.75.75 0 000 1.5H5V10H4.5a.75.75 0 000 1.5H5v1.75H4.5a.75.75 0 000 1.5H5v.25a.75.75 0 001.5 0v-.25H8a.75.75 0 000-1.5H6.5V11.5H8A.75.75 0 008 10H6.5V8.25H8a.75.75 0 000-1.5H6.5V5.5zM10 6.25a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75zm0 3.75a.75.75 0 01.75-.75h4a.75.75 0 010 1.5h-4A.75.75 0 0110 10zm.75 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Color Palette",
        href: "/admin/color-palettes",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 1.5 1.5 0 001.06-2.56c-.291-.293-.7-.443-1.018-.69-.31-.24-.534-.598-.534-1.06 0-.802.65-1.452 1.452-1.452h1.75a3.5 3.5 0 003.5-3.5C16.21 4.546 13.42 2 10 2zM5 11a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm2-4a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5-1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm3 3a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Product Addons",
        href: "/admin/product-addons",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        ),
      },
      {
        label: "Gambar Tambahan",
        href: "/admin/extra-images",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909a.75.75 0 01-1.06 0L6.94 7.5a.75.75 0 00-1.06 0L2.5 11.06zm4-3.56a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Material",
    items: [
      {
        label: "Material",
        href: "/admin/materials",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75zM3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Harga",
    items: [
      {
        label: "Size Variant",
        href: "/admin/size-variants",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Quantity Tier",
        href: "/admin/quantity-tiers",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H18v8.75A2.75 2.75 0 0115.25 15h-1.072l.798 3.06a.75.75 0 01-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 01-1.452-.38L5.823 15H4.75A2.75 2.75 0 012 12.25V3.5h-.25A.75.75 0 011 2.75z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        label: "Price Matrix",
        href: "/admin/price-matrix",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603c-.481.042-.964.22-1.357.493-.268.186-.492.415-.617.635-.07.123-.09.216-.09.274 0 .058.02.151.09.274.125.22.35.449.617.635.146.101.31.19.484.264l-.047-.022z" />
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.214.14.462.253.736.363v-2.91c-.698-.093-1.383-.32-1.959-.696C4.754 9.244 4.25 8.488 4.25 7.627c0-.86.504-1.616 1.29-2.13.577-.376 1.262-.603 1.96-.695V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className={`admin-sidebar-overlay${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`admin-sidebar${open ? " open" : ""}`}>
        <div className="admin-sidebar-logo">
          <div className="admin-sidebar-logo-icon">eS</div>
          <span>e-Size Admin</span>
        </div>
        <nav className="admin-sidebar-nav">
          {menuItems.map((group) => (
            <React.Fragment key={group.section}>
              <div className="admin-sidebar-section">{group.section}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-sidebar-link${isActive(item.href) ? " active" : ""}`}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </React.Fragment>
          ))}
        </nav>
      </aside>
    </>
  );
}
