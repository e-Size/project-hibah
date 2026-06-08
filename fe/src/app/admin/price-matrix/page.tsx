"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { priceMatrixService, productService, sizeVariantService, quantityTierService, materialGroupService } from "@/services/admin-service";
import type { PriceMatrix, ProductListItem, SizeVariant, QuantityTier, MaterialGroup, PaginationMeta } from "@/types/admin";

const DEFAULT_META: PaginationMeta = { total: 0, page: 1, limit: 10, total_pages: 1 };

export default function PriceMatrixPage() {
  const [data, setData] = useState<PriceMatrix[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [sizes, setSizes] = useState<SizeVariant[]>([]);
  const [tiers, setTiers] = useState<QuantityTier[]>([]);
  const [matGroups, setMatGroups] = useState<MaterialGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [page, setPage] = useState(1);
  const [filterProduct, setFilterProduct] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PriceMatrix | null>(null);
  const [deleting, setDeleting] = useState<PriceMatrix | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ product_id: "", size_variant_id: "", quantity_tier_id: "", material_group_id: "", price: 0 });

  // Load dropdowns once
  useEffect(() => {
    Promise.all([
      productService.getAll(),
      sizeVariantService.getAll(),
      quantityTierService.getAll(),
      materialGroupService.getAll(),
    ]).then(([prods, sv, qt, mg]) => {
      setProducts(prods); setSizes(sv); setTiers(qt); setMatGroups(mg);
    }).catch(() => showToast("Gagal memuat referensi data", "error"));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await priceMatrixService.getPaginated({ page, product_id: filterProduct || undefined });
      setData(res.data);
      setMeta(res.meta);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, [page, filterProduct]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filter changes
  const handleFilterChange = (v: string) => { setFilterProduct(v); setPage(1); };

  const openCreate = () => {
    setEditing(null);
    setForm({ product_id: "", size_variant_id: "", quantity_tier_id: "", material_group_id: "", price: 0 });
    setModalOpen(true);
  };

  const openEdit = (item: PriceMatrix) => {
    setEditing(item);
    setForm({
      product_id: item.product_id,
      size_variant_id: item.size_variant_id || "",
      quantity_tier_id: item.quantity_tier_id || "",
      material_group_id: item.material_group_id || "",
      price: item.price,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing && !form.product_id) { showToast("Pilih produk", "error"); return; }
    if (form.price <= 0) { showToast("Harga harus > 0", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await priceMatrixService.update(editing.id, {
          size_variant_id: form.size_variant_id || null,
          quantity_tier_id: form.quantity_tier_id || null,
          material_group_id: form.material_group_id || null,
          price: form.price,
        });
        showToast("Price matrix berhasil diupdate", "success");
      } else {
        await priceMatrixService.create({
          product_id: form.product_id,
          size_variant_id: form.size_variant_id || null,
          quantity_tier_id: form.quantity_tier_id || null,
          material_group_id: form.material_group_id || null,
          price: form.price,
        });
        showToast("Price matrix berhasil ditambahkan", "success");
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
      await priceMatrixService.delete(deleting.id);
      showToast("Price matrix berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const columns: Column<PriceMatrix>[] = [
    {
      key: "product_id", label: "Produk",
      render: (item) => {
        const p = products.find((x) => x.id === item.product_id);
        return p ? p.name : item.product_id.slice(0, 8);
      },
    },
    {
      key: "size_variant", label: "Size",
      render: (item) => item.size_variant ? <span className="admin-badge admin-badge-green">{item.size_variant.label}</span> : "—",
    },
    {
      key: "quantity_tier", label: "Qty Tier",
      render: (item) => item.quantity_tier ? <span className="admin-badge admin-badge-amber">{item.quantity_tier.label}</span> : "—",
    },
    {
      key: "material_group", label: "Material",
      render: (item) => item.material_group ? <span className="admin-badge admin-badge-blue">{item.material_group.name}</span> : "—",
    },
    {
      key: "price", label: "Harga",
      render: (item) => <span style={{ fontWeight: 700 }}>{fmt(item.price)}</span>,
    },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Price Matrix</h2>
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
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Harga</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
        <div style={{ padding: "0 20px 16px" }}>
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Price Matrix" : "Tambah Price Matrix"}
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
            <label className="admin-form-label">Size Variant</label>
            <select className="admin-form-select" value={form.size_variant_id} onChange={(e) => setForm({ ...form, size_variant_id: e.target.value })}>
              <option value="">— Semua —</option>
              {sizes.map((s) => <option key={s.id} value={s.id}>{s.label} ({s.code})</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Quantity Tier</label>
            <select className="admin-form-select" value={form.quantity_tier_id} onChange={(e) => setForm({ ...form, quantity_tier_id: e.target.value })}>
              <option value="">— Semua —</option>
              {tiers.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Material</label>
            <select className="admin-form-select" value={form.material_group_id} onChange={(e) => setForm({ ...form, material_group_id: e.target.value })}>
              <option value="">— Semua —</option>
              {matGroups.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Harga (Rp) *</label>
            <input className="admin-form-input" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="price matrix" />
    </>
  );
}
