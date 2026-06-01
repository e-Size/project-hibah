"use client";
import React, { useEffect, useState, useCallback } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { materialService, materialGroupService } from "@/services/admin-service";
import type { Material, MaterialGroup } from "@/types/admin";

export default function MaterialsPage() {
  const [data, setData] = useState<Material[]>([]);
  const [groups, setGroups] = useState<MaterialGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", material_group_id: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mats, grps] = await Promise.all([materialService.getAll(), materialGroupService.getAll()]);
      setData(mats);
      setGroups(grps);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: "", material_group_id: "", description: "" }); setModalOpen(true); };
  const openEdit = (item: Material) => {
    setEditing(item);
    setForm({ name: item.name, material_group_id: item.material_group_id || "", description: item.description });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Nama wajib diisi", "error"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        material_group_id: form.material_group_id || null,
      };
      if (editing) {
        await materialService.update(editing.id, payload);
        showToast("Material berhasil diupdate", "success");
      } else {
        await materialService.create(payload);
        showToast("Material berhasil ditambahkan", "success");
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
      await materialService.delete(deleting.id);
      showToast("Material berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<Material>[] = [
    { key: "name", label: "Nama" },
    {
      key: "material_group", label: "Grup",
      render: (item) => item.material_group ? (
        <span className="admin-badge admin-badge-blue">{item.material_group.name}</span>
      ) : "—",
    },
    { key: "description", label: "Deskripsi", render: (item) => item.description || "—" },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Material</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Material</button>
        </div>
        <DataTable columns={columns} data={data} loading={loading} onEdit={openEdit} onDelete={(item) => setDeleting(item)} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Material" : "Tambah Material"}
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
          <input className="admin-form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama material" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Grup Material</label>
          <select className="admin-form-select" value={form.material_group_id} onChange={(e) => setForm({ ...form, material_group_id: e.target.value })}>
            <option value="">— Tanpa Grup —</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Deskripsi</label>
          <textarea className="admin-form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi material" />
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="material" />
    </>
  );
}
