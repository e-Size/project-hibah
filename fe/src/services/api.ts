import type { Product, ProductCategory, ProductDetail } from "../types/product";

type ApiListResponse<T> = {
  data: T;
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(category?: ProductCategory): Promise<Product[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await request<ApiListResponse<Product[]>>(`/product${params}`);

  return response.data;
}

export async function getProductById(id: string): Promise<ProductDetail> {
  const response = await request<ApiListResponse<ProductDetail>>(`/product/${id}`);

  return response.data;
}

export function resolveAssetUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads")) return `${API_ORIGIN}${value}`;

  return value;
}
