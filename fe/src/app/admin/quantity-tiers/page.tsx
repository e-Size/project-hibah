"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { quantityTierService } from "@/services/admin-service";
import type { QuantityTier } from "@/types/admin";

export default function QuantityTiersPage() {
  const [data, setData] = useState<QuantityTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuantityTier | null>(null);
  const [deleting, setDeleting] = useState<QuantityTier | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ min_qty: 1, max_qty: 10, label: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await quantityTierService.getAll()); } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ min_qty: 1, max_qty: 10, label: "" }); setModalOpen(true); };
  const openEdit = (item: QuantityTier) => {
    setEditing(item);
    setForm({ min_qty: item.min_qty, max_qty: item.max_qty, label: item.label });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) { showToast("Label wajib diisi", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await quantityTierService.update(editing.id, form);
        showToast("Quantity tier berhasil diupdate", "success");
      } else {
        await quantityTierService.create(form);
        showToast("Quantity tier berhasil ditambahkan", "success");
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
      await quantityTierService.delete(deleting.id);
      showToast("Quantity tier berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<QuantityTier>[] = [
    { key: "label", label: "Label", render: (item) => <span style={{ fontWeight: 600 }}>{item.label}</span> },
    { key: "min_qty", label: "Min Qty" },
    { key: "max_qty", label: "Max Qty" },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Quantity Tier</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Tier</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Quantity Tier" : "Tambah Quantity Tier"}
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
          <label className="admin-form-label">Label *</label>
          <input className="admin-form-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. 1-12 pcs, 13-50 pcs" />
        </div>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Min Qty</label>
            <input className="admin-form-input" type="number" min={1} value={form.min_qty} onChange={(e) => setForm({ ...form, min_qty: Number(e.target.value) })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Max Qty</label>
            <input className="admin-form-input" type="number" min={1} value={form.max_qty} onChange={(e) => setForm({ ...form, max_qty: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="quantity tier" />
    </>
  );
}
