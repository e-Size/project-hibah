"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { productImageService, productService } from "@/services/admin-service";
import type { ProductImage, ProductListItem } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.esize.id";

export default function ProductImagesPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedProduct, setSelectedProduct] = useState("");
  
  // Bulk actions state
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // View modal state
  const [viewingImage, setViewingImage] = useState<ProductImage | null>(null);
  
  const [deleting, setDeleting] = useState<ProductImage | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [uploadProduct, setUploadProduct] = useState("");
  const [uploadOrder, setUploadOrder] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    try { setProducts(await productService.getAll()); } catch { /* noop */ }
  }, []);

  const loadImages = useCallback(async () => {
    setLoading(true);
    setSelectedImages(new Set()); // Reset selection when filtering changes
    try {
      if (!selectedProduct) {
        setImages(await productImageService.getAll());
      } else {
        setImages(await productImageService.getByProduct(selectedProduct));
      }
    } catch { 
      showToast("Gagal memuat gambar", "error"); 
    }
    setLoading(false);
  }, [selectedProduct]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadImages(); }, [loadImages]);

  // Handle selection
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

  // Upload/Edit actions
  const openUpload = () => {
    setIsEditMode(false);
    setEditingId(null);
    setUploadProduct(selectedProduct || "");
    setUploadOrder(images.length);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };
  
  const openEdit = (img: ProductImage) => {
    setIsEditMode(true);
    setEditingId(img.id);
    setUploadProduct(img.product_id);
    setUploadOrder(img.order);
    setPreviewUrl(`${API_HOST}${img.url}`);
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
    if (!uploadProduct) { showToast("Pilih produk", "error"); return; }
    
    const file = fileRef.current?.files?.[0];
    if (!isEditMode && !file) { showToast("Pilih file gambar", "error"); return; }
    
    setSaving(true);
    try {
      if (isEditMode && editingId) {
        await productImageService.update(editingId, file, uploadOrder);
        showToast("Gambar berhasil diupdate", "success");
      } else {
        if (!file) throw new Error("No file");
        await productImageService.create(uploadProduct, file, uploadOrder);
        showToast("Gambar berhasil diupload", "success");
      }
      setModalOpen(false);
      loadImages();
    } catch { 
      showToast(isEditMode ? "Gagal update gambar" : "Gagal upload gambar", "error"); 
    }
    setSaving(false);
  };

  // Delete actions
  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await productImageService.delete(deleting.id);
      showToast("Gambar berhasil dihapus", "success");
      setDeleting(null);
      loadImages();
    } catch { showToast("Gagal menghapus", "error"); }
    setSaving(false);
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    setSaving(true);
    try {
      // Execute deletions concurrently
      await Promise.all(
        Array.from(selectedImages).map(id => productImageService.delete(id))
      );
      showToast(`${selectedImages.size} gambar berhasil dihapus`, "success");
      setBulkDeleting(false);
      setSelectedImages(new Set());
      loadImages();
    } catch {
      showToast("Beberapa gambar mungkin gagal dihapus", "error");
      loadImages(); // Refresh anyway to see which ones survived
    }
    setSaving(false);
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || "Unknown Product";
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0 }}>Gambar Produk</h2>
            <select
              className="admin-form-select"
              style={{ width: "auto", minWidth: 200, padding: "6px 10px", fontSize: "0.8rem" }}
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">— Semua Produk —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {selectedImages.size > 0 && (
              <button className="admin-btn admin-btn-danger" onClick={() => setBulkDeleting(true)}>
                Hapus Terpilih ({selectedImages.size})
              </button>
            )}
            <button className="admin-btn admin-btn-primary" onClick={openUpload}>+ Upload Gambar</button>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-skeleton" style={{ height: 160, borderRadius: 12 }} />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="admin-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p>Belum ada gambar</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
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
                    style={{ cursor: "pointer", width: "100%", height: 140 }} 
                    onClick={() => setViewingImage(img)}
                    title="Klik untuk melihat"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${API_HOST}${img.url}`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "white" }}
                    />
                  </div>

                  {/* Actions & Info Footer */}
                  <div style={{ padding: "8px 12px", borderTop: "1px solid var(--admin-border)", background: "white" }}>
                    {!selectedProduct && (
                      <div style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {getProductName(img.product_id)}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text-secondary)", fontWeight: 500 }}>
                        Order: {img.order}
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          style={{ color: "#64748b", padding: 4 }}
                          onClick={() => openEdit(img)}
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
                          onClick={() => setDeleting(img)}
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditMode ? "Edit Gambar Produk" : "Upload Gambar Produk"}
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
          <label className="admin-form-label">Produk *</label>
          <select 
            className="admin-form-select" 
            value={uploadProduct} 
            onChange={(e) => setUploadProduct(e.target.value)}
            disabled={isEditMode}
            style={{ background: isEditMode ? "#f1f5f9" : undefined }}
          >
            <option value="">— Pilih Produk —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">File Gambar {isEditMode ? "(Opsional)" : "*"}</label>
          <input
            ref={fileRef}
            className="admin-form-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          <p className="admin-form-hint">
            Format: JPG, PNG, WebP {isEditMode && "— Kosongkan jika tidak ingin ganti gambar"}
          </p>
        </div>
        {previewUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)", background: "white" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "contain", display: "block" }} />
          </div>
        )}
        <div className="admin-form-group">
          <label className="admin-form-label">Order</label>
          <input className="admin-form-input" type="number" min={0} value={uploadOrder} onChange={(e) => setUploadOrder(Number(e.target.value))} />
          <p className="admin-form-hint">Urutan gambar (0 = pertama / thumbnail)</p>
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
            src={`${API_HOST}${viewingImage.url}`}
            alt="View"
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8, background: "white" }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
          />
        </div>
      )}

      {/* Single Delete Confirm */}
      <DeleteConfirm 
        isOpen={!!deleting} 
        onClose={() => setDeleting(null)} 
        onConfirm={handleDelete} 
        loading={saving} 
        itemName="gambar" 
      />
      
      {/* Bulk Delete Confirm */}
      <DeleteConfirm 
        isOpen={bulkDeleting} 
        onClose={() => setBulkDeleting(false)} 
        onConfirm={handleBulkDelete} 
        loading={saving} 
        itemName={`${selectedImages.size} gambar terpilih`} 
      />
    </>
  );
}
