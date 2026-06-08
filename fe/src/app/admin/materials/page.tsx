"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { materialGroupService, uploadService } from "@/services/admin-service";
import type { MaterialGroup, MaterialGroupUpdateRequest, PaginationMeta } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "https://api.esize.id";
const DEFAULT_META: PaginationMeta = { total: 0, page: 1, limit: 10, total_pages: 1 };

export default function MaterialGroupsPage() {
  const [data, setData] = useState<MaterialGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialGroup | null>(null);
  const [deleting, setDeleting] = useState<MaterialGroup | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await materialGroupService.getPaginated({ page, search });
      setData(res.data);
      setMeta(res.meta);
    } catch { showToast("Gagal memuat data", "error"); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setImageFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const openEdit = (item: MaterialGroup) => {
    setEditing(item);
    setName(item.name);
    setImageFile(null);
    setPreviewUrl(item.image_url ? `${API_HOST}${item.image_url}` : "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { showToast("Nama wajib diisi", "error"); return; }
    setSaving(true);
    try {
      let uploadedUrl = "";
      if (imageFile) uploadedUrl = await uploadService.upload(imageFile);
      if (editing) {
        const payload: MaterialGroupUpdateRequest = { name };
        if (uploadedUrl) payload.image_url = uploadedUrl;
        await materialGroupService.update(editing.id, payload);
        showToast("Material berhasil diupdate", "success");
      } else {
        await materialGroupService.create({ name, image_url: uploadedUrl });
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
      await materialGroupService.delete(deleting.id);
      showToast("Material berhasil dihapus", "success");
      setDeleting(null);
      load();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const columns: Column<MaterialGroup>[] = [
    {
      key: "image_url", label: "Gambar",
      render: (item) => (
        item.image_url ? (
          <div
            style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)", cursor: "pointer", background: "white" }}
            onClick={(e) => { e.stopPropagation(); setViewingImage(`${API_HOST}${item.image_url}`); }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${API_HOST}${item.image_url}`} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 10 }}>No Image</div>
        )
      ),
    },
    { key: "name", label: "Nama Material" },
  ];

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Material</h2>
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ Tambah Material</button>
        </div>
        <div style={{ padding: "12px 20px 0" }}>
          <input
            className="admin-form-input"
            style={{ maxWidth: 320 }}
            placeholder="Cari nama material..."
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
        <div onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Nama Material *</label>
            <input className="admin-form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cotton, Polyester" />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Upload Gambar {editing ? "(Opsional)" : ""}</label>
            <input type="file" className="admin-form-input" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} ref={fileInputRef} />
            {editing && <p className="admin-form-hint">Kosongkan jika tidak ingin mengganti gambar</p>}
          </div>
          {previewUrl && (
            <div style={{ marginTop: 16, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)", background: "white" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} />
            </div>
          )}
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

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="material" />
    </>
  );
}
