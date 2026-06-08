"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { sizeVariantService } from "@/services/admin-service";
import type { SizeVariant, PaginationMeta } from "@/types/admin";

const DEFAULT_META: PaginationMeta = { total: 0, page: 1, limit: 10, total_pages: 1 };

export default function SizeVariantsPage() {
  const [data, setData] = useState<SizeVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SizeVariant | null>(null);
  const [deleting, setDeleting] = useState<SizeVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", label: "", variant_type: "" });

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sizeVariantService.getPaginated({ page, search });
      setData(res.data);
      setMeta(res.meta);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ code: "", label: "", variant_type: "" }); setModalOpen(true); };
  const openEdit = (item: SizeVariant) => {
    setEditing(item);
    setForm({ code: item.code, label: item.label, variant_type: item.variant_type });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.label.trim() || !form.variant_type.trim()) { showToast("Isi semua field", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await sizeVariantService.update(editing.id, form);
        showToast("Size variant berhasil diupdate", "success");
      } else {
        await sizeVariantService.create(form);
        showToast("Size variant berhasil ditambahkan", "success");
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
      await sizeVariantService.delete(deleting.id);
      showToast("Size variant berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<SizeVariant>[] = [
    { key: "code", label: "Kode", render: (item) => <span style={{ fontWeight: 700 }}>{item.code}</span> },
    { key: "label", label: "Label" },
    {
      key: "variant_type", label: "Tipe Variant",
      render: (item) => <span className="admin-badge admin-badge-green">{item.variant_type}</span>,
    },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Size Variant</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Size</button>
        </div>
        <div style={{ padding: "12px 20px 0" }}>
          <input
            className="admin-form-input"
            style={{ maxWidth: 320 }}
            placeholder="Cari kode, label, atau tipe..."
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
        title={editing ? "Edit Size Variant" : "Tambah Size Variant"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)} type="button">Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving} type="button">
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Kode *</label>
            <input className="admin-form-input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. S, M, L, XL" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Label *</label>
            <input className="admin-form-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Small, Medium" />
          </div>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Tipe Variant *</label>
          <input className="admin-form-input" value={form.variant_type} onChange={(e) => setForm({ ...form, variant_type: e.target.value })} placeholder="e.g. pakaian, kertas" />
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="size variant" />
    </>
  );
}
