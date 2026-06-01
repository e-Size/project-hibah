"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Modal from "@/components/admin/Modal";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import { showToast } from "@/components/admin/Toast";
import { productImageService, productService } from "@/services/admin-service";
import type { ProductImage, ProductListItem } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

export default function ProductImagesPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<ProductImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProduct, setUploadProduct] = useState("");
  const [uploadOrder, setUploadOrder] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadProducts = useCallback(async () => {
    try { setProducts(await productService.getAll()); } catch { /* noop */ }
  }, []);

  const loadImages = useCallback(async () => {
    if (!selectedProduct) { setImages([]); setLoading(false); return; }
    setLoading(true);
    try { setImages(await productImageService.getByProduct(selectedProduct)); } catch { showToast("Gagal memuat gambar", "error"); }
    setLoading(false);
  }, [selectedProduct]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadImages(); }, [loadImages]);

  const openUpload = () => {
    setUploadProduct(selectedProduct || "");
    setUploadOrder(images.length);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!uploadProduct) { showToast("Pilih produk", "error"); return; }
    const file = fileRef.current?.files?.[0];
    if (!file) { showToast("Pilih file gambar", "error"); return; }
    setSaving(true);
    try {
      await productImageService.create(uploadProduct, file, uploadOrder);
      showToast("Gambar berhasil diupload", "success");
      setModalOpen(false);
      if (selectedProduct === uploadProduct) loadImages();
      else setSelectedProduct(uploadProduct);
    } catch { showToast("Gagal upload", "error"); }
    setSaving(false);
  };

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
              <option value="">— Pilih Produk —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openUpload}>+ Upload Gambar</button>
        </div>
        <div className="admin-card-body">
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-skeleton" style={{ height: 160, borderRadius: 12 }} />
              ))}
            </div>
          ) : !selectedProduct ? (
            <div className="admin-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p>Pilih produk untuk melihat gambar</p>
            </div>
          ) : images.length === 0 ? (
            <div className="admin-empty">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p>Belum ada gambar untuk produk ini</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
              {images.map((img) => (
                <div key={img.id} style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid var(--admin-border)", background: "#f8fafc" }}>
                  <img
                    src={`${API_HOST}${img.url}`}
                    alt=""
                    style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-text-secondary)" }}>Order: {img.order}</span>
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-icon"
                      style={{ color: "var(--admin-danger)" }}
                      onClick={() => setDeleting(img)}
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload Gambar Produk"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)} type="button">Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleUpload} disabled={saving} type="button">
              {saving ? "Mengupload..." : "Upload"}
            </button>
          </>
        }
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Produk *</label>
          <select className="admin-form-select" value={uploadProduct} onChange={(e) => setUploadProduct(e.target.value)}>
            <option value="">— Pilih Produk —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">File Gambar *</label>
          <input
            ref={fileRef}
            className="admin-form-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          <p className="admin-form-hint">Format: JPG, PNG, WebP</p>
        </div>
        {previewUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", border: "1px solid var(--admin-border)" }}>
            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
          </div>
        )}
        <div className="admin-form-group">
          <label className="admin-form-label">Order</label>
          <input className="admin-form-input" type="number" min={0} value={uploadOrder} onChange={(e) => setUploadOrder(Number(e.target.value))} />
          <p className="admin-form-hint">Urutan gambar (0 = pertama / thumbnail)</p>
        </div>
      </Modal>

      <DeleteConfirm isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} loading={saving} itemName="gambar" />
    </>
  );
}
