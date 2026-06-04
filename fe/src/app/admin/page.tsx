"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { productService, materialGroupService, sizeVariantService, quantityTierService, priceMatrixService, productAddonService } from "@/services/admin-service";

interface Stat {
  label: string;
  value: number | null;
  color: string;
  bg: string;
  href: string;
  icon: React.ReactNode;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, matGroups, sizes, tiers, matrix, addons] = await Promise.all([
          productService.getAll().catch(() => []),
          materialGroupService.getAll().catch(() => []),
          sizeVariantService.getAll().catch(() => []),
          quantityTierService.getAll().catch(() => []),
          priceMatrixService.getAll().catch(() => []),
          productAddonService.getAll().catch(() => []),
        ]);
        setStats([
          {
            label: "Produk", value: products.length, color: "#DFAA14", bg: "rgba(223,170,20,0.1)", href: "/admin/products",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5z" clipRule="evenodd" /></svg>,
          },
          {
            label: "Material", value: matGroups.length, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", href: "/admin/materials",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M3.75 3A1.75 1.75 0 002 4.75v3.26a3.235 3.235 0 011.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0016.25 5h-4.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H3.75zM3.75 9A1.75 1.75 0 002 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0018 15.25v-4.5A1.75 1.75 0 0016.25 9H3.75z" /></svg>,
          },
          {
            label: "Size Variant", value: sizes.length, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", href: "/admin/size-variants",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" /></svg>,
          },
          {
            label: "Quantity Tier", value: tiers.length, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", href: "/admin/quantity-tiers",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H18v8.75A2.75 2.75 0 0115.25 15h-1.072l.798 3.06a.75.75 0 01-1.452.38L13.41 18H6.59l-.114.44a.75.75 0 01-1.452-.38L5.823 15H4.75A2.75 2.75 0 012 12.25V3.5h-.25A.75.75 0 011 2.75z" clipRule="evenodd" /></svg>,
          },
          {
            label: "Price Matrix", value: matrix.length, color: "#ef4444", bg: "rgba(239,68,68,0.1)", href: "/admin/price-matrix",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603c-.481.042-.964.22-1.357.493-.268.186-.492.415-.617.635-.07.123-.09.216-.09.274 0 .058.02.151.09.274.125.22.35.449.617.635.146.101.31.19.484.264l-.047-.022z" /><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.214.14.462.253.736.363v-2.91c-.698-.093-1.383-.32-1.959-.696C4.754 9.244 4.25 8.488 4.25 7.627c0-.86.504-1.616 1.29-2.13.577-.376 1.262-.603 1.96-.695V4.75A.75.75 0 0110 4z" clipRule="evenodd" /></svg>,
          },
          {
            label: "Product Addon", value: addons.length, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", href: "/admin/product-addons",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--admin-text)", margin: 0 }}>Dashboard</h2>
        <p style={{ color: "var(--admin-text-secondary)", fontSize: "0.875rem", margin: "4px 0 0" }}>
          Ringkasan data e-Size
        </p>
      </div>

      <div className="admin-stats-grid">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="admin-stat-card">
                <div className="admin-skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <div className="admin-skeleton" style={{ width: "60%", height: 12, marginBottom: 8 }} />
                  <div className="admin-skeleton" style={{ width: "40%", height: 28 }} />
                </div>
              </div>
            ))
          : stats.map((s) => (
              <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                <div className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>
                    {s.icon}
                  </div>
                  <div className="admin-stat-info">
                    <h3>{s.label}</h3>
                    <p>{s.value ?? 0}</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </>
  );
}
