"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { productService } from "@/services/admin-service";
import type { ProductListItem, ProductCreateRequest } from "@/types/admin";

const categoryOptions = ["pakaian", "merch"];

export default function ProductsPage() {
  const [data, setData] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [deleting, setDeleting] = useState<ProductListItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", category: "pakaian", pricing_type: "", bg_color: "#ffffff",
    keywords: "", min_qty: 1, description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await productService.getAll()); } catch { showToast("Gagal memuat produk", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "pakaian", pricing_type: "", bg_color: "#ffffff", keywords: "", min_qty: 1, description: "" });
    setModalOpen(true);
  };

  const openEdit = (item: ProductListItem) => {
    setEditing(item);
    setForm({
      name: item.name, category: item.category, pricing_type: item.pricing_type,
      bg_color: item.bg_color || "#ffffff", keywords: item.keywords, min_qty: item.min_qty, description: item.description,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.pricing_type) { showToast("Isi field yang wajib", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await productService.update(editing.id, form);
        showToast("Produk berhasil diupdate", "success");
      } else {
        await productService.create(form as ProductCreateRequest);
        showToast("Produk berhasil ditambahkan", "success");
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
      await productService.delete(deleting.id);
      showToast("Produk berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<ProductListItem>[] = [
    {
      key: "thumbnail", label: "Gambar",
      render: (item) =>
        item.thumbnail ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "https://api.esize.id"}${item.thumbnail}`} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 6, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 10 }}>N/A</div>
        ),
    },
    { key: "name", label: "Nama" },
    {
      key: "category", label: "Kategori",
      render: (item) => (
        <span className={`admin-badge ${item.category === "pakaian" ? "admin-badge-amber" : "admin-badge-blue"}`}>
          {item.category}
        </span>
      ),
    },
    { key: "pricing_type", label: "Tipe Harga" },
    { key: "min_qty", label: "Min Qty" },
    {
      key: "bg_color", label: "Warna",
      render: (item) => item.bg_color ? <span className="admin-color-swatch" style={{ backgroundColor: item.bg_color }} /> : "—",
    },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Produk</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Produk</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Produk" : "Tambah Produk"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)} type="button">Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} type="button">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Nama *</label>
          <input className="admin-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama produk" />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Kategori *</label>
            <select className="admin-form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Tipe Harga *</label>
            <input className="admin-form-input" value={form.pricing_type} onChange={(e) => setForm({ ...form, pricing_type: e.target.value })} placeholder="e.g. matrix, fixed" />
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Warna Background</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ position: "relative", width: 40, height: 40, borderRadius: 8, border: "2px solid var(--admin-border)", cursor: "pointer", backgroundColor: form.bg_color, flexShrink: 0 }}>
                <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
              </label>
              <input
                className="admin-form-input"
                type="text"
                value={form.bg_color}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!v.startsWith("#")) v = "#" + v;
                  setForm({ ...form, bg_color: v });
                }}
                placeholder="#ffffff"
                style={{ fontFamily: "monospace", margin: 0 }}
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Min Qty</label>
            <input className="admin-form-input" type="number" min={1} value={form.min_qty} onChange={(e) => setForm({ ...form, min_qty: Number(e.target.value) })} />
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Keywords</label>
          <input className="admin-form-input" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="kata kunci, dipisah koma" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Deskripsi</label>
          <textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi produk" />
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="produk" />
    </>
  );
}
