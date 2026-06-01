import type { ProductDetail } from "../types/product";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPriceLabel(detail: ProductDetail | null) {
  if (!detail || detail.price_from <= 0) return "Hubungi admin";
  if (detail.price_to > detail.price_from) {
    return `${formatPrice(detail.price_from)} - ${formatPrice(detail.price_to)}`;
  }

  return formatPrice(detail.price_from);
}
