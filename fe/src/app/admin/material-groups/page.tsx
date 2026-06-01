"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { materialGroupService } from "@/services/admin-service";
import type { MaterialGroup } from "@/types/admin";

export default function MaterialGroupsPage() {
  const [data, setData] = useState<MaterialGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialGroup | null>(null);
  const [deleting, setDeleting] = useState<MaterialGroup | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await materialGroupService.getAll()); } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setName(""); setModalOpen(true); };
  const openEdit = (item: MaterialGroup) => { setEditing(item); setName(item.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { showToast("Nama wajib diisi", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await materialGroupService.update(editing.id, { name });
        showToast("Grup material berhasil diupdate", "success");
      } else {
        await materialGroupService.create({ name });
        showToast("Grup material berhasil ditambahkan", "success");
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
      await materialGroupService.delete(deleting.id);
      showToast("Grup material berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<MaterialGroup>[] = [
    { key: "name", label: "Nama Grup" },
    {
      key: "materials", label: "Jumlah Material",
      render: (item) => <span className="admin-badge admin-badge-blue">{item.materials?.length ?? 0}</span>,
    },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Grup Material</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Grup</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Grup Material" : "Tambah Grup Material"}
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
          <label className="admin-form-label">Nama Grup *</label>
          <input className="admin-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cotton, Polyester" />
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="grup material" />
    </>
  );
}
