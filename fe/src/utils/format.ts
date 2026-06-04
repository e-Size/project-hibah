import type { ProductDetail } from "../types/product";

export function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getPriceRangeLabel(priceFrom: number, priceTo: number) {
  if (priceFrom <= 0) return "Hubungi admin";
  if (priceTo > priceFrom) {
    return `${formatPrice(priceFrom)} - ${formatPrice(priceTo)}`;
  }

  return formatPrice(priceFrom);
}

export function getPriceLabel(detail: ProductDetail | null) {
  if (!detail) return "Hubungi admin";
  return getPriceRangeLabel(detail.price_from, detail.price_to);
}
