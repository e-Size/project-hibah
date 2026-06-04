"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
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
      <ProductModal
        product={product}
        onClose={() => router.back()}
        asPage
      />
    </main>
  );
}
