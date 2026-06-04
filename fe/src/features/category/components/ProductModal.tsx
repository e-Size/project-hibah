"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { resolveAssetUrl } from "../../../services/api";
import type { CategoryItem, PriceMatrix, ProductAddon } from "../../../types/product";
import { formatPrice, getPriceLabel, getPriceRangeLabel } from "../../../utils/format";
import { useProductDetail } from "../../../hooks/useProductDetail";

type Props = {
  product: CategoryItem;
  onClose: () => void;
};

const DEFAULT_IMAGES = ["/baju.png"];
const WHATSAPP_NUMBER = "6281385774811";
const JERSEY_COLLAR_ORDER = [
  "V-Neck Biasa",
  "V-Neck Variasi",
  "V-Neck Variasi Kecil",
  "V-Neck Madrid",
  "V-Neck Tumpuk",
  "O-Neck Biasa",
  "O-Neck Variasi",
  "Polo Biasa",
  "Polo V-Neck Tumpuk",
  "Polo V-Neck Biasa",
  "Polo Resleting",
  "Koko Biasa",
  "Koko Resleting",
  "Hoodie Biasa",
  "Hoodie Resleting",
  "Hoodie Stand Up-Collar",
];

function getAddonTitle(type: string) {
  const normalized = type.toLowerCase();
  if (normalized === "model_kerah") return "Pilih Model Kerah";
  if (normalized.includes("tipe")) return "Pilih Tipe";
  if (normalized.includes("bahan") || normalized.includes("material")) return "Pilih Bahan";
  if (normalized.includes("warna") || normalized.includes("color")) return "Pilih Warna";

  return `Pilih ${type.replaceAll("_", " ")}`;
}

function sortJerseyCollars(items: ProductAddon[]) {
  return [...items].sort(
    (a, b) => JERSEY_COLLAR_ORDER.indexOf(a.addon_name) - JERSEY_COLLAR_ORDER.indexOf(b.addon_name)
  );
}

function getSelectedExtraFee(selectedAddons: Record<string, ProductAddon | undefined>) {
  return Object.values(selectedAddons).reduce((total, addon) => total + (addon?.extra_fee ?? 0), 0);
}

function shouldShowExtraFee(type: string, item: ProductAddon) {
  return item.extra_fee > 0 && type !== "jersey_type" && item.addon_name.toLowerCase() !== "jersey stelan";
}

function isQuantityInTier(matrix: PriceMatrix, qty: number) {
  const tier = matrix.quantity_tier;
  return Boolean(tier && qty >= tier.min_qty && (tier.max_qty === 0 || qty <= tier.max_qty));
}

function getQuantityPriceRange(matrix: PriceMatrix[], qty: number) {
  const prices = matrix
    .filter((item) => isQuantityInTier(item, qty))
    .map((item) => item.price);

  if (prices.length === 0) return null;

  return {
    priceFrom: Math.min(...prices),
    priceTo: Math.max(...prices),
  };
}

function getJerseyPrice(matrix: PriceMatrix[], qty: number, type?: ProductAddon) {
  const variantCode = type?.addon_name.toLowerCase().includes("stelan") ? "PREM" : "STD";
  return matrix.find((item) => item.size_variant?.code === variantCode && isQuantityInTier(item, qty))?.price ?? 0;
}

function SelectableAddonGroup({
  title,
  type,
  items,
  selected,
  onSelect,
  onClear,
}: {
  title: string;
  type: string;
  items: ProductAddon[];
  selected?: ProductAddon;
  onSelect: (type: string, addon: ProductAddon) => void;
  onClear?: (type: string) => void;
}) {
  if (items.length === 0) return null;

  const normalizedType = type.toLowerCase();
  const isColorGroup = normalizedType.includes("warna") || normalizedType.includes("color") || items.some((item) => item.color_hex);
  const isMaterialGroup =
    normalizedType.includes("bahan") || normalizedType.includes("material") || (normalizedType !== "model_kerah" && items.some((item) => item.image_url));

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
                  {shouldShowExtraFee(type, item) && (
                    <span className="mt-1 block text-xs font-semibold text-[#9F7A04]">+{formatPrice(item.extra_fee)}</span>
                  )}
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
        {onClear && (
          <button
            onClick={() => onClear(type)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              !selected
                ? "border-[#e8734a] bg-[#e8734a] text-white"
                : "border-gray-300 text-gray-700 hover:border-[#e8734a]"
            }`}
          >
            Tanpa Tambahan
          </button>
        )}
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
            {shouldShowExtraFee(type, item) ? ` +${formatPrice(item.extra_fee)}` : ""}
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
  const [isMounted, setIsMounted] = useState(false);
  const [qty, setQty] = useState(24);
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, ProductAddon | undefined>>({});

  useEffect(() => {
    setImgIndex(0);
    setSelectedAddons({});
  }, [product.id]);

  useEffect(() => {
    if (!detail) return;
    const isJersey = detail.product.name.trim().toLowerCase() === "jersey";
    const jerseyModels = detail.addons?.model ?? [];
    const defaultJerseyType = jerseyModels.find((item) => item.addon_name.toLowerCase().includes("atasan"));
    const defaultJerseyCollar = detail.addons?.model_kerah?.find((item) => item.addon_name === "V-Neck Biasa");

    setQty(Math.max(detail.product.min_qty || 1, 1));
    setSelectedAddons(
      Object.fromEntries(
        Object.entries(detail.addons ?? {})
          .filter(([type]) => !(isJersey && type === "model"))
          .filter(([, items]) => items.length > 0)
          .map(([type, items]) => [type, isJersey && type === "model_kerah" ? defaultJerseyCollar ?? items[0] : items[0]])
          .concat(isJersey && defaultJerseyType ? [["jersey_type", defaultJerseyType]] : [])
      )
    );
  }, [detail]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const isJersey = (displayProduct?.name ?? product.name).trim().toLowerCase() === "jersey";
  const jerseyModels = detail?.addons?.model ?? [];
  const jerseyTypes = jerseyModels.filter((item) => {
    const name = item.addon_name.toLowerCase();
    return name.includes("atasan") || name.includes("stelan");
  });
  const jerseyModelAddons = jerseyModels.filter((item) => !jerseyTypes.includes(item));
  const addonEntries = Object.entries(detail?.addons ?? {}).filter(([type, items]) => items.length > 0 && !(isJersey && type === "model"));
  const selectedExtraFee = getSelectedExtraFee(
    Object.fromEntries(
      Object.entries(selectedAddons).filter(
        ([type, addon]) => type !== "jersey_type" && addon?.addon_name.toLowerCase() !== "jersey stelan"
      )
    )
  );
  const isTShirt = displayProduct?.name.trim().toLowerCase() === "t-shirt";
  const quantityPriceRange = isTShirt && detail ? getQuantityPriceRange(detail.price_matrix, qty) : null;
  const jerseyPrice = isJersey && detail ? getJerseyPrice(detail.price_matrix, qty, selectedAddons.jersey_type) : 0;
  const basePriceLabel =
    isTShirt && detail
      ? quantityPriceRange
        ? getPriceRangeLabel(quantityPriceRange.priceFrom, quantityPriceRange.priceTo)
        : "Hubungi admin"
      : isJersey
        ? getPriceRangeLabel(jerseyPrice, jerseyPrice)
      : getPriceLabel(detail);
  const selectedPriceLabel =
    isJersey && jerseyPrice > 0
      ? formatPrice(jerseyPrice + selectedExtraFee)
      : basePriceLabel !== "Hubungi admin" && selectedExtraFee > 0
        ? `${basePriceLabel} + ${formatPrice(selectedExtraFee)}`
        : basePriceLabel;
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

  if (!isMounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-5xl flex-col gap-6 overflow-hidden rounded-2xl bg-[#fdf6f0] p-4 shadow-2xl sm:max-h-[calc(100dvh-3rem)] md:max-h-[78dvh] md:flex-row md:p-6"
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
                items={isJersey && type === "model_kerah" ? sortJerseyCollars(items) : items}
                selected={selectedAddons[type]}
                onSelect={(addonType, addon) => setSelectedAddons((current) => ({ ...current, [addonType]: addon }))}
              />
            ))}

            {isJersey && jerseyTypes.length > 0 && (
              <SelectableAddonGroup
                title="Pilih Jenis Jersey"
                type="jersey_type"
                items={jerseyTypes}
                selected={selectedAddons.jersey_type}
                onSelect={(addonType, addon) => setSelectedAddons((current) => ({ ...current, [addonType]: addon }))}
              />
            )}

            {isJersey && jerseyModelAddons.length > 0 && (
              <SelectableAddonGroup
                title="Pilih Model Tambahan"
                type="model"
                items={jerseyModelAddons}
                selected={selectedAddons.model}
                onSelect={(addonType, addon) => setSelectedAddons((current) => ({ ...current, [addonType]: addon }))}
                onClear={(addonType) => setSelectedAddons((current) => ({ ...current, [addonType]: undefined }))}
              />
            )}

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
    </div>,
    document.body
  );
}
