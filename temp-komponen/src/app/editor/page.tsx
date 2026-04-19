"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import JSZip from "jszip";
import FontPicker from "react-fontpicker-ts";
import "react-fontpicker-ts/dist/index.css";

type SidebarTab = "product" | "upload" | "text" | "layers" | null;
type ProductTab = "details" | "change";
type ViewType = "front" | "back" | "left" | "right";
type Size = "S" | "M" | "L" | "XL" | "2XL" | "3XL" | "4XL" | "5XL";
type ElType = "image" | "text";

const CANVAS = 520;
const sizes: Size[] = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

const colors = [
  "#111111", "#d4c4a8", "#8b6340", "#2b5fd4", "#c41e3a", "#1a472a", "#64748b",
  "#c0392b", "#4d7c0f", "#7f1d1d", "#c8a96e", "#6b8e6b", "#cd853f", "#ffffff",
];

const views: { key: ViewType; label: string; src: string }[] = [
  { key: "front", label: "FRONT", src: "/19.png" },
  { key: "back",  label: "BACK",  src: "/20.png" },
  { key: "left",  label: "LEFT",  src: "/21.png" },
  { key: "right", label: "RIGHT", src: "/22.png" },
];

// Single printable zone per view (percentage of CANVAS)
const printZone: Record<ViewType, { x: number; y: number; w: number; h: number }> = {
  front: { x: 28, y: 26, w: 44, h: 42 },
  back:  { x: 24, y: 16, w: 52, h: 54 },
  left:  { x: 20, y: 26, w: 58, h: 40 },
  right: { x: 20, y: 26, w: 58, h: 40 },
};

type CanvasEl = {
  id: string;
  type: ElType;
  // image
  src?: string;
  // text
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
  { key: "upload" as SidebarTab, label: "UPLOAD", Icon: IconUpload },
  { key: "text" as SidebarTab, label: "TEXT", Icon: IconText },
  { key: "layers" as SidebarTab, label: "LAYERS", Icon: IconLayers },
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
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0,0,c.width,c.height);
      const px = d.data;
      for (let i=0;i<px.length;i+=4) {
        if(px[i+3]<10) continue;
        const [,s,l] = rgbToHsl(px[i],px[i+1],px[i+2]);
        // recolor low-saturation pixels (white/gray — shirt fabric)
        // also recolor very bright pixels (l > 0.85) because near-white pixels
        // can have artificially high HSL saturation due to floating-point math
        // multiply blend: white→target color, shadows stay proportionally dark
        if(s < 0.5 || l > 0.85) {
          px[i]   = Math.round(px[i]   * tr / 255);
          px[i+1] = Math.round(px[i+1] * tg / 255);
          px[i+2] = Math.round(px[i+2] * tb / 255);
        }
      }
      ctx.putImageData(d,0,0);
      resolve(c.toDataURL("image/png"));
    };
    img.src = src;
  });
}

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [productTab, setProductTab] = useState<ProductTab>("details");

  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedView, setSelectedView] = useState<ViewType>("front");
  const [processedSrc, setProcessedSrc] = useState<Record<ViewType, string>>({ front:"", back:"", left:"", right:"" });

  useEffect(() => {
    views.forEach(v => {
      applyShirtColor(v.src, selectedColor).then(dataUrl => {
        setProcessedSrc(prev => ({ ...prev, [v.key]: dataUrl }));
      });
    });
  }, [selectedColor]);
  const [zoom, setZoom] = useState(100);
  const [elements, setElements] = useState<CanvasEl[]>([]);
  const [selectedEl, setSelectedEl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const resizingRef = useRef<{
    id: string; corner: "se" | "sw" | "ne" | "nw";
    startX: number; startY: number;
    startW: number; startH: number; startElX: number; startElY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const dragLayerRef = useRef<string | null>(null);

  // Text Designer state
  const [tdText, setTdText] = useState("");
  const [tdFontSize, setTdFontSize] = useState(24);
  const [tdSpacing, setTdSpacing] = useState(0);
  const [tdColor, setTdColor] = useState("#000000");
  const [tdBold, setTdBold] = useState(false);
  const [tdItalic, setTdItalic] = useState(false);
  const [tdAlign, setTdAlign] = useState<"left" | "center" | "right">("center");
  const [tdFont, setTdFont] = useState("Poppins");
  const tdColors = ["#000000", "#ffffff", "#8b6340", "#f5f0e8", "#2b5fd4", "#7f1d1d", "#1a472a", "#e8734a"];

  // When a text element is selected, load its properties into the panel
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEl]);

  // When panel fields change and a text element is selected, sync to canvas
  useEffect(() => {
    if (!selectedEl) return;
    setElements(prev => prev.map(el =>
      el.id === selectedEl && el.type === "text"
        ? { ...el, text: tdText, fontSize: tdFontSize, letterSpacing: tdSpacing, color: tdColor, fontWeight: tdBold ? "700" : "400", fontStyle: tdItalic ? "italic" : "normal", textAlign: tdAlign, fontFamily: tdFont }
        : el
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdText, tdFontSize, tdSpacing, tdColor, tdBold, tdItalic, tdAlign, tdFont]);

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
      setElements(prev => [...prev, newEl]);
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
      x: (zone.x / 100) * CANVAS + 10,
      y: (zone.y / 100) * CANVAS + 10,
      w: (zone.w / 100) * CANVAS - 20,
      h: tdFontSize * 1.4,
      view: selectedView,
    };
    setElements(prev => [...prev, newEl]);
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
    setElements(prev => prev.filter(el => el.id !== selectedEl));
    setSelectedEl(null);
  }

  async function renderViewToCanvas(viewKey: ViewType, viewSrc: string, coloredSrc?: string): Promise<HTMLCanvasElement> {
    const c = document.createElement("canvas");
    c.width = CANVAS;
    c.height = CANVAS;
    const ctx = c.getContext("2d")!;

    // Draw product image with object-contain (use color-processed src if available)
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
      img.src = coloredSrc ?? viewSrc;
    });

    // Draw elements for this view
    const els = elements.filter(el => el.view === viewKey);
    for (const el of els) {
      if (el.type === "image" && el.src) {
        await new Promise<void>((res) => {
          const img = new window.Image();
          img.onload = () => {
            // replicate object-contain within el.w × el.h box
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
        ctx.font = `${el.fontWeight} ${el.fontSize}px Poppins, sans-serif`;
        ctx.fillStyle = el.color ?? "#111111";
        ctx.fillText(el.text, el.x, el.y + (el.fontSize ?? 16));
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
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f0e8]">

      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-50">
        <div>
          <a href="/">
            <Image src="/logoesize.png" alt="Esize" width={100} height={36} className="h-9 w-auto cursor-pointer" />
          </a>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadPreview} className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            Preview 2×2
          </button>
          <button onClick={downloadZip} className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            Simpan Template
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left icon sidebar */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center pt-4 gap-1 flex-shrink-0">
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

        {/* Left detail panel */}
        {activeTab && (
          <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">

            {/* PRODUCT */}
            {activeTab === "product" && (
              <div className="p-4">
                <div className="bg-[#fdf6f0] rounded-2xl p-4 mb-4 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#f5ddd0] rounded-full opacity-60" />
                  <div className="absolute top-8 -right-2 w-14 h-14 bg-[#f0d0c0] rounded-full opacity-40" />
                  <div className="flex items-start gap-3 relative">
                    <div className="w-9 h-9 rounded-full bg-[#e8734a] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" /></svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm leading-tight">Premium Cotton Shirt</h2>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Handcrafted quality meets modern design. Ring-spun cotton with superior comfort.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {(["details", "change"] as ProductTab[]).map(tab => (
                    <button key={tab} onClick={() => setProductTab(tab)}
                      className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition-colors ${productTab === tab ? "bg-[#e8734a] text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                      {tab === "details" ? "Details" : "Change"}
                    </button>
                  ))}
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

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8734a" strokeWidth="2"><circle cx="13.5" cy="6.5" r=".5" fill="#e8734a" /><circle cx="17.5" cy="10.5" r=".5" fill="#e8734a" /><circle cx="8.5" cy="7.5" r=".5" fill="#e8734a" /><circle cx="6.5" cy="12.5" r=".5" fill="#e8734a" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>
                    <span className="font-bold text-gray-800 text-sm tracking-wide">COLOR PALETTE</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full transition-all border-2 ${selectedColor === color ? "border-[#e8734a] scale-110 shadow-md" : "border-transparent hover:scale-105 hover:border-gray-300"} ${color === "#ffffff" ? "border-gray-200" : ""}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* UPLOAD */}
            {activeTab === "upload" && (
              <div className="p-4 flex flex-col gap-4">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#e8734a] rounded-2xl py-8 flex flex-col items-center gap-3 hover:bg-[#fdf6f0] transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#fdf6f0] flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8734a" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                  <span className="bg-[#e8734a] text-white rounded-full px-5 py-1.5 text-sm font-semibold">Pilih File</span>
                </button>
                <p className="text-xs text-gray-400 text-center">Gambar akan muncul di canvas dan bisa digeser bebas</p>

                {/* Uploaded elements list */}
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
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-[#e8734a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm leading-tight">Text Designer</p>
                    <p className="text-xs text-gray-400">Craft your perfect message</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
                  {/* Your Message */}
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

                  {/* Font Size */}
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

                  {/* Spacing */}
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

                  {/* Text Color */}
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" style={{ backgroundColor: tdColor }} />
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest">TEXT COLOR</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <label className="w-10 h-10 rounded-xl border-2 border-[#f0e4d8] flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden relative" style={{ backgroundColor: tdColor }}>
                        <input type="color" value={tdColor} onChange={e => setTdColor(e.target.value)} className="absolute opacity-0 w-full h-full cursor-pointer" />
                      </label>
                      <input
                        type="text"
                        value={tdColor}
                        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setTdColor(e.target.value); }}
                        className="w-0 flex-1 min-w-0 bg-[#fdf8f4] border border-[#f0e4d8] rounded-xl px-3 py-2 text-sm text-gray-600 font-mono outline-none focus:border-[#e8734a] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {tdColors.map(c => (
                        <button key={c} onClick={() => setTdColor(c)}
                          className={`aspect-square rounded-xl border-2 transition-all ${tdColor === c ? "border-[#e8734a] scale-105 shadow-md" : "border-gray-100 hover:scale-105"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  {/* Font Style */}
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest">FONT STYLE</span>
                    </div>
                    <FontPicker
                      defaultValue="Poppins"
                      autoLoad
                      value={(font) => setTdFont(font)}
                    />
                  </div>

                  {/* Style + Align */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-500 tracking-widest block mb-2">STYLE</span>
                      <div className="flex gap-2">
                        <button onClick={() => setTdBold(v => !v)}
                          className={`flex-1 h-9 rounded-xl font-bold text-base transition-all border ${tdBold ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>B</button>
                        <button onClick={() => setTdItalic(v => !v)}
                          className={`flex-1 h-9 rounded-xl italic text-base transition-all border ${tdItalic ? "bg-gray-800 text-white border-gray-800" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}><em>I</em></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add to Design button */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <button onClick={addCustomText}
                    className="w-full bg-[#8b6340] hover:bg-[#7a5535] text-white rounded-2xl py-3.5 font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2">
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0"><circle cx="9" cy="5" r="1" fill="#9ca3af"/><circle cx="9" cy="12" r="1" fill="#9ca3af"/><circle cx="9" cy="19" r="1" fill="#9ca3af"/><circle cx="15" cy="5" r="1" fill="#9ca3af"/><circle cx="15" cy="12" r="1" fill="#9ca3af"/><circle cx="15" cy="19" r="1" fill="#9ca3af"/></svg>
                      {el.type === "image" ? (
                        <div className="w-8 h-8 rounded overflow-hidden relative flex-shrink-0">
                          <Image src={el.src!} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ backgroundColor: el.color ?? "#111", fontFamily: el.fontFamily }}>
                          T
                        </div>
                      )}
                      <span className="text-sm text-gray-600 flex-1 truncate">
                        {el.type === "text" ? (el.text || "Text") : `Image ${viewElements.length - i}`}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); setElements(prev => prev.filter(item => item.id !== el.id)); if (selectedEl === el.id) setSelectedEl(null); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors flex-shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-center gap-2 py-3 flex-shrink-0">
            <button className="w-11 h-11 bg-[#f0ebe2] rounded-xl flex items-center justify-center hover:bg-[#e8e0d4] transition-colors shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
            </button>
            <button className="w-11 h-11 bg-[#f0ebe2] rounded-xl flex items-center justify-center hover:bg-[#e8e0d4] transition-colors shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" /></svg>
            </button>
            <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-11 h-11 bg-[#e8e2d8] rounded-xl flex items-center justify-center hover:bg-[#ddd8cc] transition-colors shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
            </button>
            <div className="w-20 h-11 bg-white rounded-xl flex items-center justify-center text-sm font-semibold text-gray-700 shadow-sm border border-gray-200 select-none">{zoom}%</div>
            <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-11 h-11 bg-[#e8e2d8] rounded-xl flex items-center justify-center hover:bg-[#ddd8cc] transition-colors shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
            </button>
            <button className="w-11 h-11 bg-[#e8e2d8] rounded-xl flex items-center justify-center hover:bg-[#ddd8cc] transition-colors shadow-sm">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            </button>
            {/* Delete selected */}
            {selectedEl && (
              <button onClick={deleteSelected} className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm border border-red-200">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
              </button>
            )}
          </div>

          {/* Canvas */}
          <div
            className="flex-1 overflow-hidden relative flex items-center justify-center bg-[#e8e4dc]"
            onClick={() => setSelectedEl(null)}
          >
            <div className="absolute top-0 left-0 right-0  bg-[#4a7fc1]" />
            <div
              className="flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}
            >
              <div className="relative drop-shadow-xl" style={{ width: CANVAS, height: CANVAS }}>
                {/* Product image (color-processed) */}
                {processedSrc[selectedView] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={processedSrc[selectedView]}
                    alt="Product"
                    draggable={false}
                    style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"contain", pointerEvents:"none" }}
                  />
                )}

                {/* Printable zone guide — only visible when an element is selected */}
                {selectedEl && viewElements.some(el => el.id === selectedEl) && (
                  <div
                    className="absolute border-2 border-dashed border-white/50 pointer-events-none"
                    style={{
                      left: `${zone.x}%`, top: `${zone.y}%`,
                      width: `${zone.w}%`, height: `${zone.h}%`,
                    }}
                  />
                )}

                {/* Draggable elements */}
                {viewElements.map((el) => {
                  const isSelected = el.id === selectedEl;
                  const isEditingText = editingTextId === el.id;
                  return (
                    <div
                      key={el.id}
                      onPointerDown={(e) => { if (!isEditingText) onPointerDown(e, el.id); }}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={() => { if (el.type === "text") setEditingTextId(el.id); }}
                      className={`absolute select-none ${isEditingText ? "cursor-text" : "cursor-grab active:cursor-grabbing"} ${isSelected ? "outline outline-2 outline-[#4a7fc1] outline-offset-1" : ""}`}
                      style={{ left: el.x, top: el.y, width: el.type === "image" ? el.w : "auto", height: el.type === "image" ? el.h : "auto" }}
                    >
                      {el.type === "image" ? (
                        <div style={{ width: el.w, height: el.h, position: "relative" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={el.src!} alt="design" draggable={false} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", userSelect: "none", display: "block" }} />
                          {/* Resize handles — corners only, visible when selected */}
                          {isSelected && (["nw","ne","sw","se"] as const).map((corner) => (
                            <div
                              key={corner}
                              onPointerDown={(e) => onResizeHandlePointerDown(e, el.id, corner)}
                              className="absolute w-3 h-3 bg-white border-2 border-[#4a7fc1] rounded-sm z-10"
                              style={{
                                top:    corner.startsWith("n") ? -6 : undefined,
                                bottom: corner.startsWith("s") ? -6 : undefined,
                                left:   corner.endsWith("w")   ? -6 : undefined,
                                right:  corner.endsWith("e")   ? -6 : undefined,
                                cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                              }}
                            />
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
                      ) : (
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

        {/* Right panel - Views */}
        <div className="w-28 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-3 py-3 border-b border-gray-100">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            <span className="text-xs font-bold text-gray-500 tracking-wider">VIEWS</span>
          </div>
          <div className="flex flex-col items-center py-4 relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gray-200 z-0" />
            {views.map(({ key, label, src }) => {
              const active = selectedView === key;
              return (
                <button key={key} onClick={() => setSelectedView(key)}
                  className="relative z-10 flex flex-col items-center w-full px-3 mb-1">
                  <div
                    className="w-full rounded-2xl overflow-hidden p-1.5 shadow-sm transition-all"
                    style={{ backgroundColor: active ? selectedColor : "#ffffff" }}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative bg-gray-100">
                      {processedSrc[key] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={processedSrc[key]} alt={label} style={{ width:"100%", height:"100%", objectFit:"contain" }} />
                      ) : (
                        <Image src={src} alt={label} fill className="object-contain" />
                      )}
                    </div>
                  </div>
                  <p className={`text-[10px] font-semibold tracking-wider mt-1.5 mb-3 ${active ? "text-gray-700" : "text-gray-400"}`}>{label}</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
