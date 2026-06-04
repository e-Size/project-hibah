"use client";
import React, { useEffect, useState, useRef } from "react";
import { extraImageService, uploadService } from "@/services/admin-service";
import type { ExtraImage, ExtraImageUpdateRequest } from "@/types/admin";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.esize.id";

export default function ExtraImagesPage() {
  const [images, setImages] = useState<ExtraImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Bulk actions state
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  // View modal state
  const [viewingImage, setViewingImage] = useState<ExtraImage | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExtraImage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await extraImageService.getAll();
      setImages(data);
    } catch {
      showToast("Gagal mengambil data gambar tambahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (img?: ExtraImage) => {
    if (img) {
      setEditingId(img.id);
      setName(img.name);
      setDescription(img.description || "");
      setPreviewUrl(`${API_HOST}${img.image_url}`);
      setImageFile(null);
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setPreviewUrl("");
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setPreviewUrl("");
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Nama gambar wajib diisi", "error");
      return;
    }
    if (!editingId && !imageFile) {
      showToast("File gambar wajib diupload", "error");
      return;
    }

    try {
      setIsSaving(true);
      let uploadedUrl = "";
      
      if (imageFile) {
        uploadedUrl = await uploadService.upload(imageFile);
      }

      if (editingId) {
        const payload: ExtraImageUpdateRequest = { name, description };
        if (uploadedUrl) payload.image_url = uploadedUrl;
        await extraImageService.update(editingId, payload);
        showToast("Gambar berhasil diupdate", "success");
      } else {
        await extraImageService.create({ name, description, image_url: uploadedUrl });
        showToast("Gambar berhasil ditambahkan", "success");
      }
      
      handleCloseModal();
      fetchImages();
    } catch {
      showToast("Gagal menyimpan gambar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedImages);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedImages(newSet);
  };
  
  const toggleSelectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSaving(true);
    try {
      await extraImageService.delete(deleteTarget.id);
      showToast("Gambar berhasil dihapus", "success");
      setDeleteTarget(null);
      fetchImages();
    } catch {
      showToast("Gagal menghapus gambar", "error");
    }
    setIsSaving(false);
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(selectedImages).map(id => extraImageService.delete(id))
      );
      showToast(`${selectedImages.size} gambar berhasil dihapus`, "success");
      setBulkDeleting(false);
      setSelectedImages(new Set());
      fetchImages();
    } catch {
      showToast("Beberapa gambar mungkin gagal dihapus", "error");
      fetchImages();
    }
    setIsSaving(false);
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Gambar Tambahan</h2>
            <p style={{ margin: "4px 0 0 0", color: "var(--admin-text-secondary)", fontSize: 14 }}>
              Kelola gambar mandiri yang tidak terhubung ke entitas lain
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {selectedImages.size > 0 && (
              <button className="admin-btn admin-btn-danger" onClick={() => setBulkDeleting(true)}>
                Hapus Terpilih ({selectedImages.size})
              </button>
            )}
            <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
              + Tambah Gambar
            </button>
          </div>
        </div>

        <div className="admin-card-body">
          {images.length > 0 && (
            <div style={{ padding: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <input 
                type="checkbox" 
                checked={selectedImages.size === images.length}
                onChange={toggleSelectAll}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: 14, color: "var(--admin-text-secondary)" }}>Pilih Semua</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-skeleton" style={{ height: 160, borderRadius: 12 }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="admin-empty">Belum ada gambar tambahan</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {images.map((img) => (
                <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${selectedImages.has(img.id) ? "var(--admin-primary)" : "var(--admin-border)"}`, background: "#f8fafc", boxShadow: selectedImages.has(img.id) ? "0 0 0 2px var(--admin-primary) inset" : "none" }}>
                  
                  {/* Checkbox Overlay */}
                  <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10 }}>
                    <input 
                      type="checkbox" 
                      checked={selectedImages.has(img.id)}
                      onChange={() => toggleSelect(img.id)}
                      style={{ cursor: "pointer", width: 16, height: 16 }}
                    />
                  </div>

                  {/* Image View Trigger */}
                  <div 
                    style={{ cursor: "pointer", width: "100%", height: 160 }} 
                    onClick={() => setViewingImage(img)}
                    title="Klik untuk melihat"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_HOST}${img.image_url}`}
                      alt={img.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "white" }}
                    />
                  </div>

                  {/* Actions & Info Footer */}
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--admin-border)", background: "white" }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "#1e293b", marginBottom: img.description ? 4 : 8 }}>{img.name}</div>
                    {img.description && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{img.description}</div>}
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>ID: {img.id.slice(0,8)}...</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          style={{ color: "#64748b", padding: 4 }}
                          onClick={() => handleOpenModal(img)}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          style={{ color: "var(--admin-danger)", padding: 4 }}
                          onClick={() => setDeleteTarget(img)}
                          title="Hapus"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? "Edit Gambar Tambahan" : "Tambah Gambar Tambahan"}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>Batal</button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}>
        <div className="admin-form-group">
          <label className="admin-form-label">Nama Gambar *</label>
          <input
            type="text"
            className="admin-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Banner Promo, Panduan Ukuran..."
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Deskripsi (Opsional)</label>
          <textarea
            className="admin-form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Digunakan di halaman utama bagian atas"
            rows={2}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Upload Gambar {editingId ? "(Opsional)" : "*"}</label>
          <input
            type="file"
            className="admin-form-input"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {editingId && <p className="admin-form-hint">Kosongkan jika tidak ingin mengganti gambar</p>}
        </div>
        
        {previewUrl && (
          <div style={{ marginTop: 16, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)", background: "white" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} />
          </div>
        )}
        </div>
      </Modal>

      {/* View Fullscreen Modal */}
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
          <img
            src={`${API_HOST}${viewingImage.image_url}`}
            alt="View"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, background: "white" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Single Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirm
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={isSaving}
          itemName={`gambar "${deleteTarget.name}"`}
        />
      )}

      {/* Bulk Delete Confirm */}
      <DeleteConfirm 
        isOpen={bulkDeleting} 
        onClose={() => setBulkDeleting(false)} 
        onConfirm={handleBulkDelete} 
        loading={isSaving} 
        itemName={`${selectedImages.size} gambar terpilih`} 
      />
    </>
  );
}
