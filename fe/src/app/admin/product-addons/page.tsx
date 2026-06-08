"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { productAddonService, productService, uploadService } from "@/services/admin-service";
import type { ProductAddon, ProductListItem, PaginationMeta } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "https://api.esize.id";
const addonTypes = ["ukuran", "tipe", "bahan", "warna"];
const DEFAULT_META: PaginationMeta = { total: 0, page: 1, limit: 10, total_pages: 1 };

export default function ProductAddonsPage() {
  const [data, setData] = useState<ProductAddon[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductAddon | null>(null);
  const [deleting, setDeleting] = useState<ProductAddon | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    product_id: "", addon_type: "tipe", addon_name: "", extra_fee: 0,
    color_hex: "", image_url: "", desc: "",
  });

  // Load products for dropdown once
  useEffect(() => {
    productService.getAll().then(setProducts).catch(() => showToast("Gagal memuat produk", "error"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productAddonService.getPaginated({ page, search, product_id: filterProduct || undefined });
      setData(res.data);
      setMeta(res.meta);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, [page, search, filterProduct]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (v: string) => { setFilterProduct(v); setPage(1); };

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
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!editing && !form.product_id) { showToast("Pilih produk", "error"); return; }
    if (!form.addon_name.trim()) { showToast("Nama addon wajib diisi", "error"); return; }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      const file = fileRef.current?.files?.[0];
      if (file) imageUrl = await uploadService.upload(file);

      if (editing) {
        await productAddonService.update(editing.id, {
          addon_type: form.addon_type, addon_name: form.addon_name, extra_fee: form.extra_fee,
          color_hex: form.color_hex, image_url: imageUrl, desc: form.desc,
        });
        showToast("Addon berhasil diupdate", "success");
      } else {
        await productAddonService.create({
          product_id: form.product_id, addon_type: form.addon_type, addon_name: form.addon_name,
          extra_fee: form.extra_fee, color_hex: form.color_hex, image_url: imageUrl, desc: form.desc,
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
    { key: "addon_type", label: "Tipe", render: (item) => <span className="admin-badge admin-badge-amber">{item.addon_type}</span> },
    { key: "addon_name", label: "Nama" },
    { key: "extra_fee", label: "Extra Fee", render: (item) => item.extra_fee ? fmt(item.extra_fee) : "—" },
    {
      key: "color_hex", label: "Warna",
      render: (item) => item.color_hex ? <span className="admin-color-swatch" style={{ backgroundColor: item.color_hex }} /> : "—",
    },
    {
      key: "image_url", label: "Gambar",
      render: (item) => (
        item.image_url ? (
          <div
            style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)", cursor: "pointer", background: "white" }}
            onClick={(e) => { e.stopPropagation(); setViewingImage(`${API_HOST}${item.image_url}`); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${API_HOST}${item.image_url}`} alt={item.addon_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 10 }}>No Image</div>
        )
      ),
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
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">Semua Produk</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Addon</button>
        </div>
        <div style={{ padding: "12px 20px 0" }}>
          <input
            className="admin-form-input"
            style={{ maxWidth: 320 }}
            placeholder="Cari nama addon..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
        <div style={{ padding: "0 20px 16px" }}>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
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
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Gambar (untuk tipe bahan)</label>
          <input ref={fileRef} className="admin-form-input" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
          <p className="admin-form-hint">Kosongkan jika tidak ingin mengubah.</p>
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

      {viewingImage && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}
          onClick={() => setViewingImage(null)}
        >
          <button
            style={{ position: "absolute", top: 20, right: 20, background: "white", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setViewingImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="24" height="24">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewingImage} alt="View" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, background: "white" }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="addon" />
    </>
  );
}
