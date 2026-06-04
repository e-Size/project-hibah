export type ProductCategory = "pakaian" | "merch";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  pricing_type: string;
  bg_color: string;
  keywords: string;
  min_qty: number;
  description: string;
  thumbnail: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  order: number;
};

export type ExtraImage = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductAddon = {
  id: string;
  product_id: string;
  addon_type: string;
  addon_name: string;
  extra_fee: number;
  color_hex: string;
  image_url: string;
  desc: string;
};

export type QuantityTier = {
  id: string;
  min_qty: number;
  max_qty: number;
  label: string;
};

export type SizeVariant = {
  id: string;
  code: string;
  label: string;
  variant_type: string;
};

export type MaterialGroup = {
  id: string;
  name: string;
  image_url?: string;
};

export type PriceMatrix = {
  id: string;
  product_id: string;
  price: number;
  size_variant?: SizeVariant | null;
  quantity_tier?: QuantityTier | null;
  material_group?: MaterialGroup | null;
};

export type ProductDetail = {
  product: Product;
  images: ProductImage[];
  price_from: number;
  price_to: number;
  price_matrix: PriceMatrix[];
  addons: Record<string, ProductAddon[]>;
};

export type CategoryItem = {
  id?: string;
  name: string;
  bg: string;
  category?: ProductCategory;
  image?: string;
  keywords?: string[];
};
