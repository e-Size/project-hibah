"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { productAddonService, productService, uploadService } from "@/services/admin-service";
import type { ProductAddon, ProductListItem } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.esize.id";
const addonTypes = ["tipe", "bahan", "warna"];

export default function ProductAddonsPage() {
  const [data, setData] = useState<ProductAddon[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAddon | null>(null);
  const [deleting, setDeleting] = useState<ProductAddon | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterProduct, setFilterProduct] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    product_id: "", addon_type: "tipe", addon_name: "", extra_fee: 0,
    color_hex: "", image_url: "", desc: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [addons, prods] = await Promise.all([
        productAddonService.getAll(filterProduct || undefined),
        productService.getAll(),
      ]);
      setData(addons);
      setProducts(prods);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, [filterProduct]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ product_id: "", addon_type: "tipe", addon_name: "", extra_fee: 0, color_hex: "", image_url: "", desc: "" });
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const openEdit = (item: ProductAddon) => {
    setEditing(item);
    setForm({
      product_id: item.product_id,
      addon_type: item.addon_type,
      addon_name: item.addon_name,
      extra_fee: item.extra_fee,
      color_hex: item.color_hex,
      image_url: item.image_url,
      desc: item.desc,
    });
    setPreviewUrl(item.image_url ? `${API_HOST}${item.image_url}` : null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editing && !form.product_id) { showToast("Pilih produk", "error"); return; }
    if (!form.addon_name.trim()) { showToast("Nama addon wajib diisi", "error"); return; }
    setSaving(true);
    try {
      // Upload file dulu jika ada
      let imageUrl = form.image_url;
      const file = fileRef.current?.files?.[0];
      if (file) {
        imageUrl = await uploadService.upload(file);
      }

      if (editing) {
        await productAddonService.update(editing.id, {
          addon_type: form.addon_type,
          addon_name: form.addon_name,
          extra_fee: form.extra_fee,
          color_hex: form.color_hex,
          image_url: imageUrl,
          desc: form.desc,
        });
        showToast("Addon berhasil diupdate", "success");
      } else {
        await productAddonService.create({
          product_id: form.product_id,
          addon_type: form.addon_type,
          addon_name: form.addon_name,
          extra_fee: form.extra_fee,
          color_hex: form.color_hex,
          image_url: imageUrl,
          desc: form.desc,
        });
        showToast("Addon berhasil ditambahkan", "success");
      }
      setModalOpen(false);
      load();
    } catch { showToast("Gagal menyimpan", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await productAddonService.delete(deleting.id);
      showToast("Addon berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const columns: Column<ProductAddon>[] = [
    {
      key: "product_id", label: "Produk",
      render: (item) => {
        const p = products.find((x) => x.id === item.product_id);
        return p ? p.name : item.product_id.slice(0, 8);
      },
    },
    {
      key: "addon_type", label: "Tipe",
      render: (item) => <span className="admin-badge admin-badge-amber">{item.addon_type}</span>,
    },
    { key: "addon_name", label: "Nama" },
    {
      key: "extra_fee", label: "Extra Fee",
      render: (item) => item.extra_fee ? fmt(item.extra_fee) : "—",
    },
    {
      key: "color_hex", label: "Warna",
      render: (item) => item.color_hex ? <span className="admin-color-swatch" style={{ backgroundColor: item.color_hex }} /> : "—",
    },
    {
      key: "image_url", label: "Gambar",
      render: (item) => item.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={`${API_HOST}${item.image_url}`} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
      ) : "—",
    },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Product Addons</h2>
            <select
              className="admin-form-select"
              style={{ width: "auto", minWidth: 180, padding: "6px 10px", fontSize: "0.8rem" }}
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
            >
              <option value="">Semua Produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Addon</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Addon" : "Tambah Addon"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)} type="button">Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} type="button">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        {!editing && (
          <div className="admin-form-group">
            <label className="admin-form-label">Produk *</label>
            <select className="admin-form-select" value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
              <option value="">— Pilih Produk —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Tipe Addon *</label>
            <select className="admin-form-select" value={form.addon_type} onChange={(e) => setForm({ ...form, addon_type: e.target.value })}>
              {addonTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Nama Addon *</label>
            <input className="admin-form-input" value={form.addon_name} onChange={(e) => setForm({ ...form, addon_name: e.target.value })} placeholder="e.g. Lengan Panjang" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Extra Fee (Rp)</label>
            <input className="admin-form-input" type="number" min={0} value={form.extra_fee} onChange={(e) => setForm({ ...form, extra_fee: Number(e.target.value) })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Warna (Hex)</label>
            <input className="admin-form-input" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} placeholder="#111111" />
            <p className="admin-form-hint">Hanya untuk addon_type &quot;warna&quot;</p>
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Gambar (untuk tipe bahan)</label>
          <input
            ref={fileRef}
            className="admin-form-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          <p className="admin-form-hint">Format: JPG, PNG, WebP. Kosongkan jika tidak ingin mengubah.</p>
        </div>
        {previewUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
          </div>
        )}
        <div className="admin-form-group">
          <label className="admin-form-label">Deskripsi</label>
          <textarea className="admin-form-textarea" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Deskripsi addon" />
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="addon" />
    </>
  );
}
