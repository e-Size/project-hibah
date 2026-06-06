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
  asPage?: boolean;
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
  if (normalized === "lebar") return "Pilih Lebar";
  if (normalized === "extra") return "Pilih Extra";

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
  return item.extra_fee !== 0 && type !== "jersey_type" && item.addon_name.toLowerCase() !== "jersey stelan";
}

function formatExtraFee(value: number) {
  return value > 0 ? `+${formatPrice(value)}` : formatPrice(value);
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

function getJacketRows(matrix: PriceMatrix[], type?: ProductAddon) {
  if (!type) return [];
  return matrix.filter((item) => item.size_variant?.label === type.addon_name);
}

function getJacketPrice(matrix: PriceMatrix[], type?: ProductAddon, material?: ProductAddon) {
  if (!type || !material) return 0;
  return matrix.find(
    (item) => item.size_variant?.label === type.addon_name && item.material_group?.name === material.addon_name
  )?.price ?? 0;
}

function getTumblerRows(matrix: PriceMatrix[], jenis?: ProductAddon) {
  if (!jenis) return [];
  return matrix.filter((item) => item.size_variant?.label === jenis.addon_name);
}

function getTumblerPrice(matrix: PriceMatrix[], jenis?: ProductAddon, cetak?: ProductAddon) {
  if (!jenis || !cetak) return 0;
  return matrix.find(
    (item) => item.size_variant?.label === jenis.addon_name && item.material_group?.name === cetak.addon_name
  )?.price ?? 0;
}

function getFleecePrice(matrix: PriceMatrix[], qty: number, material?: ProductAddon) {
  if (!material) return 0;
  const variantCode = material.addon_name === "Fleece PE" ? "STD" : "PREM";
  return matrix.find((item) => item.size_variant?.code === variantCode && isQuantityInTier(item, qty))?.price ?? 0;
}

function getMaterialQuantityPrice(matrix: PriceMatrix[], qty: number, material?: ProductAddon) {
  if (!material) return 0;
  return matrix.find(
    (item) => item.material_group?.name === material.addon_name && isQuantityInTier(item, qty)
  )?.price ?? 0;
}

function getTypeRows(matrix: PriceMatrix[], type?: ProductAddon) {
  if (!type) return [];
  return matrix.filter((item) => item.size_variant?.label === type.addon_name);
}

function getTypeMaterialPrice(matrix: PriceMatrix[], type?: ProductAddon, material?: ProductAddon) {
  if (!type || !material) return 0;
  return matrix.find(
    (item) => item.size_variant?.label === type.addon_name && item.material_group?.name === material.addon_name
  )?.price ?? 0;
}

function getMaterialVariantPrice(matrix: PriceMatrix[], material?: ProductAddon, variant?: ProductAddon) {
  if (!material || !variant) return 0;
  return matrix.find(
    (item) => item.material_group?.name === material.addon_name && item.size_variant?.label === variant.addon_name
  )?.price ?? 0;
}

function getVariantQuantityPrice(matrix: PriceMatrix[], qty: number, variant?: ProductAddon) {
  if (!variant) return 0;
  return matrix.find(
    (item) => item.size_variant?.label === variant.addon_name && isQuantityInTier(item, qty)
  )?.price ?? 0;
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
          {onClear && (
            <button
              onClick={() => onClear(type)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!selected
                  ? "border-[#e8734a] bg-[#e8734a] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-[#e8734a]"
                }`}
            >
              Tanpa Tambahan
            </button>
          )}
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
                onClick={() => isSelected && onClear ? onClear(type) : onSelect(type, item)}
                className={`flex items-start gap-3 rounded-xl border-2 bg-white p-3 text-left transition-colors ${isSelected ? "border-[#4273B2]" : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                {item.image_url && (
                  <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={resolveAssetUrl(item.image_url) || "/baju.png"}
                      alt={item.addon_name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
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
                    <span className="mt-1 block text-xs font-semibold text-[#9F7A04]">{formatExtraFee(item.extra_fee)}</span>
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
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!selected
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
            onClick={() => selected?.id === item.id && onClear ? onClear(type) : onSelect(type, item)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${selected?.id === item.id
                ? "border-[#e8734a] bg-[#e8734a] text-white"
                : "border-gray-300 text-gray-700 hover:border-[#e8734a]"
              }`}
          >
            {item.addon_name}
            {shouldShowExtraFee(type, item) ? ` ${formatExtraFee(item.extra_fee)}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddonNotes({
  items,
  title = "Catatan Model & Ukuran",
  description = "Biaya tambahan dihitung sesuai jumlah produk pada masing-masing variasi, bukan seluruh jumlah pesanan.",
}: {
  items: ProductAddon[];
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
      <p className="font-bold text-gray-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.id} className="rounded-full border border-yellow-300 bg-white px-3 py-1.5 text-xs text-gray-700">
            {item.addon_name}
            {shouldShowExtraFee(item.addon_type, item) ? ` ${formatExtraFee(item.extra_fee)}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProductModal({ product, onClose, asPage = false }: Props) {
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
    const isTShirt = detail.product.name.trim().toLowerCase() === "t-shirt";
    const jerseyModels = detail.addons?.model ?? [];
    const defaultJerseyType = jerseyModels.find((item) => item.addon_name.toLowerCase().includes("atasan"));
    const defaultJerseyCollar = detail.addons?.model_kerah?.find((item) => item.addon_name === "V-Neck Biasa");
    const isJacket = detail.product.name.trim().toLowerCase() === "jacket";
    const isPdh = detail.product.name.trim().toLowerCase() === "kemeja / pdh";
    const isCap = detail.product.name.trim().toLowerCase() === "cap / bucket";
    const isIdLanyard = detail.product.name.trim().toLowerCase() === "id card & lanyard";
    const defaultJacketType = detail.addons?.tipe?.find((item) => item.addon_name === "Semi Parka / Trucker") ?? detail.addons?.tipe?.[0];
    const defaultJacketMaterialName = getJacketRows(detail.price_matrix, defaultJacketType)[0]?.material_group?.name;
    const defaultJacketMaterial = detail.addons?.bahan?.find((item) => item.addon_name === defaultJacketMaterialName);
    const defaultCapType = detail.addons?.jenis?.find((item) => item.addon_name === "Baseball Cap") ?? detail.addons?.jenis?.[0];
    const defaultCapMaterialName = getTypeRows(detail.price_matrix, defaultCapType)[0]?.material_group?.name;
    const defaultCapMaterial = detail.addons?.bahan?.find((item) => item.addon_name === defaultCapMaterialName);
    const isTumblerLocal = detail.product.name.trim().toLowerCase() === "tumbler";
    const defaultTumblerJenis = detail.addons?.jenis?.[0];
    const defaultTumblerCetakName = getTumblerRows(detail.price_matrix, defaultTumblerJenis)[0]?.material_group?.name;
    const defaultTumblerCetak = detail.addons?.cetak?.find((item) => item.addon_name === defaultTumblerCetakName);

    setQty(Math.max(detail.product.min_qty || 1, 1));
    setSelectedAddons(
      Object.fromEntries(
        Object.entries(detail.addons ?? {})
          .filter(([type]) => !(isJersey && type === "model"))
          .filter(([type]) => !(isTShirt && (type === "model" || type === "ukuran")))
          .filter(([type]) => !(isPdh && (type === "model" || type === "warna")))
          .filter(([type]) => !(isIdLanyard && type === "cetak"))
          .filter(([, items]) => items.length > 0)
          .map(([type, items]) => {
            if (isJersey && type === "model_kerah") return [type, defaultJerseyCollar ?? items[0]];
            if (isJacket && type === "tipe") return [type, defaultJacketType ?? items[0]];
            if (isJacket && type === "bahan") return [type, defaultJacketMaterial ?? items[0]];
            if (isTumblerLocal && type === "jenis") return [type, defaultTumblerJenis ?? items[0]];
            if (isTumblerLocal && type === "cetak") return [type, defaultTumblerCetak ?? items[0]];
            if (isCap && type === "jenis") return [type, defaultCapType ?? items[0]];
            if (isCap && type === "bahan") return [type, defaultCapMaterial ?? items[0]];
            return [type, items[0]];
          })
          .concat(isJersey && defaultJerseyType ? [["jersey_type", defaultJerseyType]] : [])
      )
    );
  }, [detail]);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    if (asPage) return;

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
  }, [asPage]);

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
  const isJacket = (displayProduct?.name ?? product.name).trim().toLowerCase() === "jacket";
  const normalizedProductName = (displayProduct?.name ?? product.name).trim().toLowerCase();
  const isTShirt = normalizedProductName === "t-shirt";
  const isFleeceProduct = normalizedProductName === "hoodie" || normalizedProductName === "sweater" || normalizedProductName === "crewneck";
  const isPdh = normalizedProductName === "kemeja / pdh";
  const isCap = normalizedProductName === "cap / bucket";
  const isToteBag = normalizedProductName === "tote bag";
  const isIdLanyard = normalizedProductName === "id card & lanyard";
  const isSticker = normalizedProductName === "sticker";
  const isKeychain = normalizedProductName === "key chain" || normalizedProductName === "pin";
  const isWristband = normalizedProductName === "wristband";
  const isTumbler = normalizedProductName === "tumbler";
  const tShirtNotes = isTShirt
    ? [...(detail?.addons?.model ?? []), ...(detail?.addons?.ukuran ?? [])]
    : [];
  const pdhNotes = isPdh
    ? [...(detail?.addons?.model ?? []), ...(detail?.addons?.warna ?? [])]
    : [];
  const jerseyModels = detail?.addons?.model ?? [];
  const jerseyTypes = jerseyModels.filter((item) => {
    const name = item.addon_name.toLowerCase();
    return name.includes("atasan") || name.includes("stelan");
  });
  const jerseyModelAddons = jerseyModels.filter((item) => !jerseyTypes.includes(item));
  const jacketRows = isJacket && detail ? getJacketRows(detail.price_matrix, selectedAddons.tipe) : [];
  const jacketMaterialNames = new Set(jacketRows.map((item) => item.material_group?.name).filter(Boolean));
  const tumblerRows = isTumbler && detail ? getTumblerRows(detail.price_matrix, selectedAddons.jenis) : [];
  const tumblerCetakNames = new Set(tumblerRows.map((item) => item.material_group?.name).filter(Boolean));
  const capRows = isCap && detail ? getTypeRows(detail.price_matrix, selectedAddons.jenis) : [];
  const capMaterialNames = new Set(capRows.map((item) => item.material_group?.name).filter(Boolean));
  const validIdLanyardPackages = isIdLanyard && detail
    ? new Set(detail.price_matrix.filter((item) => isQuantityInTier(item, qty)).map((item) => item.size_variant?.label).filter(Boolean))
    : new Set<string>();
  const addonEntries = Object.entries(detail?.addons ?? {})
    .filter(
      ([type, items]) =>
        items.length > 0 &&
        !(isJersey && type === "model") &&
        !(isTShirt && (type === "model" || type === "ukuran")) &&
        !(isPdh && (type === "model" || type === "warna")) &&
        !(isIdLanyard && type === "cetak")
    )
    .map(([type, items]) => {
      const filtered =
        isJacket && type === "bahan"
          ? items.filter((item) => jacketMaterialNames.has(item.addon_name))
          : isTumbler && type === "cetak"
            ? items.filter((item) => tumblerCetakNames.has(item.addon_name))
            : isCap && type === "bahan"
              ? items.filter((item) => capMaterialNames.has(item.addon_name))
              : isIdLanyard && type === "paket"
                ? items.filter((item) => validIdLanyardPackages.has(item.addon_name))
                : items;
      return [type, filtered] as const;
    })
    .filter(([, items]) => items.length > 0)
    .sort(([typeA], [typeB]) => {
      if (!isJacket && !isCap && !isToteBag && !isTumbler) return 0;
      const order = { tipe: 0, jenis: 0, bahan: 1, cetak: 2 };
      return (order[typeA as keyof typeof order] ?? 2) - (order[typeB as keyof typeof order] ?? 2);
    });
  const selectedExtraFee = getSelectedExtraFee(
    Object.fromEntries(
      Object.entries(selectedAddons).filter(
        ([type, addon]) => type !== "jersey_type" && addon?.addon_name.toLowerCase() !== "jersey stelan"
      )
    )
  );
  const quantityPriceRange = isTShirt && detail ? getQuantityPriceRange(detail.price_matrix, qty) : null;
  const jerseyPrice = isJersey && detail ? getJerseyPrice(detail.price_matrix, qty, selectedAddons.jersey_type) : 0;
  const jacketPrice = isJacket && detail ? getJacketPrice(detail.price_matrix, selectedAddons.tipe, selectedAddons.bahan) : 0;
  const fleecePrice = isFleeceProduct && detail ? getFleecePrice(detail.price_matrix, qty, selectedAddons.bahan) : 0;
  const pdhPrice = isPdh && detail ? getMaterialQuantityPrice(detail.price_matrix, qty, selectedAddons.bahan) : 0;
  const capPrice = isCap && detail ? getTypeMaterialPrice(detail.price_matrix, selectedAddons.jenis, selectedAddons.bahan) : 0;
  const tumblerPrice = isTumbler && detail ? getTumblerPrice(detail.price_matrix, selectedAddons.jenis, selectedAddons.cetak) : 0;
  const toteBagPrice = isToteBag && detail ? getMaterialVariantPrice(detail.price_matrix, selectedAddons.bahan, selectedAddons.cetak) : 0;
  const idLanyardPrice = isIdLanyard && detail ? getVariantQuantityPrice(detail.price_matrix, qty, selectedAddons.paket) : 0;
  const stickerPrice = isSticker && detail ? getVariantQuantityPrice(detail.price_matrix, qty, selectedAddons.bahan) : 0;
  const keychainPrice = isKeychain && detail ? getVariantQuantityPrice(detail.price_matrix, qty, selectedAddons.bahan) : 0;
  const wristbandPrice = isWristband && detail ? getVariantQuantityPrice(detail.price_matrix, qty, selectedAddons.tipe) : 0;
  const wristbandTiers = useMemo(() => {
    if (!isWristband || !detail) return [] as number[];
    const seen = new Set<number>();
    return detail.price_matrix
      .map((pm) => pm.quantity_tier?.min_qty ?? 0)
      .filter((v) => v > 0 && !seen.has(v) && seen.add(v))
      .sort((a, b) => a - b);
  }, [isWristband, detail]);
  const basePriceLabel =
    isTShirt && detail
      ? quantityPriceRange
        ? getPriceRangeLabel(quantityPriceRange.priceFrom, quantityPriceRange.priceTo)
        : "Hubungi admin"
      : isJersey
        ? getPriceRangeLabel(jerseyPrice, jerseyPrice)
        : isJacket
          ? jacketPrice > 0
            ? `Start From ${formatPrice(jacketPrice)}`
            : "Hubungi admin"
          : isFleeceProduct
            ? fleecePrice > 0
              ? formatPrice(fleecePrice)
              : selectedAddons.bahan?.addon_name === "Fleece PE"
                ? "Hubungi admin"
                : "Nego / Hubungi admin"
            : isPdh
              ? getPriceRangeLabel(pdhPrice, pdhPrice)
              : isCap
                ? getPriceRangeLabel(capPrice, capPrice)
                : isTumbler
                  ? tumblerPrice > 0
                    ? formatPrice(tumblerPrice)
                    : "Hubungi admin"
                  : isToteBag
                    ? getPriceRangeLabel(toteBagPrice, toteBagPrice)
                    : isIdLanyard
                      ? getPriceRangeLabel(idLanyardPrice, idLanyardPrice)
                      : isSticker
                        ? stickerPrice > 0
                          ? formatPrice(stickerPrice)
                          : "Hubungi admin"
                        : isKeychain
                          ? keychainPrice > 0
                            ? formatPrice(keychainPrice)
                            : "Hubungi admin"
                          : isWristband
                            ? wristbandPrice > 0
                              ? formatPrice(wristbandPrice)
                              : "Hubungi admin"
                            : getPriceLabel(detail);
  const selectedPriceLabel =
    isJersey && jerseyPrice > 0
      ? formatPrice(jerseyPrice + selectedExtraFee)
      : isPdh && pdhPrice > 0
        ? formatPrice(pdhPrice + selectedExtraFee)
        : (isSticker || isKeychain)
          ? basePriceLabel
          : isWristband && wristbandPrice > 0
            ? formatPrice(wristbandPrice + selectedExtraFee)
            : basePriceLabel !== "Hubungi admin" && selectedExtraFee > 0
              ? `${basePriceLabel} + ${formatPrice(selectedExtraFee)}`
              : basePriceLabel;
  const handleAddonSelect = (addonType: string, addon: ProductAddon) => {
    setSelectedAddons((current) => {
      if (isTumbler && addonType === "jenis" && detail) {
        const firstCetakName = getTumblerRows(detail.price_matrix, addon)[0]?.material_group?.name;
        const firstCetak = detail.addons?.cetak?.find((item) => item.addon_name === firstCetakName);
        return { ...current, jenis: addon, cetak: firstCetak };
      }

      if (isCap && addonType === "jenis" && detail) {
        const firstMaterialName = getTypeRows(detail.price_matrix, addon)[0]?.material_group?.name;
        const firstMaterial = detail.addons?.bahan?.find((item) => item.addon_name === firstMaterialName);
        return { ...current, jenis: addon, bahan: firstMaterial };
      }

      if (!isJacket || addonType !== "tipe" || !detail) return { ...current, [addonType]: addon };

      const firstMaterialName = getJacketRows(detail.price_matrix, addon)[0]?.material_group?.name;
      const firstMaterial = detail.addons?.bahan?.find((item) => item.addon_name === firstMaterialName);
      return { ...current, tipe: addon, bahan: firstMaterial };
    });
  };
  useEffect(() => {
    if (!isIdLanyard || !detail) return;
    const validPackages = detail.addons?.paket?.filter((item) =>
      detail.price_matrix.some((matrix) => matrix.size_variant?.label === item.addon_name && isQuantityInTier(matrix, qty))
    ) ?? [];
    if (validPackages.some((item) => item.id === selectedAddons.paket?.id)) return;
    setSelectedAddons((current) => ({ ...current, paket: validPackages[0] }));
  }, [detail, isIdLanyard, qty, selectedAddons.paket?.id]);
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

  if (!asPage && !isMounted) return null;

  const sharedPanels = (
    <>
      <div className="flex flex-shrink-0 flex-col items-center gap-3 md:w-[45%]">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#7a6a30]">
          <Image
            src={images[imgIndex]}
            alt={product.name}
            fill
            sizes="(max-width: 767px) calc(100vw - 32px), 45vw"
            loading="eager"
            className="object-contain p-6"
          />
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
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-[#7a6a30] ${index === imgIndex ? "border-[#927615]" : "border-transparent"
                  }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-visible pr-1 md:overflow-y-auto md:overscroll-contain">
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
              onSelect={handleAddonSelect}
              onClear={
                (isPdh && (type === "model" || type === "warna")) ||
                  (isWristband && (type === "extra" || type === "lebar"))
                  ? (addonType) => setSelectedAddons((current) => ({ ...current, [addonType]: undefined }))
                  : undefined
              }
            />
          ))}

          {isSticker && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="font-bold text-gray-800">Harga termasuk:</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                <li>• Per 1 A3 dengan area cetak 297 × 448 mm</li>
                <li>• Die Cut / Kiss Cut</li>
                <li>• Dapat dibuat Sticker Pack</li>
                <li>• Laminating tekstur Doff / Glossy / Tidak dilaminating</li>
              </ul>
            </div>
          )}

          {isWristband && wristbandTiers.length > 0 && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
              <p className="font-bold text-gray-800">Catatan Pemesanan</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-600">
                <li>• Quantity tersedia: {wristbandTiers.map((t) => t.toLocaleString("id-ID")).join(", ")} pcs</li>
                <li>• Lebar standar: maks. 1,5 cm (harga di atas sudah termasuk lebar ini)</li>
                <li>• Biaya tambahan dikenakan untuk lebar 2 cm, 2,5 cm, atau 3 cm</li>
              </ul>
            </div>
          )}

          {isTShirt && tShirtNotes.length > 0 && <AddonNotes items={tShirtNotes} />}

          {isPdh && pdhNotes.length > 0 && (
            <AddonNotes
              items={pdhNotes}
              title="Catatan Model & Warna"
              description="Penyesuaian model dan variasi warna akan dihitung sesuai jumlah masing-masing variasi saat konfirmasi pesanan."
            />
          )}

          {isIdLanyard && (detail?.addons?.cetak?.length ?? 0) > 0 && (
            <SelectableAddonGroup
              title="Pilihan Cetak ID Card"
              type="cetak"
              items={detail?.addons?.cetak ?? []}
              selected={selectedAddons.cetak}
              onSelect={handleAddonSelect}
              onClear={(addonType) => setSelectedAddons((current) => ({ ...current, [addonType]: undefined }))}
            />
          )}

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

          <div className="max-w-full overflow-hidden">
            <p className="mb-2 font-bold text-gray-800">Jumlah Pesanan (pcs)</p>
            <div className="flex items-center gap-2 w-full min-w-0">
              <button
                onClick={() => {
                  if (isWristband && wristbandTiers.length > 0) {
                    setQty((value) => {
                      const idx = wristbandTiers.indexOf(value);
                      return idx > 0 ? wristbandTiers[idx - 1] : value;
                    });
                  } else {
                    setQty((value) => Math.max(minQty, value - 1));
                  }
                }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 text-xl text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={qty === 0 ? "" : qty}
                onChange={(event) => setQty(event.target.value === "" ? 0 : Number(event.target.value))}
                onBlur={() => {
                  if (isWristband && wristbandTiers.length > 0) {
                    setQty((value) => {
                      const nearest = wristbandTiers.reduce((prev, curr) =>
                        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                      );
                      return nearest;
                    });
                  } else {
                    setQty((value) => (value < minQty ? minQty : value));
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 py-2 text-center text-gray-800 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => {
                  if (isWristband && wristbandTiers.length > 0) {
                    setQty((value) => {
                      const idx = wristbandTiers.indexOf(value);
                      return idx < wristbandTiers.length - 1 ? wristbandTiers[idx + 1] : value;
                    });
                  } else {
                    setQty((value) => value + 1);
                  }
                }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 text-xl text-gray-600 hover:bg-gray-100"
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
            className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-4 text-base font-bold text-white transition-colors hover:bg-green-600"
          >
            <span className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white">
              <Image src="/whatsapp-logo.svg" alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            </span>
            Order via WhatsApp
          </a>

          <div className="rounded-xl border border-yellow-300 bg-yellow-50 py-3 text-center text-sm text-gray-500">
            Harga mengikuti spesifikasi dan jumlah pesanan.
          </div>
        </div>
      </div>
    </>
  );

  const shimmer = "animate-pulse bg-gray-200 rounded-lg";

  const loadingPanel = (
    <>
      {/* Left: image skeleton */}
      <div className="flex flex-shrink-0 flex-col items-center gap-3 md:w-[45%]">
        <div className={`aspect-square w-full rounded-xl ${shimmer}`} />
        <div className="flex gap-2">
          {[0, 1, 2].map(i => <div key={i} className={`h-16 w-16 rounded-lg ${shimmer}`} />)}
        </div>
      </div>

      {/* Right: info skeleton */}
      <div className="flex flex-1 flex-col gap-4">
        <div className={`h-3 w-20 ${shimmer}`} />
        <div className={`h-6 w-40 ${shimmer}`} />
        <div className={`h-6 w-28 ${shimmer}`} />
        <div className="flex flex-col gap-2">
          <div className={`h-3 w-full ${shimmer}`} />
          <div className={`h-3 w-5/6 ${shimmer}`} />
          <div className={`h-3 w-4/6 ${shimmer}`} />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className={`h-4 w-28 ${shimmer}`} />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(i => <div key={i} className={`h-8 w-16 rounded-full ${shimmer}`} />)}
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className={`h-4 w-36 ${shimmer}`} />
          <div className={`h-10 w-full rounded-lg ${shimmer}`} />
        </div>
        <div className={`h-12 w-full rounded-xl ${shimmer} mt-2`} />
      </div>
    </>
  );

  if (asPage) {
    return (
      <div className="min-h-screen bg-[#fdf6f0] px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onClose}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#9F7A04] hover:underline"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Kembali
          </button>
          <div className="flex flex-col gap-6 md:flex-row">
            {isLoading ? loadingPanel : sharedPanels}
          </div>
        </div>
      </div>
    );
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-2 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl touch-pan-y flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl bg-[#fdf6f0] p-3 shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:gap-6 sm:p-4 md:max-h-[78dvh] md:flex-row md:overflow-hidden md:gap-6 md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl leading-none text-gray-700 shadow hover:bg-gray-100"
        >
          x
        </button>
        {isLoading ? loadingPanel : sharedPanels}
      </div>
    </div>,
    document.body
  );
}
