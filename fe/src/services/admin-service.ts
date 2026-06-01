import { apiGet, apiPost, apiPut, apiDelete, apiPostForm, apiPutForm } from "@/lib/api";
import type {
  Product, ProductListItem, ProductCreateRequest, ProductUpdateRequest,
  MaterialGroup, MaterialGroupCreateRequest, MaterialGroupUpdateRequest,
  Material, MaterialCreateRequest, MaterialUpdateRequest,
  SizeVariant, SizeVariantCreateRequest, SizeVariantUpdateRequest,
  QuantityTier, QuantityTierCreateRequest, QuantityTierUpdateRequest,
  PriceMatrix, PriceMatrixCreateRequest, PriceMatrixUpdateRequest,
  ProductAddon, ProductAddonCreateRequest, ProductAddonUpdateRequest,
  ProductImage,
} from "@/types/admin";

type R<T> = { data: T };
type Msg = { message: string };

// ─── Products ───────────────────────────────────────────
export const productService = {
  getAll: (category?: string) =>
    apiGet<R<ProductListItem[]>>(`/products${category ? `?category=${category}` : ""}`).then(r => r.data),
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
  create: (data: MaterialGroupCreateRequest) =>
    apiPost<R<MaterialGroup>>("/material-groups", data).then(r => r.data),
  update: (id: string, data: MaterialGroupUpdateRequest) =>
    apiPut<R<MaterialGroup>>(`/material-groups/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/material-groups/${id}`),
};

// ─── Materials ──────────────────────────────────────────
export const materialService = {
  getAll: () =>
    apiGet<R<Material[]>>("/materials").then(r => r.data),
  create: (data: MaterialCreateRequest) =>
    apiPost<R<Material>>("/materials", data).then(r => r.data),
  update: (id: string, data: MaterialUpdateRequest) =>
    apiPut<R<Material>>(`/materials/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/materials/${id}`),
};

// ─── Size Variants ──────────────────────────────────────
export const sizeVariantService = {
  getAll: () =>
    apiGet<R<SizeVariant[]>>("/size-variants").then(r => r.data),
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
  create: (data: ProductAddonCreateRequest) =>
    apiPost<R<ProductAddon>>("/product-addons", data).then(r => r.data),
  update: (id: string, data: ProductAddonUpdateRequest) =>
    apiPut<R<ProductAddon>>(`/product-addons/${id}`, data).then(r => r.data),
  delete: (id: string) =>
    apiDelete<Msg>(`/product-addons/${id}`),
};

// ─── Product Images ─────────────────────────────────────
export const productImageService = {
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

// ─── Generic Upload ─────────────────────────────────────
export const uploadService = {
  upload: (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    return apiPostForm<{ url: string }>("/upload", form).then(r => r.url);
  },
};
