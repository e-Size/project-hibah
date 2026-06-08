// ─── Pagination ─────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ─── Base ───────────────────────────────────────────────
export interface Base {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// ─── Product ────────────────────────────────────────────
export interface Product extends Base {
  name: string;
  category: string;       // "pakaian" | "merch"
  pricing_type: string;
  bg_color: string;
  keywords: string;
  min_qty: number;
  description: string;
}

export interface ProductListItem extends Product {
  thumbnail: string;
}

export interface ProductCreateRequest {
  name: string;
  category: string;
  pricing_type: string;
  bg_color?: string;
  keywords?: string;
  min_qty?: number;
  description?: string;
}

export interface ProductUpdateRequest {
  name?: string;
  category?: string;
  pricing_type?: string;
  bg_color?: string;
  keywords?: string;
  min_qty?: number;
  description?: string;
}

// ─── Material Group ─────────────────────────────────────
export interface MaterialGroup extends Base {
  name: string;
  image_url?: string;
}

export interface MaterialGroupCreateRequest {
  name: string;
  image_url?: string;
}

export interface MaterialGroupUpdateRequest {
  name?: string;
  image_url?: string;
}

// ─── Size Variant ───────────────────────────────────────
export interface SizeVariant extends Base {
  code: string;
  label: string;
  variant_type: string;
}

export interface SizeVariantCreateRequest {
  code: string;
  label: string;
  variant_type: string;
}

export interface SizeVariantUpdateRequest {
  code?: string;
  label?: string;
  variant_type?: string;
}

// ─── Quantity Tier ──────────────────────────────────────
export interface QuantityTier extends Base {
  min_qty: number;
  max_qty: number;
  label: string;
}

export interface QuantityTierCreateRequest {
  min_qty: number;
  max_qty?: number;
  label: string;
}

export interface QuantityTierUpdateRequest {
  min_qty?: number;
  max_qty?: number;
  label?: string;
}

// ─── Price Matrix ───────────────────────────────────────
export interface PriceMatrix extends Base {
  product_id: string;
  size_variant_id: string | null;
  quantity_tier_id: string | null;
  material_group_id: string | null;
  price: number;
  size_variant?: SizeVariant;
  quantity_tier?: QuantityTier;
  material_group?: MaterialGroup;
}

export interface PriceMatrixCreateRequest {
  product_id: string;
  size_variant_id?: string | null;
  quantity_tier_id?: string | null;
  material_group_id?: string | null;
  price: number;
}

export interface PriceMatrixUpdateRequest {
  size_variant_id?: string | null;
  quantity_tier_id?: string | null;
  material_group_id?: string | null;
  price?: number;
}

// ─── Product Addon ──────────────────────────────────────
export interface ProductAddon extends Base {
  product_id: string;
  addon_type: string;   // "tipe" | "bahan" | "warna"
  addon_name: string;
  extra_fee: number;
  color_hex: string;
  image_url: string;
  desc: string;
}

export interface ProductAddonCreateRequest {
  product_id: string;
  addon_type: string;
  addon_name: string;
  extra_fee?: number;
  color_hex?: string;
  image_url?: string;
  desc?: string;
}

export interface ProductAddonUpdateRequest {
  addon_type?: string;
  addon_name?: string;
  extra_fee?: number;
  color_hex?: string;
  image_url?: string;
  desc?: string;
}

// ─── Product Image ──────────────────────────────────────
export interface ProductImage extends Base {
  product_id: string;
  url: string;
  order: number;
}

// ─── Size Guide ─────────────────────────────────────────
export interface SizeGuide extends Base {
  product_id: string;
  image_url: string;
}

// ─── Color Palette ──────────────────────────────────────
export interface ColorPalette extends Base {
  product_id: string;
  colors: string[];
}

export interface ColorPaletteCreateRequest {
  product_id: string;
  colors: string[];
}

export interface ColorPaletteUpdateRequest {
  colors: string[];
}

// ─── Extra Image ────────────────────────────────────────
export interface ExtraImage extends Base {
  name: string;
  description: string;
  image_url: string;
}

export interface ExtraImageCreateRequest {
  name: string;
  description?: string;
  image_url: string;
}

export interface ExtraImageUpdateRequest {
  name?: string;
  description?: string;
  image_url?: string;
}
