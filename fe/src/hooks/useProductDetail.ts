"use client";

import { useEffect, useState } from "react";
import { getProductById } from "../services/api";
import type { ProductDetail } from "../types/product";

export function useProductDetail(id: string | undefined) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));

  useEffect(() => {
    let ignore = false;

    setDetail(null);

    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getProductById(id)
      .then((data) => {
        if (!ignore) setDetail(data);
      })
      .catch(() => {
        if (!ignore) setDetail(null);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  return { detail, isLoading };
}
