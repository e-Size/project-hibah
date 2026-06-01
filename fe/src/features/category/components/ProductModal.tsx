"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveAssetUrl } from "../../../services/api";
import type { CategoryItem, ProductAddon } from "../../../types/product";
import { formatPrice, getPriceLabel } from "../../../utils/format";
import { useProductDetail } from "../../../hooks/useProductDetail";

type Props = {
  product: CategoryItem;
  onClose: () => void;
};

const DEFAULT_IMAGES = ["/baju.png"];
const WHATSAPP_NUMBER = "6281385774811";

function getAddonTitle(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("tipe")) return "Pilih Tipe";
  if (normalized.includes("bahan") || normalized.includes("material")) return "Pilih Bahan";
  if (normalized.includes("warna") || normalized.includes("color")) return "Pilih Warna";

  return `Pilih ${type.replaceAll("_", " ")}`;
}

function getSelectedExtraFee(selectedAddons: Record<string, ProductAddon | undefined>) {
  return Object.values(selectedAddons).reduce((total, addon) => total + (addon?.extra_fee ?? 0), 0);
}

function SelectableAddonGroup({
  title,
  type,
  items,
  selected,
  onSelect,
}: {
  title: string;
  type: string;
  items: ProductAddon[];
  selected?: ProductAddon;
  onSelect: (type: string, addon: ProductAddon) => void;
}) {
  if (items.length === 0) return null;

  const normalizedType = type.toLowerCase();
  const isColorGroup = normalizedType.includes("warna") || normalizedType.includes("color") || items.some((item) => item.color_hex);
  const isMaterialGroup =
    normalizedType.includes("bahan") || normalizedType.includes("material") || items.some((item) => item.image_url || item.desc);

  if (isColorGroup) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="font-bold text-gray-800">
            {title}: <span className="text-[#e8734a]">{selected?.addon_name ?? items[0]?.addon_name}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 pl-1">
          {items.map((item) => {
            const isSelected = selected?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(type, item)}
                title={item.addon_name}
                className="h-10 w-10 rounded-full border border-gray-200 transition-transform hover:scale-110"
                style={{
                  backgroundColor: item.color_hex || "#ffffff",
                  outline: isSelected ? "3px solid #927615" : "none",
                  outlineOffset: "2px",
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  if (isMaterialGroup) {
    return (
      <div>
        <p className="mb-2 font-bold text-gray-800">{title}</p>
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isSelected = selected?.id === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(type, item)}
                className={`flex items-start gap-3 rounded-xl border-2 bg-white p-3 text-left transition-colors ${
                  isSelected ? "border-[#4273B2]" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {item.image_url && (
                  <span className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={resolveAssetUrl(item.image_url) || "/baju.png"} alt={item.addon_name} fill className="object-cover" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-gray-800">{item.addon_name}</span>
                    {isSelected && (
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#4273B2] text-xs text-white">
                        ✓
                      </span>
                    )}
                  </span>
                  {item.desc && <span className="mt-1 block text-xs leading-relaxed text-gray-500">{item.desc}</span>}
                  {item.extra_fee > 0 && <span className="mt-1 block text-xs font-semibold text-[#9F7A04]">+{formatPrice(item.extra_fee)}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 font-bold text-gray-800">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(type, item)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              selected?.id === item.id
                ? "border-[#e8734a] bg-[#e8734a] text-white"
                : "border-gray-300 text-gray-700 hover:border-[#e8734a]"
            }`}
          >
            {item.addon_name}
            {item.extra_fee > 0 ? ` +${formatPrice(item.extra_fee)}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductModal({ product, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { detail, isLoading } = useProductDetail(product.id);
  const [qty, setQty] = useState(24);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, ProductAddon | undefined>>({});

  useEffect(() => {
    setImgIndex(0);
    setSelectedAddons({});
  }, [product.id]);

  useEffect(() => {
    if (!detail) return;
    setQty(Math.max(detail.product.min_qty || 1, 1));
    setSelectedAddons(
      Object.fromEntries(
        Object.entries(detail.addons ?? {})
          .filter(([, items]) => items.length > 0)
          .map(([type, items]) => [type, items[0]])
      )
    );
  }, [detail]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const overlay = overlayRef.current;
    const scrollable = scrollRef.current;
    const preventScroll = (event: WheelEvent) => event.preventDefault();
    const stopBubble = (event: WheelEvent) => event.stopPropagation();

    overlay?.addEventListener("wheel", preventScroll, { passive: false });
    scrollable?.addEventListener("wheel", stopBubble, { passive: false });

    return () => {
      document.body.style.overflow = "";
      overlay?.removeEventListener("wheel", preventScroll);
      scrollable?.removeEventListener("wheel", stopBubble);
    };
  }, []);

  const displayProduct = detail?.product;
  const minQty = Math.max(displayProduct?.min_qty || 24, 1);
  const description =
    displayProduct?.description ||
    "Produk custom untuk kebutuhan event, organisasi, corporate, dan brand. Hubungi admin untuk detail bahan, pilihan warna, dan estimasi produksi.";

  const images = useMemo(() => {
    const detailImages = detail?.images
      .map((image) => resolveAssetUrl(image.url))
      .filter((value): value is string => Boolean(value));

    if (detailImages && detailImages.length > 0) return detailImages;
    if (product.image) return [product.image];

    return DEFAULT_IMAGES;
  }, [detail?.images, product.image]);

  const addonEntries = Object.entries(detail?.addons ?? {}).filter(([, items]) => items.length > 0);
  const selectedExtraFee = getSelectedExtraFee(selectedAddons);
  const selectedPriceLabel =
    detail && detail.price_from > 0 && selectedExtraFee > 0 ? `${getPriceLabel(detail)} + ${formatPrice(selectedExtraFee)}` : getPriceLabel(detail);
  const selectedLines = Object.entries(selectedAddons)
    .filter(([, addon]) => Boolean(addon))
    .map(([type, addon]) => `${type}: ${addon?.addon_name}`);
  const whatsappText = encodeURIComponent(
    `Halo Esize! Saya ingin bertanya tentang produk:\n\n` +
      `Produk: ${product.name}\n` +
      (selectedLines.length > 0 ? `${selectedLines.join("\n")}\n` : "") +
      `Jumlah: ${qty} pcs\n\n` +
      `Mohon info harga dan proses pemesanannya. Terima kasih!`
  );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[82vh] w-full max-w-5xl flex-col gap-6 rounded-2xl bg-[#fdf6f0] p-4 shadow-2xl md:flex-row md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl leading-none text-gray-700 shadow hover:bg-gray-100"
        >
          x
        </button>

        <div className="flex flex-shrink-0 flex-col items-center gap-3 md:w-[45%]">
          <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#7a6a30]">
            <Image src={images[imgIndex]} alt={product.name} fill className="object-contain p-6" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex((index) => (index - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
                >
                  ‹
                </button>
                <button
                  onClick={() => setImgIndex((index) => (index + 1) % images.length)}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-100"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex max-w-full gap-2 overflow-x-auto">
              {images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  onClick={() => setImgIndex(index)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-[#7a6a30] ${
                    index === imgIndex ? "border-[#927615]" : "border-transparent"
                  }`}
                >
                  <Image src={src} alt="" fill className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9F7A04]">
                {displayProduct?.category || product.category || "produk"}
              </p>
              <h2 className="pr-10 text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="mt-1 text-2xl font-bold text-[#e8734a]">{isLoading ? "Memuat..." : selectedPriceLabel}</p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
            </div>

            {addonEntries.map(([type, items]) => (
              <SelectableAddonGroup
                key={type}
                title={getAddonTitle(type)}
                type={type}
                items={items}
                selected={selectedAddons[type]}
                onSelect={(addonType, addon) => setSelectedAddons((current) => ({ ...current, [addonType]: addon }))}
              />
            ))}

            <div>
              <p className="mb-2 font-bold text-gray-800">Jumlah Pesanan (pcs)</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((value) => Math.max(minQty, value - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(event) => setQty(event.target.value === "" ? 0 : Number(event.target.value))}
                  onBlur={() => setQty((value) => (value < minQty ? minQty : value))}
                  className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-gray-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty((value) => value + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-xl text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              <p className="mt-1 text-center text-xs text-gray-400">Minimum order {minQty} pcs</p>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-xl bg-green-500 py-4 text-base font-bold text-white transition-colors hover:bg-green-600"
            >
              Order via WhatsApp
            </a>

            <div className="rounded-xl border border-yellow-300 bg-yellow-50 py-3 text-center text-sm text-gray-500">
              Harga mengikuti spesifikasi dan jumlah pesanan.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
