"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import Navbar from "../../../components/layout/Navbar";
import Footer from "../../../components/layout/Footer";
import ProductModal from "../../../features/category/components/ProductModal";
import type { CategoryItem } from "../../../types/product";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const product = useMemo<CategoryItem>(
    () => ({ id, name: "", bg: "" }),
    [id]
  );

  return (
    <main className="min-h-screen bg-[#fdf6f0]">
      <Navbar variant="transparent" />
      <div className="pt-16">
        <ProductModal
          product={product}
          onClose={() => router.back()}
          asPage
        />
      </div>
      <Footer />
    </main>
  );
}
