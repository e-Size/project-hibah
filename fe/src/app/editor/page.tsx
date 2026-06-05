"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import JSZip from "jszip";
import FontPicker from "react-fontpicker-ts";
import "react-fontpicker-ts/dist/index.css";
import OnboardingTour, { type TourStep } from "@/components/ui/OnboardingTour";
import ViewportScaler from "@/components/ui/ViewportScaler";
import { getExtraImages, resolveAssetUrl } from "@/services/api";
import type { ExtraImage } from "@/types/product";

type SidebarTab = "product" | "upload" | "text" | "layers" | "views" | null;
type ViewType = "front" | "back" | "left" | "right";
type Size = "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";
type ElType = "image" | "text";

const CANVAS = 520;
const sizes: Size[] = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const colors = [
  "#111111", "#d4c4a8", "#8b6340", "#2b5fd4", "#c41e3a", "#1a472a", "#64748b",
  "#c0392b", "#4d7c0f", "#7f1d1d", "#c8a96e", "#6b8e6b", "#cd853f", "#ffffff",
];

const viewDefinitions: { key: ViewType; label: string; descriptions: string[] }[] = [
  { key: "front", label: "FRONT", descriptions: ["depan", "front"] },
  { key: "back",  label: "BACK",  descriptions: ["belakang", "back"] },
  { key: "left",  label: "LEFT",  descriptions: ["kiri", "left"] },
  { key: "right", label: "RIGHT", descriptions: ["kanan", "right"] },
];

type ProductTemplate = {
  name: string;
  views: { key: ViewType; label: string; src: string }[];
};

function getViewDefinition(description: string) {
  const normalized = description.trim().toLowerCase();
  return viewDefinitions.find((view) => view.descriptions.includes(normalized));
}

function buildProductTemplates(images: ExtraImage[]): ProductTemplate[] {
  const products = new Map<string, Map<ViewType, ExtraImage>>();

  images.forEach((image) => {
    const name = image.name.trim();
    const view = getViewDefinition(image.description);
    if (!name || !view || !image.image_url) return;

    const productViews = products.get(name) ?? new Map<ViewType, ExtraImage>();
    const current = productViews.get(view.key);
    const currentDate = new Date(current?.updated_at ?? current?.created_at ?? 0).getTime();
    const imageDate = new Date(image.updated_at ?? image.created_at ?? 0).getTime();

    if (!current || imageDate >= currentDate) productViews.set(view.key, image);
    products.set(name, productViews);
  });

  return Array.from(products, ([name, productViews]) => ({
    name,
    views: viewDefinitions.flatMap((view) => {
      const image = productViews.get(view.key);
      const src = resolveAssetUrl(image?.image_url);
      return src ? [{ key: view.key, label: view.label, src }] : [];
    }),
  })).filter((product) => product.views.length > 0);
}

const printZone: Record<ViewType, { x: number; y: number; w: number; h: number }> = {
  front: { x: 28, y: 26, w: 44, h: 42 },
  back:  { x: 24, y: 16, w: 52, h: 54 },
  left:  { x: 20, y: 26, w: 58, h: 40 },
  right: { x: 20, y: 26, w: 58, h: 40 },
};

type CanvasEl = {
  id: string;
  type: ElType;
  src?: string;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  fontFamily?: string;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right";
  color?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  view: ViewType;
  curve?: number;
};

function IconProduct({ active }: { active: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" /></svg>;
}
function IconUpload({ active }: { active: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
function IconText({ active }: { active: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>;
}
function IconLayers({ active }: { active: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "white" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
}


const sidebarItems = [
  { key: "product" as SidebarTab, label: "PRODUCT", Icon: IconProduct },
  { key: "upload"  as SidebarTab, label: "UPLOAD",  Icon: IconUpload  },
  { key: "text"    as SidebarTab, label: "TEXT",    Icon: IconText    },
  { key: "layers"  as SidebarTab, label: "LAYERS",  Icon: IconLayers  },
];


// --- Color utils ---
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}
function rgbToHsl(r:number,g:number,b:number):[number,number,number] {
  r/=255; g/=255; b/=255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0,s=0; const l=(max+min)/2;
  if(max!==min){
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r: h=((g-b)/d+(g<b?6:0))/6; break;
      case g: h=((b-r)/d+2)/6; break;
      case b: h=((r-g)/d+4)/6; break;
    }
  }
  return [h,s,l];
}

async function applyShirtColor(src: string, hexColor: string): Promise<string> {
  const [tr,tg,tb] = hexToRgb(hexColor);
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0,0,c.width,c.height);
        const px = d.data;
        for (let i=0;i<px.length;i+=4) {
          if(px[i+3]<10) continue;
          const [,s,l] = rgbToHsl(px[i],px[i+1],px[i+2]);
          if(s < 0.5 || l > 0.85) {
            px[i]   = Math.round(px[i]   * tr / 255);
            px[i+1] = Math.round(px[i+1] * tg / 255);
            px[i+2] = Math.round(px[i+2] * tb / 255);
          }
        }
        ctx.putImageData(d,0,0);
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [mobileSheetHeight, setMobileSheetHeight] = useState(55);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const sheetDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productLoadError, setProductLoadError] = useState(false);

  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedView, setSelectedView] = useState<ViewType>("front");
  const [processedSrc, setProcessedSrc] = useState<Partial<Record<ViewType, string>>>({});
  const selectedProduct = productTemplates.find((product) => product.name === selectedProductName) ?? productTemplates[0];
  const views = useMemo(() => selectedProduct?.views ?? [], [selectedProduct]);

  function getMaxSheetHeight() {
    return Math.min(88, ((window.innerHeight - 112) / window.innerHeight) * 100);
  }

  function onSheetHandlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (window.innerWidth >= 1024) return;
    e.preventDefault();
    e.stopPropagation();
    sheetDragRef.current = { startY: e.clientY, startHeight: mobileSheetHeight };
    setIsDraggingSheet(true);

    function onMove(event: PointerEvent) {
      if (!sheetDragRef.current) return;
      const deltaPercent = ((sheetDragRef.current.startY - event.clientY) / window.innerHeight) * 100;
      setMobileSheetHeight(Math.max(18, Math.min(getMaxSheetHeight(), sheetDragRef.current.startHeight + deltaPercent)));
    }

    function onUp() {
      const currentHeight = mobileSheetHeightRef.current;
      sheetDragRef.current = null;
      setIsDraggingSheet(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);

      if (currentHeight < 25) {
        setActiveTab(null);
        return;
      }

      const snapPoints = [32, 55, getMaxSheetHeight()];
      setMobileSheetHeight(snapPoints.reduce((closest, point) =>
        Math.abs(point - currentHeight) < Math.abs(closest - currentHeight) ? point : closest
      ));
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const mobileSheetHeightRef = useRef(mobileSheetHeight);
  useEffect(() => {
    mobileSheetHeightRef.current = mobileSheetHeight;
  }, [mobileSheetHeight]);

  useEffect(() => {
    if (!activeTab || activeTab === "views" || window.innerWidth >= 1024) return;
    setMobileSheetHeight(activeTab === "text" ? Math.min(72, getMaxSheetHeight()) : 55);
  }, [activeTab]);

  useEffect(() => {
    let ignore = false;

    getExtraImages()
      .then((images) => {
        if (ignore) return;
        const templates = buildProductTemplates(images);
        const defaultProduct = templates.find((product) => product.name.toLowerCase() === "jersey") ?? templates[0];
        setProductTemplates(templates);
        setSelectedProductName((current) => current || defaultProduct?.name || "");
        setProductLoadError(false);
      })
      .catch(() => {
        if (!ignore) setProductLoadError(true);
      })
      .finally(() => {
        if (!ignore) setIsLoadingProducts(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (views.length > 0 && !views.some((view) => view.key === selectedView)) {
      setSelectedView(views[0].key);
    }
  }, [selectedView, views]);

  useEffect(() => {
    let ignore = false;
    setProcessedSrc({});
    views.forEach(v => {
      applyShirtColor(v.src, selectedColor).then(dataUrl => {
        if (!ignore) setProcessedSrc(prev => ({ ...prev, [v.key]: dataUrl }));
      });
    });

    return () => {
      ignore = true;
    };
  }, [selectedColor, views]);

  const [zoom, setZoom] = useState(100);
  const [elements, setElements] = useState<CanvasEl[]>([]);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);
  const [showViewsPanel, setShowViewsPanel] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const historyRef = useRef<CanvasEl[][]>([[]]);
  const historyIndexRef = useRef(0);

  function pushHistory(newElements: CanvasEl[]) {
    const history = historyRef.current.slice(0, historyIndexRef.current + 1);
    history.push(newElements);
    historyRef.current = history;
    historyIndexRef.current = history.length - 1;
  }

  function setElementsWithHistory(updater: (prev: CanvasEl[]) => CanvasEl[]) {
    setElements(prev => {
      const next = updater(prev);
      pushHistory(next);
      return next;
    });
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    setElements(historyRef.current[historyIndexRef.current]);
    setSelectedEl(null);
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    setElements(historyRef.current[historyIndexRef.current]);
    setSelectedEl(null);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const resizingRef = useRef<{
    id: string; corner: "se" | "sw" | "ne" | "nw";
    startX: number; startY: number;
    startW: number; startH: number; startElX: number; startElY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const dragLayerRef = useRef<string | null>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and set initial zoom for mobile
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (window.innerWidth < 1024) {
      const availH = window.innerHeight - 56 - 56 - 52 - 32; // header + tabbar + toolbar + padding
      const availW = window.innerWidth - 32;
      const idealZoom = Math.min(
        Math.floor((availW / CANVAS) * 100),
        Math.floor((availH / CANVAS) * 100)
      );
      setZoom(Math.max(45, Math.min(90, idealZoom)));
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    const stopBubble = (e: WheelEvent) => e.stopPropagation();
    el.addEventListener("wheel", stopBubble, { passive: false });
    return () => el.removeEventListener("wheel", stopBubble);
  }, [activeTab]);

  const [showTour, setShowTour] = useState(true);
  const changeBtnRef = useRef<HTMLButtonElement | null>(null);
  const headerActionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showTour) setActiveTab("product");
  }, [showTour]);

  const tourSteps: TourStep[] = [
    {
      targetRef: changeBtnRef,
      title: "Ganti Produk",
      description:
        "Klik di sini untuk mengganti jenis produk yang ingin kamu desain. Tersedia berbagai pilihan seperti kaos, jaket, sweater, PDH atau produk lain sesuai kebutuhanmu.",
      placement: "right",
    },
    {
      targetRef: headerActionsRef,
      title: "Simpan & Preview",
      description:
        "Gunakan tombol Preview 2×2 untuk melihat mockup desainmu dari empat sisi sekaligus, dan Simpan Template untuk mengunduh hasil desain dalam format ZIP yang bisa kamu edit kembali nanti.",
      placement: "bottom",
    },
  ];

  const [tdText, setTdText] = useState("");
  const [tdFontSize, setTdFontSize] = useState(24);
  const [tdSpacing, setTdSpacing] = useState(0);
  const [tdColor, setTdColor] = useState("#000000");
  const [tdBold, setTdBold] = useState(false);
  const [tdItalic, setTdItalic] = useState(false);
  const [tdAlign, setTdAlign] = useState<"left" | "center" | "right">("center");
  const [tdFont, setTdFont] = useState("Poppins");
  const [tdCurve, setTdCurve] = useState(0);
  const tdColors = ["#000000", "#ffffff", "#8b6340", "#f5f0e8", "#2b5fd4", "#7f1d1d", "#1a472a", "#e8734a"];

  useEffect(() => {
    if (!selectedEl) return;
    const el = elements.find(e => e.id === selectedEl && e.type === "text");
    if (!el) return;
    setTdText(el.text ?? "");
    setTdFontSize(el.fontSize ?? 24);
    setTdSpacing(el.letterSpacing ?? 0);
    setTdColor(el.color ?? "#000000");
    setTdBold(el.fontWeight === "700");
    setTdItalic(el.fontStyle === "italic");
    setTdAlign(el.textAlign ?? "center");
    setTdFont(el.fontFamily ?? "Poppins");
    setTdCurve(el.curve ?? 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEl]);

  useEffect(() => {
    if (!selectedEl) return;
    setElements(prev => prev.map(el =>
      el.id === selectedEl && el.type === "text"
        ? { ...el, text: tdText, fontSize: tdFontSize, letterSpacing: tdSpacing, color: tdColor, fontWeight: tdBold ? "700" : "400", fontStyle: tdItalic ? "italic" : "normal", textAlign: tdAlign, fontFamily: tdFont, curve: tdCurve }
        : el
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdText, tdFontSize, tdSpacing, tdColor, tdBold, tdItalic, tdAlign, tdFont, tdCurve]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const src = URL.createObjectURL(file);
      const zone = printZone[selectedView];
      const newEl: CanvasEl = {
        id: Math.random().toString(36).slice(2),
        type: "image",
        src,
        x: (zone.x / 100) * CANVAS,
        y: (zone.y / 100) * CANVAS,
        w: (zone.w / 100) * CANVAS,
        h: (zone.h / 100) * CANVAS,
        view: selectedView,
      };
      setElementsWithHistory(prev => [...prev, newEl]);
      setSelectedEl(newEl.id);
    });
    e.target.value = "";
  }

  function addCustomText() {
    const text = tdText.trim() || "Your Text";
    const zone = printZone[selectedView];
    const newEl: CanvasEl = {
      id: Math.random().toString(36).slice(2),
      type: "text",
      text,
      fontSize: tdFontSize,
      fontWeight: tdBold ? "700" : "400",
      fontStyle: tdItalic ? "italic" : "normal",
      fontFamily: tdFont,
      letterSpacing: tdSpacing,
      textAlign: tdAlign,
      color: tdColor,
      curve: tdCurve,
      x: (zone.x / 100) * CANVAS + 10,
      y: (zone.y / 100) * CANVAS + 10,
      w: (zone.w / 100) * CANVAS - 20,
      h: tdFontSize * 1.4,
      view: selectedView,
    };
    setElementsWithHistory(prev => [...prev, newEl]);
    setSelectedEl(null);
    setTdText("");
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    const el = elements.find(el => el.id === id)!;
    draggingRef.current = { id, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y };
    setSelectedEl(id);

    const scale = zoom / 100;
    const pz = printZone[el.view];
    const zoneLeft   = (pz.x / 100) * CANVAS;
    const zoneTop    = (pz.y / 100) * CANVAS;
    const zoneRight  = ((pz.x + pz.w) / 100) * CANVAS;
    const zoneBottom = ((pz.y + pz.h) / 100) * CANVAS;

    function onMove(ev: PointerEvent) {
      if (!draggingRef.current) return;
      const { startX, startY, elX, elY } = draggingRef.current;
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      setElements(prev => prev.map(item => {
        if (item.id !== id) return item;
        const clampW = item.type === "text" ? 20 : item.w;
        const clampH = item.type === "text" ? 20 : item.h;
        const nx = Math.max(zoneLeft, Math.min(zoneRight - clampW, elX + dx));
        const ny = Math.max(zoneTop,  Math.min(zoneBottom - clampH, elY + dy));
        return { ...item, x: nx, y: ny };
      }));
    }
    function onUp() {
      draggingRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizeHandlePointerDown(
    e: React.PointerEvent,
    id: string,
    corner: "se" | "sw" | "ne" | "nw"
  ) {
    e.stopPropagation();
    const el = elements.find(el => el.id === id)!;
    resizingRef.current = {
      id, corner,
      startX: e.clientX, startY: e.clientY,
      startW: el.w, startH: el.h, startElX: el.x, startElY: el.y,
    };

    const scale = zoom / 100;
    const pz = printZone[el.view];
    const zoneLeft   = (pz.x / 100) * CANVAS;
    const zoneTop    = (pz.y / 100) * CANVAS;
    const zoneRight  = ((pz.x + pz.w) / 100) * CANVAS;
    const zoneBottom = ((pz.y + pz.h) / 100) * CANVAS;

    function onMove(ev: PointerEvent) {
      if (!resizingRef.current) return;
      const { startX, startY, startW, startH, startElX, startElY } = resizingRef.current;
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      setElements(prev => prev.map(item => {
        if (item.id !== id) return item;
        let x = item.x, y = item.y, w = item.w, h = item.h;
        if (corner === "se") {
          w = Math.min(zoneRight - startElX, Math.max(20, startW + dx));
          h = Math.min(zoneBottom - startElY, Math.max(20, startH + dy));
        }
        if (corner === "sw") {
          w = Math.max(20, startW - dx);
          h = Math.min(zoneBottom - startElY, Math.max(20, startH + dy));
          x = Math.max(zoneLeft, startElX + startW - w); w = startElX + startW - x;
        }
        if (corner === "ne") {
          w = Math.min(zoneRight - startElX, Math.max(20, startW + dx));
          h = Math.max(20, startH - dy);
          y = Math.max(zoneTop, startElY + startH - h); h = startElY + startH - y;
        }
        if (corner === "nw") {
          w = Math.max(20, startW - dx); h = Math.max(20, startH - dy);
          x = Math.max(zoneLeft, startElX + startW - w); w = startElX + startW - x;
          y = Math.max(zoneTop, startElY + startH - h); h = startElY + startH - y;
        }
        return { ...item, x, y, w, h };
      }));
    }
    function onUp() {
      resizingRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function deleteSelected() {
    if (!selectedEl) return;
    setElementsWithHistory(prev => prev.filter(el => el.id !== selectedEl));
    setSelectedEl(null);
  }

  async function renderViewToCanvas(viewKey: ViewType, viewSrc: string, coloredSrc?: string): Promise<HTMLCanvasElement> {
    const c = document.createElement("canvas");
    c.width = CANVAS;
    c.height = CANVAS;
    const ctx = c.getContext("2d")!;

    await new Promise<void>((res) => {
      const img = new window.Image();
      img.onload = () => {
        const ratio = Math.min(CANVAS / img.naturalWidth, CANVAS / img.naturalHeight);
        const dw = img.naturalWidth * ratio;
        const dh = img.naturalHeight * ratio;
        const dx = (CANVAS - dw) / 2;
        const dy = (CANVAS - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        res();
      };
      img.crossOrigin = "anonymous";
      img.src = coloredSrc ?? viewSrc;
    });

    const els = elements.filter(el => el.view === viewKey);
    for (const el of els) {
      if (el.type === "image" && el.src) {
        await new Promise<void>((res) => {
          const img = new window.Image();
          img.onload = () => {
            const ratio = Math.min(el.w / img.naturalWidth, el.h / img.naturalHeight);
            const dw = img.naturalWidth * ratio;
            const dh = img.naturalHeight * ratio;
            const dx = el.x + (el.w - dw) / 2;
            const dy = el.y + (el.h - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
            res();
          };
          img.src = el.src!;
        });
      } else if (el.type === "text" && el.text) {
        ctx.save();
        const curve = el.curve ?? 0;
        if (curve !== 0) {
          const fsz = el.fontSize ?? 16;
          const absS = Math.abs(curve);
          const r = (absS * absS + (el.w / 2) * (el.w / 2)) / (2 * absS);
          const midY = fsz * 0.8;
          const epY = curve > 0 ? midY + absS : midY - absS;
          const sweep = curve > 0 ? "0" : "1";
          const arcD = `M 0,${epY} A ${r},${r} 0 0,${sweep} ${el.w},${epY}`;
          const svgH = fsz + absS + 10;
          const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${el.w}" height="${svgH}" overflow="visible"><defs><path id="arc" d="${arcD}" fill="none"/></defs><text font-family="${el.fontFamily ?? 'Poppins'}, sans-serif" font-size="${fsz}" font-weight="${el.fontWeight ?? '400'}" font-style="${el.fontStyle ?? 'normal'}" fill="${el.color ?? '#111'}" text-anchor="middle" letter-spacing="${el.letterSpacing ?? 0}"><textPath href="#arc" startOffset="50%">${el.text}</textPath></text></svg>`;
          await new Promise<void>(res => {
            const img = new window.Image();
            img.onload = () => { ctx.drawImage(img, el.x, el.y); res(); };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
          });
        } else {
          ctx.font = `${el.fontWeight ?? '400'} ${el.fontSize}px ${el.fontFamily ?? 'Poppins'}, sans-serif`;
          ctx.fillStyle = el.color ?? "#111111";
          ctx.fillText(el.text, el.x, el.y + (el.fontSize ?? 16));
        }
        ctx.restore();
      }
    }

    return c;
  }

  async function downloadZip() {
    const zip = new JSZip();
    for (const v of views) {
      const c = await renderViewToCanvas(v.key, v.src, processedSrc[v.key]);
      const blob = await new Promise<Blob>(res => c.toBlob(b => res(b!), "image/png"));
      zip.file(`${v.key}.png`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url; a.download = "esize-template.zip"; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPreview() {
    const GRID = CANVAS;
    const c = document.createElement("canvas");
    c.width = GRID * 2 + 12;
    c.height = GRID * 2 + 12;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, c.width, c.height);

    const positions = [
      { x: 0,         y: 0 },
      { x: GRID + 12, y: 0 },
      { x: 0,         y: GRID + 12 },
      { x: GRID + 12, y: GRID + 12 },
    ];

    for (let i = 0; i < views.length; i++) {
      const v = views[i];
      const vc = await renderViewToCanvas(v.key, v.src, processedSrc[v.key]);
      ctx.drawImage(vc, positions[i].x, positions[i].y, GRID, GRID);
      ctx.fillStyle = "#00000066";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(v.label, positions[i].x + 10, positions[i].y + 26);
    }

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "esize-preview.png"; a.click();
  }

  const zone = printZone[selectedView];
  const viewElements = elements.filter(el => el.view === selectedView);

  return (
    <ViewportScaler>
    <div className="flex flex-col overflow-hidden bg-[#f5f0e8]" style={{ height: "calc(100dvh / var(--page-scale, 1))" }}>

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-50">
        <div className="flex items-center gap-2">
          <a href="/" className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-[#FAF3E0] hover:bg-[#ede7dd] transition-colors flex-shrink-0" title="Kembali ke beranda">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </a>
          <a href="/">
            <Image src="/logoesize.png" alt="Esize" width={100} height={36} className="h-9 w-auto cursor-pointer" />
          </a>
        </div>

        {/* Action buttons — one wrapper for the tour ref */}
        <div ref={headerActionsRef} className="flex items-center gap-2 lg:gap-3">
          {/* Desktop: text + icon */}
          <button onClick={downloadPreview} className="hidden lg:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors" style={{ border: "1px solid #D4A373" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Preview 2×2
          </button>
          <button onClick={downloadZip} className="hidden lg:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors" style={{ border: "1px solid #D4A373" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Simpan Template
          </button>
          {/* Mobile: icon + label */}
          <button onClick={downloadPreview} className="lg:hidden flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-[#FAF3E0] hover:bg-[#ede7dd] transition-colors flex-shrink-0" style={{ border: "1px solid #D4A373" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span className="text-[11px] font-semibold text-gray-700">Preview</span>
          </button>
          <button onClick={downloadZip} className="lg:hidden flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-[#e8734a] hover:bg-[#d4623a] transition-colors flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            <span className="text-[11px] font-semibold text-white">Simpan</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left icon sidebar — desktop only */}
        <div className="hidden lg:flex w-20 bg-white border-r border-gray-200 flex-col items-center pt-4 gap-1 flex-shrink-0">
          {sidebarItems.map(({ key, label, Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(activeTab === key ? null : key)}
                className={`flex flex-col items-center justify-center gap-1 w-16 py-3 rounded-xl text-[10px] font-bold tracking-wider transition-colors ${
                  active ? "bg-[#e8734a] text-white" : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Icon active={active} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Detail panel — left sidebar on desktop, bottom sheet on mobile */}
        {activeTab && activeTab !== "views" && (
          <div
            ref={sidebarScrollRef}
            style={{ "--mobile-sheet-height": `${mobileSheetHeight}vh` } as React.CSSProperties}
            className={`fixed lg:relative inset-x-0 bottom-14 lg:bottom-auto z-40 lg:z-auto bg-white border-t border-gray-200 lg:border-t-0 lg:border-r rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none lg:w-72 lg:flex-shrink-0 ${
              activeTab === "text"
                ? "flex flex-col overflow-hidden"
                : "overflow-y-auto"
            } h-[var(--mobile-sheet-height)] max-h-[calc(100vh-7rem)] lg:h-auto lg:max-h-none ${isDraggingSheet ? "" : "transition-[height] duration-300 ease-out"}`}
          >
            {/* Drag handle — mobile only */}
            <div
              onPointerDown={onSheetHandlePointerDown}
              className="lg:hidden flex items-center justify-between px-4 pt-3 pb-2 sticky top-0 bg-white z-20 border-b border-gray-50 shrink-0 touch-none cursor-ns-resize select-none"
            >
              <div className="w-8" />
              <div className={`w-12 h-1.5 rounded-full transition-colors ${isDraggingSheet ? "bg-[#e8734a]" : "bg-gray-300"}`} />
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setActiveTab(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* PRODUCT */}
            {activeTab === "product" && (
              <div className="p-4">
                <div className="bg-[#fdf6f0] rounded-2xl p-4 mb-4 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#f5ddd0] rounded-full opacity-60" />
                  <div className="absolute top-8 -right-2 w-14 h-14 bg-[#f0d0c0] rounded-full opacity-40" />
                  <div className="flex items-start gap-3 relative">
                    <div className="w-9 h-9 rounded-full bg-[#e8734a] flex items-center justify-center shrink-0 shadow-sm">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" /></svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm leading-tight">{selectedProduct?.name ?? "Produk Custom"}</h2>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Handcrafted quality meets modern design. Ring-spun cotton with superior comfort.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Details</h3>
                  <button
                    ref={changeBtnRef}
                    onClick={() => setShowChangeModal(true)}
                    className="px-5 py-1.5 rounded-full text-sm font-semibold bg-[#e8734a] text-white hover:bg-[#d4623a] transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8734a" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                      <span className="font-bold text-gray-800 text-sm tracking-wide">SIZE</span>
                    </div>
                    <button className="text-xs text-[#e8734a] font-medium hover:underline">Size Guide →</button>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{sizes.join("-")}</p>
                </div>

                <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F5E6D3" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="#8b6340" /><circle cx="17.5" cy="10.5" r=".5" fill="#8b6340" /><circle cx="8.5" cy="7.5" r=".5" fill="#8b6340" /><circle cx="6.5" cy="12.5" r=".5" fill="#8b6340" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>
                    </div>
                    <span className="font-bold text-gray-800 text-sm tracking-wide">COLOR PALETTE</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-lg transition-all relative shrink-0 ${color === "#ffffff" ? "border border-gray-200" : ""}`}
                        style={{
                          backgroundColor: color,
                          outline: selectedColor === color ? "2.5px solid #e8734a" : "none",
                          outlineOffset: "2px",
                        }}
                      >
                        {selectedColor === color && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* UPLOAD */}
            {activeTab === "upload" && (
              <div className="p-4 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8734a", transform: "rotate(-12deg)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(12deg)" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">Upload Your Art</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">Transform your design vision into reality</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-8 flex flex-col items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-3xl flex items-center justify-center hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#e8734a", transform: "rotate(-12deg)" }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(12deg)" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </button>
                  <p className="font-bold text-gray-800 text-base">Drag &amp; Drop</p>
                  <p className="text-xs text-gray-400">or click below to browse</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex items-center gap-2 px-8 py-3 rounded-2xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#e8734a" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    Choose File
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2z"/><path d="M19 12l.55 1.64L21 14l-1.45.36L19 16l-.55-1.64L17 14l1.45-.36L19 12z"/><path d="M5 18l.55 1.64L7 20l-1.45.36L5 22l-.55-1.64L3 20l1.45-.36L5 18z"/>
                      </svg>
                    </div>
                    <span className="font-bold text-gray-800 text-xs tracking-widest">FILE GUIDELINES</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Format", value: "JPG, PNG, SVG" },
                      { label: "Max Size", value: "10 MB" },
                      { label: "Resolution", value: "300 DPI" },
                      { label: "Dimension", value: "3000×3000px" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#fdf6f0" }}>
                        <p className="text-xs font-bold text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {viewElements.filter(el => el.type === "image").length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 tracking-wider mb-2">DI CANVAS ({selectedView.toUpperCase()})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {viewElements.filter(el => el.type === "image").map((el) => (
                        <button key={el.id} onClick={() => setSelectedEl(el.id === selectedEl ? null : el.id)}
                          className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all ${el.id === selectedEl ? "border-[#e8734a]" : "border-gray-100"}`}>
                          <Image src={el.src!} alt="element" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TEXT */}
            {activeTab === "text" && (
              <div className="flex flex-col flex-1 min-h-0 lg:h-full">
                <div className="flex items-center gap-3 px-4 py-3 lg:py-4 border-b border-gray-100 bg-white shrink-0">
                  <div className="w-10 h-10 bg-[#e8734a] rounded-xl flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">Text Designer</p>
                    <p className="text-xs text-gray-400">Craft your perfect message</p>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-[#f5ede5] rounded-lg flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest">YOUR MESSAGE</span>
                    </div>
                    <textarea
                      value={tdText}
                      onChange={e => setTdText(e.target.value)}
                      placeholder="Type your creative text..."
                      rows={3}
                      className="w-full bg-[#fdf8f4] rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-300 resize-none outline-none border border-[#f0e4d8] focus:border-[#e8734a] transition-colors"
                    />
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest">FONT STYLE</span>
                    </div>
                    <FontPicker defaultValue="Poppins" autoLoad value={(font) => setTdFont(font)} />
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 tracking-widest block mb-2">STYLE</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setTdBold(v => !v)}
                        className={`flex-1 h-7 rounded-lg font-bold text-sm transition-all border ${tdBold ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>B</button>
                      <button onClick={() => setTdItalic(v => !v)}
                        className={`flex-1 h-7 rounded-lg italic text-sm transition-all border ${tdItalic ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}><em>I</em></button>
                      <button onClick={() => setTdAlign("left")}
                        className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all border ${tdAlign === "left" ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
                      </button>
                      <button onClick={() => setTdAlign("center")}
                        className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all border ${tdAlign === "center" ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                      </button>
                      <button onClick={() => setTdAlign("right")}
                        className={`flex-1 h-7 rounded-lg flex items-center justify-center transition-all border ${tdAlign === "right" ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                        <span className="text-[10px] font-bold text-gray-500 tracking-widest">FONT SIZE</span>
                      </div>
                      <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tdFontSize}px</span>
                    </div>
                    <input type="range" min={12} max={72} value={tdFontSize} onChange={e => setTdFontSize(Number(e.target.value))}
                      className="w-full accent-gray-800 h-1.5 rounded-full" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>12</span><span>72</span></div>
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/></svg>
                        <span className="text-[10px] font-bold text-gray-500 tracking-widest">SPACING</span>
                      </div>
                      <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tdSpacing}px</span>
                    </div>
                    <input type="range" min={0} max={20} value={tdSpacing} onChange={e => setTdSpacing(Number(e.target.value))}
                      className="w-full accent-gray-800 h-1.5 rounded-full" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>0</span><span>20</span></div>
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20 Q12 4 20 20"/></svg>
                        <span className="text-[10px] font-bold text-gray-500 tracking-widest">CURVE</span>
                      </div>
                      <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tdCurve}px</span>
                    </div>
                    <input type="range" min={-100} max={100} value={tdCurve} onChange={e => setTdCurve(Number(e.target.value))}
                      className="w-full accent-gray-800 h-1.5 rounded-full" />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>↙ Down</span><span>0</span><span>Up ↗</span></div>
                  </div>

                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" style={{ backgroundColor: tdColor }} />
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest">TEXT COLOR</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="w-10 h-10 rounded-xl border-2 border-[#f0e4d8] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden relative" style={{ backgroundColor: tdColor }}>
                        <input type="color" value={tdColor} onChange={e => setTdColor(e.target.value)} className="absolute opacity-0 w-full h-full cursor-pointer" />
                      </label>
                      <input
                        type="text"
                        value={tdColor}
                        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setTdColor(e.target.value); }}
                        className="w-0 flex-1 min-w-0 bg-[#fdf8f4] border border-[#f0e4d8] rounded-xl px-3 py-2 text-sm text-gray-600 font-mono outline-none focus:border-[#e8734a] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-8 gap-1.5">
                      {tdColors.map(c => (
                        <button key={c} onClick={() => setTdColor(c)}
                          className={`w-7 h-7 rounded-lg border-2 transition-all ${tdColor === c ? "border-[#e8734a] scale-105 shadow-md" : "border-gray-100 hover:scale-105"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
                  <button onClick={addCustomText}
                    className="w-full bg-[#e8734a] hover:bg-[#d4623a] text-white rounded-xl py-2.5 font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    ADD TO DESIGN
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* LAYERS */}
            {activeTab === "layers" && (
              <div className="p-4 flex flex-col gap-2">
                <p className="font-bold text-gray-800 text-sm mb-2">Layers</p>
                {viewElements.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center mt-4">Belum ada elemen di view ini</p>
                ) : (
                  [...viewElements].reverse().map((el, i) => (
                    <div key={el.id}
                      draggable
                      onDragStart={() => { dragLayerRef.current = el.id; }}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const fromId = dragLayerRef.current;
                        if (!fromId || fromId === el.id) return;
                        setElements(prev => {
                          const arr = [...prev];
                          const fromIdx = arr.findIndex(x => x.id === fromId);
                          const toIdx = arr.findIndex(x => x.id === el.id);
                          const [moved] = arr.splice(fromIdx, 1);
                          arr.splice(toIdx, 0, moved);
                          return arr;
                        });
                        dragLayerRef.current = null;
                      }}
                      onClick={() => {
                        setSelectedEl(el.id === selectedEl ? null : el.id);
                        if (el.id !== selectedEl) setActiveTab(el.type === "text" ? "text" : "upload");
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all ${el.id === selectedEl ? "bg-blue-50 border-blue-200" : "bg-[#fdf6f0] border-[#f0d8c8]"}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="shrink-0"><circle cx="9" cy="5" r="1" fill="#9ca3af"/><circle cx="9" cy="12" r="1" fill="#9ca3af"/><circle cx="9" cy="19" r="1" fill="#9ca3af"/><circle cx="15" cy="5" r="1" fill="#9ca3af"/><circle cx="15" cy="12" r="1" fill="#9ca3af"/><circle cx="15" cy="19" r="1" fill="#9ca3af"/></svg>
                      {el.type === "image" ? (
                        <div className="w-8 h-8 rounded overflow-hidden relative shrink-0">
                          <Image src={el.src!} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-xs font-bold text-white" style={{ backgroundColor: el.color ?? "#111", fontFamily: el.fontFamily }}>T</div>
                      )}
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {el.type === "text" ? (el.text || "Text") : `Image ${viewElements.length - i}`}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); setElementsWithHistory(prev => prev.filter(item => item.id !== el.id)); if (selectedEl === el.id) setSelectedEl(null); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Canvas area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-center gap-2 lg:gap-3 py-2 lg:py-3 flex-shrink-0 bg-white relative z-35">
            <button onClick={undo} className="w-9 h-9 lg:w-11 lg:h-11 bg-[#FAF3E0] rounded-xl flex items-center justify-center hover:bg-[#ede7dd] transition-colors shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            </button>
            <button onClick={redo} className="w-9 h-9 lg:w-11 lg:h-11 bg-[#FAF3E0] rounded-xl flex items-center justify-center hover:bg-[#ede7dd] transition-colors shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
            </button>

            <div className="flex items-center bg-[#aeaaa4] rounded-2xl px-1 lg:px-1.5 py-1 lg:py-1.5 shadow-sm gap-1 lg:gap-3">
              <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 lg:w-9 lg:h-9 bg-[#c1c1c1] flex items-center justify-center rounded-xl hover:bg-[#b4b4b4] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b4f55" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
              {/* Desktop zoom display */}
              <div className="hidden lg:flex w-[72px] h-9 bg-white rounded-xl items-center justify-center text-sm font-bold text-gray-700 select-none shadow-sm">
                {zoom}%
              </div>
              {/* Mobile zoom display */}
              <div className="lg:hidden w-10 h-7 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-gray-700 select-none">
                {zoom}%
              </div>
              <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-7 h-7 lg:w-9 lg:h-9 bg-[#c1c1c1] flex items-center justify-center rounded-xl hover:bg-[#b4b4b4] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b4f55" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
              </button>
            </div>

            {/* Current view indicator — mobile only */}
            <button
              onClick={() => setActiveTab(activeTab === "views" ? null : "views")}
              className="lg:hidden flex items-center gap-1 bg-[#FAF3E0] rounded-xl px-2.5 py-1.5 shadow-sm"
            >
              <span className="text-[10px] font-bold text-gray-600 tracking-wider">{selectedView.toUpperCase()}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>

            {/* Fullscreen — desktop only */}
            <button onClick={toggleFullscreen} className="hidden lg:flex w-11 h-11 bg-[#FAF3E0] rounded-xl items-center justify-center hover:bg-[#ede7dd] transition-colors shadow-sm">
              {isFullscreen
                ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
              }
            </button>

            {selectedEl && (
              <button onClick={deleteSelected} className="hidden lg:flex w-11 h-11 bg-red-50 rounded-xl items-center justify-center hover:bg-red-100 transition-colors shadow-sm border border-red-200">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
              </button>
            )}
          </div>

          {/* Canvas */}
          <div
            className="flex-1 overflow-auto lg:overflow-hidden relative"
            style={{ backgroundColor: "#ebebeb", backgroundImage: "url('/teksturkaineditor.png')", backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundPosition: "center" }}
            onClick={() => setSelectedEl(null)}
          >
            <div className="min-h-full flex items-center justify-center p-4 lg:p-0">
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center", flexShrink: 0 }}>
              <div className="relative drop-shadow-xl" style={{ width: CANVAS, height: CANVAS }}>
                {processedSrc[selectedView] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={processedSrc[selectedView]} alt="Product" draggable={false} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", pointerEvents:"none" }} />
                )}

                {selectedEl && viewElements.some(el => el.id === selectedEl) && (
                  <div
                    className="absolute border-2 border-dashed border-white/50 pointer-events-none"
                    style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%` }}
                  />
                )}

                {viewElements.map((el) => {
                  const isSelected = el.id === selectedEl;
                  const isEditingText = editingTextId === el.id;
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => { if (!isEditingText) onPointerDown(e, el.id); }}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={() => { if (el.type === "text") setEditingTextId(el.id); }}
                      className={`absolute select-none touch-none ${isEditingText ? "cursor-text" : "cursor-grab active:cursor-grabbing"} ${isSelected ? "outline outline-2 outline-[#4a7fc1] outline-offset-1" : ""}`}
                      style={{ left: el.x, top: el.y, width: el.type === "image" ? el.w : "auto", height: el.type === "image" ? el.h : "auto" }}
                    >
                      {el.type === "image" ? (
                        <div style={{ width: el.w, height: el.h, position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={el.src!} alt="design" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", userSelect: "none", display: "block" }} />
                          {isSelected && (["nw","ne","sw","se"] as const).map((corner) => (
                            <div
                              key={corner}
                              onPointerDown={(e) => { e.preventDefault(); onResizeHandlePointerDown(e, el.id, corner); }}
                              className="absolute w-8 h-8 z-10 touch-none flex items-center justify-center"
                              style={{
                                top:    corner.startsWith("n") ? -16 : undefined,
                                bottom: corner.startsWith("s") ? -16 : undefined,
                                left:   corner.endsWith("w")   ? -16 : undefined,
                                right:  corner.endsWith("e")   ? -16 : undefined,
                                cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                              }}
                            >
                              <div className="w-3 h-3 bg-white border-2 border-[#4a7fc1] rounded-sm pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      ) : isEditingText ? (
                        <input
                          autoFocus
                          value={el.text ?? ""}
                          onChange={(e) => setElements(prev => prev.map(item => item.id === el.id ? { ...item, text: e.target.value } : item))}
                          onBlur={() => setEditingTextId(null)}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="bg-transparent outline-none border-none w-full"
                          style={{ fontSize: el.fontSize, fontWeight: el.fontWeight, fontStyle: el.fontStyle, fontFamily: el.fontFamily ?? "var(--font-poppins)", letterSpacing: el.letterSpacing, textAlign: el.textAlign, color: el.color, minWidth: 80, width: "100%" }}
                        />
                      ) : el.curve && el.curve !== 0 ? (() => {
                          const s = el.curve!;
                          const fsz = el.fontSize ?? 24;
                          const absS = Math.abs(s);
                          const r = (absS * absS + (el.w / 2) * (el.w / 2)) / (2 * absS);
                          const midY = fsz * 0.8;
                          const epY = s > 0 ? midY + absS : midY - absS;
                          const sweep = s > 0 ? "0" : "1";
                          const arcD = `M 0,${epY} A ${r},${r} 0 0,${sweep} ${el.w},${epY}`;
                          const svgH = fsz + absS + 10;
                          return (
                            <svg width={el.w} height={svgH} style={{ overflow: "visible" }}>
                              <defs><path id={`arc-${el.id}`} d={arcD} fill="none" /></defs>
                              <text fontFamily={`${el.fontFamily ?? 'Poppins'}, sans-serif`} fontSize={el.fontSize} fontWeight={el.fontWeight} fontStyle={el.fontStyle} fill={el.color ?? '#111'} textAnchor="middle" letterSpacing={el.letterSpacing}>
                                <textPath href={`#arc-${el.id}`} startOffset="50%">{el.text}</textPath>
                              </text>
                            </svg>
                          );
                        })() : (
                        <span style={{ fontSize: el.fontSize, fontWeight: el.fontWeight, fontStyle: el.fontStyle, fontFamily: el.fontFamily ?? "var(--font-poppins)", letterSpacing: el.letterSpacing, textAlign: el.textAlign, color: el.color, whiteSpace: "nowrap", display: "block", width: "100%" }}>
                          {el.text}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right views panel — desktop only */}
        {showViewsPanel ? (
          <div className="hidden lg:flex w-28 bg-white border-l border-gray-200 flex-col flex-shrink-0 overflow-y-auto">
            <div className="flex items-center justify-center px-3 py-3 border-b border-gray-100">
              <button
                onClick={() => setShowViewsPanel(false)}
                className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b6340" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                <span className="text-xs font-bold text-[#8b6340] tracking-wider">VIEWS</span>
              </button>
            </div>
            <div className="flex flex-col items-center py-4 relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gray-200 z-0" />
              {views.map(({ key, label }) => {
                const active = selectedView === key;
                return (
                  <button key={key} onClick={() => setSelectedView(key)} className="relative z-10 flex flex-col items-center w-full px-3 mb-1">
                    <div className="w-full rounded-2xl overflow-hidden p-1.5 shadow-sm transition-all" style={{ backgroundColor: active ? selectedColor : "#ffffff" }}>
                      <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-gray-100">
                        {processedSrc[key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={processedSrc[key]} alt={label} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                        ) : (
                          <Image src={views.find(v => v.key === key)!.src} alt={label} fill className="object-contain" />
                        )}
                      </div>
                    </div>
                    <p className={`text-[10px] font-semibold tracking-wider mt-1.5 mb-3 ${active ? "text-gray-700" : "text-gray-400"}`}>{label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowViewsPanel(true)}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 w-5 h-10 bg-white border border-gray-200 border-r-0 rounded-l-xl items-center justify-center hover:bg-gray-100 transition-colors shadow-sm z-10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}

      </div>{/* end body flex */}

      {/* ── Mobile bottom tab bar ── */}
      <div className="lg:hidden h-14 bg-white border-t border-gray-200 flex items-center justify-around flex-shrink-0 relative z-30">
        {sidebarItems.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(activeTab === key ? null : key)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl text-[9px] font-bold tracking-wider transition-colors ${
                active ? "bg-[#e8734a] text-white" : "text-gray-400 hover:bg-gray-50"
              }`}
            >
              <Icon active={active} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Mobile views sidebar ── */}
      {activeTab === "views" && (
        <div className="lg:hidden fixed right-0 top-14 bottom-14 w-20 z-40 bg-white border-l border-gray-200 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-2 py-2 border-b border-gray-100 flex-shrink-0">
            <span className="text-[9px] font-bold text-gray-500 tracking-wider">TAMPILAN</span>
            <button
              onClick={() => setActiveTab(null)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col items-center py-3 gap-2">
            {views.map(({ key, label }) => {
              const active = selectedView === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedView(key)}
                  className="flex flex-col items-center w-full px-3"
                >
                  <div
                    className="w-full rounded-xl overflow-hidden p-1.5 transition-all"
                    style={{
                      backgroundColor: active ? selectedColor : "#f5f5f5",
                      border: active ? "2px solid #e8734a" : "2px solid #e5e7eb",
                    }}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden relative bg-gray-100">
                      {processedSrc[key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={processedSrc[key]} alt={label} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                      ) : (
                        <Image src={views.find(v => v.key === key)!.src} alt={label} fill className="object-contain" />
                      )}
                    </div>
                  </div>
                  <p className={`text-[9px] font-semibold tracking-wider mt-1 ${active ? "text-[#e8734a]" : "text-gray-400"}`}>{label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile backdrop (tap outside to close panel) ── */}
      {activeTab !== null && (
        <div
          className="lg:hidden fixed inset-x-0 top-14 bottom-14 z-30"
          onClick={() => setActiveTab(null)}
        />
      )}

      {/* ── Mobile floating element actions (shown when element selected, no panel open) ── */}
      {selectedEl && activeTab === null && (
        <div className="lg:hidden fixed inset-x-0 bottom-14 z-45 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-xl">
          <button
            onClick={() => {
              const el = elements.find(e => e.id === selectedEl);
              if (el) setActiveTab(el.type === "text" ? "text" : "upload");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#e8734a] text-white rounded-full text-xs font-bold shadow-sm"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-full text-xs font-bold border border-red-100"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Hapus
          </button>
          <button
            onClick={() => setSelectedEl(null)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-500 rounded-full text-xs font-bold border border-gray-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Batal
          </button>
        </div>
      )}

      {/* Change Product Modal */}
      {showChangeModal && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center sm:justify-center bg-black/50"
          onClick={() => setShowChangeModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[85dvh] sm:max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-start justify-between px-4 pt-3 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Ganti Produk</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Pilih produk yang ingin kamu custom</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-max content-start gap-3 sm:gap-4 overflow-y-auto overscroll-contain min-h-0 px-4 py-4 sm:px-6 sm:pb-6">
              {isLoadingProducts && (
                <p className="col-span-full py-8 text-center text-sm text-gray-400">Memuat produk custom...</p>
              )}
              {!isLoadingProducts && productLoadError && (
                <p className="col-span-full py-8 text-center text-sm text-red-400">Gagal memuat produk custom.</p>
              )}
              {!isLoadingProducts && !productLoadError && productTemplates.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-gray-400">Belum ada gambar produk custom.</p>
              )}
              {productTemplates.map((p) => {
                const thumbnail = p.views.find((view) => view.key === "front") ?? p.views[0];
                return (
                <button
                  key={p.name}
                  onClick={() => {
                    setSelectedProductName(p.name);
                    setSelectedView(p.views[0].key);
                    setShowChangeModal(false);
                  }}
                  className={`flex flex-col h-auto rounded-2xl border bg-[#faf8f5] hover:border-[#e8734a] hover:shadow-md transition-all overflow-hidden group ${selectedProduct?.name === p.name ? "border-[#e8734a]" : "border-gray-100"}`}
                >
                  <div className="w-full aspect-square shrink-0 bg-[#f0ece6] relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnail.src} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="px-3 py-2 text-left shrink-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.views.length} sisi</p>
                  </div>
                </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showTour && (
        <OnboardingTour steps={tourSteps} onClose={() => setShowTour(false)} />
      )}
    </div>
    </ViewportScaler>
  );
}
