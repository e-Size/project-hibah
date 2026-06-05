import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ApiResponse<T> = {
  data: T;
};

type ProductListItem = {
  id: string;
  name: string;
  category: string;
  pricing_type?: string;
  keywords?: string;
  min_qty?: number;
  description?: string;
};

type ProductAddon = {
  addon_type: string;
  addon_name: string;
  extra_fee: number;
  desc?: string;
};

type PriceMatrix = {
  price: number;
  size_variant?: { label?: string } | null;
  quantity_tier?: { min_qty?: number; max_qty?: number | null } | null;
  material_group?: { name?: string } | null;
};

type ProductDetail = {
  product: ProductListItem;
  price_from: number;
  price_to: number;
  price_matrix: PriceMatrix[];
  addons: Record<string, ProductAddon[]>;
};

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://api.esize.id/api";

const COMPANY_CONTEXT = `TENTANG ESIZE
Esize adalah perusahaan yang bergerak di bidang penyediaan barang dan jasa konveksi serta suvenir. Didirikan tahun 2019, kini telah bertransformasi menjadi perusahaan dengan kapasitas produksi besar ke seluruh Indonesia dan luar negeri. Fasilitas produksi modern, tim berpengalaman lebih dari 10 tahun. Tagline: "Seize the Sequence to Your Perfect Size."

KONTAK ESIZE
- WhatsApp/Telepon: 0851 5604 3052
- Email: esize.official@gmail.com
- Website: www.esize.id
- Instagram: @esize.id | Katalog: @esize.katalog
- Portfolio: https://bit.ly/PortfolioEsizeid

ALAMAT
- Solo (Office, Store, Workshop semua produk): Ruko Victoria, Jl. Tentara Pelajar No. 3, Gilingan, Banjarsari, Surakarta, Jawa Tengah 57134
- Bandung (Workshop Kaos & Jaket): Jl. Sukasirna No.30, Padasuka, Cibeunying Kidul, Bandung, Jawa Barat 40122

BENEFIT MEMESAN DI ESIZE
- DP 0% dan bisa dicicil
- Subsidi ongkir hingga 100% ke seluruh Indonesia
- Desain gratis
- Diskon dan cashback melimpah
- Garansi anticacat dengan retur mudah
- Kualitas premium, tim berpengalaman 20+ tahun
- Sampel gratis (proofing setelah pemesanan)
- Harga affordable sesuai budget

KLIEN & PENCAPAIAN
- Lebih dari 20.000 customer dalam 6 tahun
- Melayani 2.000+ universitas & institusi di Indonesia
- Pernah melayani klien dari Spanyol dan Jepang`;

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatQuantityTier(tier?: PriceMatrix["quantity_tier"]): string {
  if (!tier) return "";
  if (tier.min_qty && tier.max_qty) return `${tier.min_qty}-${tier.max_qty} pcs`;
  if (tier.min_qty) return `${tier.min_qty}+ pcs`;
  if (tier.max_qty) return `maks. ${tier.max_qty} pcs`;
  return "";
}

function formatProductDetail(detail: ProductDetail): string {
  const { product, price_from, price_to, price_matrix, addons } = detail;
  const lines = [
    `PRODUK: ${product.name}`,
    `Kategori: ${product.category}`,
    product.min_qty ? `Minimum order: ${product.min_qty} pcs` : "",
    product.description ? `Deskripsi: ${product.description}` : "",
    price_from && price_to
      ? `Range harga: ${formatRupiah(price_from)}${price_from !== price_to ? ` - ${formatRupiah(price_to)}` : ""}`
      : "",
  ].filter(Boolean);

  const addonLines = Object.entries(addons ?? {}).flatMap(([type, items]) => {
    if (!items?.length) return [];
    const values = items
      .map((item) => {
        const fee = item.extra_fee ? ` (+${formatRupiah(item.extra_fee)})` : "";
        const desc = item.desc ? ` - ${item.desc}` : "";
        return `${item.addon_name}${fee}${desc}`;
      })
      .join("; ");
    return [`Pilihan ${type}: ${values}`];
  });

  const priceLines = price_matrix.slice(0, 40).map((item) => {
    const parts = [
      formatQuantityTier(item.quantity_tier),
      item.size_variant?.label,
      item.material_group?.name,
    ].filter(Boolean);
    return `- ${parts.length ? `${parts.join(" | ")}: ` : ""}${formatRupiah(item.price)}`;
  });

  return [
    lines.join("\n"),
    addonLines.length ? `ADDON:\n${addonLines.join("\n")}` : "",
    priceLines.length ? `HARGA:\n${priceLines.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function getEsizeDataContext(): Promise<string> {
  const productsResponse = await apiGet<ApiResponse<ProductListItem[]>>("/products");
  const products = productsResponse.data;

  const details = await Promise.all(
    products.map(async (product) => {
      const response = await apiGet<ApiResponse<ProductDetail>>(`/products/${product.id}`);
      return response.data;
    })
  );

  return details.map(formatProductDetail).join("\n\n---\n\n");
}

function buildSystemPrompt(dataContext: string): string {
  return `Kamu adalah asisten virtual Esize, perusahaan konveksi dan souvenir di Indonesia.

ATURAN WAJIB:
1. Jawab HANYA berdasarkan data Esize yang tersedia di bawah ini. JANGAN mengarang, berasumsi, atau menjawab dari pengetahuan umum.
2. Jika pertanyaan tidak bisa dijawab dari data yang ada, WAJIB jawab dengan: "Maaf, saya tidak memiliki informasi tersebut. Silakan hubungi CS Esize langsung di WhatsApp: 0851 5604 3052 untuk informasi lebih lanjut. 😊". Tambahkan kata-kata improvisasi agar lebih panjang dan menarik.
3. Jangan pernah membuat informasi harga, produk, atau detail lain yang tidak ada di data.
4. Tetap ramah dan sopan dalam setiap jawaban.
5. Jawab dalam Bahasa Indonesia.

=== DATA ESIZE ===

${COMPANY_CONTEXT}

DATA PRODUK, ADDON, DAN HARGA DARI DATABASE
${dataContext || "Data produk sedang tidak tersedia dari database."}

=== END DATA ===

Jika pelanggan ingin pesan atau butuh info lebih detail yang tidak ada di data ini, arahkan ke WhatsApp: 0851 5604 3052.`;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const dataContext = await getEsizeDataContext();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: buildSystemPrompt(dataContext) },
      ...messages,
    ],
    max_tokens: 512,
    temperature: 0.7,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
