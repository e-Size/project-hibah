"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts, resolveAssetUrl } from "../services/api";
import type { CategoryItem, Product, ProductCategory } from "../types/product";

function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function productToCategoryItem(product: Product): CategoryItem {
  return {
    id: product.id,
    name: product.name,
    bg: product.bg_color || "#4a7fc1",
    category: product.category,
    image: resolveAssetUrl(product.thumbnail),
    keywords: splitKeywords(product.keywords),
  };
}

export function useProducts(category?: ProductCategory) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);
    setError(null);

    getProducts(category)
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((err) => {
        if (!ignore) {
          setProducts([]);
          setError(err instanceof Error ? err : new Error("Failed to load products"));
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [category]);

  const items = useMemo(() => products.map(productToCategoryItem), [products]);

  return {
    error,
    isLoading,
    items,
    products,
  };
}
