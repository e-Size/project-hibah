import { apiGet, apiPost, apiPut, apiDelete, apiPostForm, apiPutForm } from "@/lib/api";
import type {
  Product, ProductListItem, ProductCreateRequest, ProductUpdateRequest,
  MaterialGroup, MaterialGroupCreateRequest, MaterialGroupUpdateRequest,
  SizeVariant, SizeVariantCreateRequest, SizeVariantUpdateRequest,
  QuantityTier, QuantityTierCreateRequest, QuantityTierUpdateRequest,
  PriceMatrix, PriceMatrixCreateRequest, PriceMatrixUpdateRequest,
  ProductAddon, ProductAddonCreateRequest, ProductAddonUpdateRequest,
  ProductImage,
  SizeGuide,
  ColorPalette, ColorPaletteCreateRequest, ColorPaletteUpdateRequest,
  ExtraImage, ExtraImageCreateRequest, ExtraImageUpdateRequest,
  PaginationMeta,
} from "@/types/admin";

type R<T> = { data: T };
type Msg = { message: string };
type Paged<T> = { data: T; meta: PaginationMeta };

export interface PageParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | undefined;
}

function buildQuery(params: PageParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ─── Products ───────────────────────────────────────────
export const productService = {
  getAll: (category?: string) =>
    apiGet<R<ProductListItem[]>>(`/products${category ? `?category=${category}` : ""}`).then(r => r.data),
  getPaginated: (params: PageParams & { category?: string }) =>
    apiGet<Paged<ProductListItem[]>>(`/products${buildQuery({ limit: 10, ...params })}`),
  getById: (id: string) =>
    apiGet<{ data: { product: Product; images: ProductImage[]; price_from: number; price_to: number; price_matrix: PriceMatrix[]; addons: Record<string, ProductAddon[]> } }>(`/products/${id}`).then(r => r.data),
  create: (data: ProductCreateRequest) =>
    apiPost<R<Product>>("/products", data).then(r => r.data),
  update: (id: string, data: ProductUpdateRequest) =>
    apiPut<R<Product>>(`/products/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/products/${id}`),
};

// ─── Material Groups ────────────────────────────────────
export const materialGroupService = {
  getAll: () =>
    apiGet<R<MaterialGroup[]>>("/material-groups").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<MaterialGroup[]>>(`/material-groups${buildQuery({ limit: 10, ...params })}`),
  create: (data: MaterialGroupCreateRequest) =>
    apiPost<R<MaterialGroup>>("/material-groups", data).then(r => r.data),
  update: (id: string, data: MaterialGroupUpdateRequest) =>
    apiPut<R<MaterialGroup>>(`/material-groups/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/material-groups/${id}`),
};

// ─── Size Variants ──────────────────────────────────────
export const sizeVariantService = {
  getAll: () =>
    apiGet<R<SizeVariant[]>>("/size-variants").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<SizeVariant[]>>(`/size-variants${buildQuery({ limit: 10, ...params })}`),
  create: (data: SizeVariantCreateRequest) =>
    apiPost<R<SizeVariant>>("/size-variants", data).then(r => r.data),
  update: (id: string, data: SizeVariantUpdateRequest) =>
    apiPut<R<SizeVariant>>(`/size-variants/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/size-variants/${id}`),
};

// ─── Quantity Tiers ─────────────────────────────────────
export const quantityTierService = {
  getAll: () =>
    apiGet<R<QuantityTier[]>>("/quantity-tiers").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<QuantityTier[]>>(`/quantity-tiers${buildQuery({ limit: 10, ...params })}`),
  create: (data: QuantityTierCreateRequest) =>
    apiPost<R<QuantityTier>>("/quantity-tiers", data).then(r => r.data),
  update: (id: string, data: QuantityTierUpdateRequest) =>
    apiPut<R<QuantityTier>>(`/quantity-tiers/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/quantity-tiers/${id}`),
};

// ─── Price Matrix ───────────────────────────────────────
export const priceMatrixService = {
  getAll: () =>
    apiGet<R<PriceMatrix[]>>("/price-matrix").then(r => r.data),
  getPaginated: (params: PageParams & { product_id?: string }) =>
    apiGet<Paged<PriceMatrix[]>>(`/price-matrix${buildQuery({ limit: 10, ...params })}`),
  create: (data: PriceMatrixCreateRequest) =>
    apiPost<R<PriceMatrix>>("/price-matrix", data).then(r => r.data),
  update: (id: string, data: PriceMatrixUpdateRequest) =>
    apiPut<R<PriceMatrix>>(`/price-matrix/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/price-matrix/${id}`),
};

// ─── Product Addons ─────────────────────────────────────
export const productAddonService = {
  getAll: (productId?: string) =>
    apiGet<R<ProductAddon[]>>(`/product-addons${productId ? `?product_id=${productId}` : ""}`).then(r => r.data),
  getPaginated: (params: PageParams & { product_id?: string; addon_type?: string }) =>
    apiGet<Paged<ProductAddon[]>>(`/product-addons${buildQuery({ limit: 10, ...params })}`),
  create: (data: ProductAddonCreateRequest) =>
    apiPost<R<ProductAddon>>("/product-addons", data).then(r => r.data),
  update: (id: string, data: ProductAddonUpdateRequest) =>
    apiPut<R<ProductAddon>>(`/product-addons/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/product-addons/${id}`),
};

// ─── Product Images ─────────────────────────────────────
export const productImageService = {
  getAll: () =>
    apiGet<R<ProductImage[]>>("/product-images").then(r => r.data),
  getPaginated: (params: PageParams & { product_id?: string }) =>
    apiGet<Paged<ProductImage[]>>(`/product-images${buildQuery({ limit: 20, ...params })}`),
  getByProduct: (productId: string) =>
    apiGet<R<ProductImage[]>>(`/product-images/product/${productId}`).then(r => r.data),
  create: (productId: string, file: File, order: number) => {
    const form = new FormData();
    form.append("product_id", productId);
    form.append("image", file);
    form.append("order", String(order));
    return apiPostForm<R<ProductImage>>("/product-images", form).then(r => r.data);
  },
  update: (id: string, file?: File, order?: number) => {
    const form = new FormData();
    if (file) form.append("image", file);
    if (order !== undefined) form.append("order", String(order));
    return apiPutForm<R<ProductImage>>(`/product-images/${id}`, form).then(r => r.data);
  },
  delete: (id: string) =>
    apiDelete<Msg>(`/product-images/${id}`),
};

// ─── Size Guides ────────────────────────────────────────
export const sizeGuideService = {
  getAll: () =>
    apiGet<R<SizeGuide[]>>("/size-guides").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<SizeGuide[]>>(`/size-guides${buildQuery({ limit: 20, ...params })}`),
  getByProduct: (productId: string) =>
    apiGet<R<SizeGuide>>(`/size-guides/product/${productId}`).then(r => r.data),
  create: (productId: string, file: File) => {
    const form = new FormData();
    form.append("product_id", productId);
    form.append("image", file);
    return apiPostForm<R<SizeGuide>>("/size-guides", form).then(r => r.data);
  },
  update: (id: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return apiPutForm<R<SizeGuide>>(`/size-guides/${id}`, form).then(r => r.data);
  },
  delete: (id: string) =>
    apiDelete<Msg>(`/size-guides/${id}`),
};

// ─── Color Palettes ─────────────────────────────────────
export const colorPaletteService = {
  getAll: () =>
    apiGet<R<ColorPalette[]>>("/color-palettes").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<ColorPalette[]>>(`/color-palettes${buildQuery({ limit: 20, ...params })}`),
  getByProduct: (productId: string) =>
    apiGet<R<ColorPalette>>(`/color-palettes/product/${productId}`).then(r => r.data),
  create: (data: ColorPaletteCreateRequest) =>
    apiPost<R<ColorPalette>>("/color-palettes", data).then(r => r.data),
  update: (id: string, data: ColorPaletteUpdateRequest) =>
    apiPut<R<ColorPalette>>(`/color-palettes/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/color-palettes/${id}`),
};

// ─── Generic Upload ─────────────────────────────────────
export const uploadService = {
  upload: (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    return apiPostForm<{ url: string }>("/upload", form).then(r => r.url);
  },
};

// ─── Extra Images ───────────────────────────────────────
export const extraImageService = {
  getAll: () =>
    apiGet<R<ExtraImage[]>>("/extra-images").then(r => r.data),
  getPaginated: (params: PageParams) =>
    apiGet<Paged<ExtraImage[]>>(`/extra-images${buildQuery({ limit: 20, ...params })}`),
  create: (data: ExtraImageCreateRequest) =>
    apiPost<R<ExtraImage>>("/extra-images", data).then(r => r.data),
  update: (id: string, data: ExtraImageUpdateRequest) =>
    apiPut<R<ExtraImage>>(`/extra-images/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/extra-images/${id}`),
};
