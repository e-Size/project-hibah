"use client";

import { useCallback, useEffect, useState } from "react";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import Modal from "@/components/admin/Modal";
import { showToast } from "@/components/admin/Toast";
import { productService, colorPaletteService } from "@/services/admin-service";
import type { ProductListItem, ColorPalette } from "@/types/admin";

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export default function ColorPalettesPage() {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [colors, setColors] = useState<string[]>(["#ffffff"]);
  const [editing, setEditing] = useState<ColorPalette | null>(null);
  const [deleting, setDeleting] = useState<ColorPalette | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paletteData, productData] = await Promise.all([
        colorPaletteService.getAll(),
        productService.getAll(),
      ]);
      setPalettes(paletteData);
      setProducts(productData);
    } catch {
      showToast("Gagal memuat color palette", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableProducts = products.filter(
    (product) => !palettes.some((palette) => palette.product_id === product.id) || product.id === editing?.product_id
  );

  const openCreate = () => {
    setEditing(null);
    setSelectedProduct("");
    setColors(["#ffffff"]);
    setModalOpen(true);
  };

  const openEdit = (palette: ColorPalette) => {
    setEditing(palette);
    setSelectedProduct(palette.product_id);
    setColors(palette.colors.length > 0 ? palette.colors : ["#ffffff"]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSelectedProduct("");
    setColors(["#ffffff"]);
  };

  const updateColor = (index: number, value: string) => {
    setColors((prev) => prev.map((color, i) => (i === index ? value : color)));
  };

  const addColor = () => setColors((prev) => [...prev, "#ffffff"]);
  const removeColor = (index: number) => setColors((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!selectedProduct) {
      showToast("Pilih produk", "error");
      return;
    }
    const cleaned = colors.map((color) => color.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      showToast("Tambahkan minimal satu warna", "error");
      return;
    }
    if (!cleaned.every((color) => HEX_RE.test(color))) {
      showToast("Format warna harus hex, contoh: #FFFFFF", "error");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await colorPaletteService.update(editing.id, { colors: cleaned });
        showToast("Color palette berhasil diperbarui", "success");
      } else {
        await colorPaletteService.create({ product_id: selectedProduct, colors: cleaned });
        showToast("Color palette berhasil ditambahkan", "success");
      }
      closeModal();
      await loadData();
    } catch {
      showToast("Gagal menyimpan color palette", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await colorPaletteService.delete(deleting.id);
      showToast("Color palette berhasil dihapus", "success");
      setDeleting(null);
      await loadData();
    } catch {
      showToast("Gagal menghapus color palette", "error");
    } finally {
      setSaving(false);
    }
  };

  const productName = (productId: string) =>
    products.find((product) => product.id === productId)?.name ?? "Unknown Product";

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Color Palette</h2>
            <p style={{ margin: "4px 0 0", color: "var(--admin-text-secondary)", fontSize: 14 }}>
              Daftar pilihan warna untuk setiap produk di editor desain
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate} disabled={availableProducts.length === 0}>
            + Tambah Color Palette
          </button>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ) : palettes.length === 0 ? (
            <div className="admin-empty">Belum ada color palette</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {palettes.map((palette) => (
                <div key={palette.id} style={{ border: "1px solid var(--admin-border)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                  <div style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 8, minHeight: 64, alignContent: "flex-start" }}>
                    {palette.colors.map((color, i) => (
                      <span
                        key={i}
                        title={color}
                        style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--admin-border)", backgroundColor: color, flexShrink: 0 }}
                      />
                    ))}
                  </div>
                  <div style={{ padding: 12, borderTop: "1px solid var(--admin-border)" }}>
                    <strong style={{ display: "block", marginBottom: 10 }}>{productName(palette.product_id)}</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(palette)}>Ubah</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => setDeleting(palette)}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Ubah Color Palette" : "Tambah Color Palette"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Produk *</label>
          <select className="admin-form-select" value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} disabled={Boolean(editing)}>
            <option value="">— Pilih Produk —</option>
            {availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Warna *</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {colors.map((color, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ position: "relative", width: 40, height: 40, borderRadius: 8, border: "2px solid var(--admin-border)", cursor: "pointer", backgroundColor: HEX_RE.test(color) ? color : "#ffffff", flexShrink: 0 }}>
                  <input type="color" value={HEX_RE.test(color) ? color : "#ffffff"} onChange={(e) => updateColor(index, e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                </label>
                <input
                  className="admin-form-input"
                  type="text"
                  value={color}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (v && !v.startsWith("#")) v = "#" + v;
                    updateColor(index, v);
                  }}
                  placeholder="#ffffff"
                  style={{ fontFamily: "monospace", margin: 0 }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => removeColor(index)}
                  disabled={colors.length <= 1}
                  style={{ flexShrink: 0 }}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={addColor} style={{ marginTop: 10 }}>
            + Tambah Warna
          </button>
          <p className="admin-form-hint">Format hex, contoh: #FF5733</p>
        </div>
      </Modal>

      <DeleteConfirm
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={saving}
        itemName={`color palette ${deleting ? productName(deleting.product_id) : ""}`}
      />
    </>
  );
}
