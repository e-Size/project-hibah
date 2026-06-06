"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DeleteConfirm from "@/components/admin/DeleteConfirm";
import Modal from "@/components/admin/Modal";
import { showToast } from "@/components/admin/Toast";
import { productService, sizeGuideService } from "@/services/admin-service";
import type { ProductListItem, SizeGuide } from "@/types/admin";

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "https://api.esize.id";

export default function SizeGuidesPage() {
  const [guides, setGuides] = useState<SizeGuide[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [editing, setEditing] = useState<SizeGuide | null>(null);
  const [deleting, setDeleting] = useState<SizeGuide | null>(null);
  const [viewing, setViewing] = useState<SizeGuide | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [guideData, productData] = await Promise.all([
        sizeGuideService.getAll(),
        productService.getAll(),
      ]);
      setGuides(guideData);
      setProducts(productData);
    } catch {
      showToast("Gagal memuat size guide", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableProducts = products.filter(
    (product) => !guides.some((guide) => guide.product_id === product.id) || product.id === editing?.product_id
  );

  const openCreate = () => {
    setEditing(null);
    setSelectedProduct("");
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const openEdit = (guide: SizeGuide) => {
    setEditing(guide);
    setSelectedProduct(guide.product_id);
    setPreviewUrl(`${API_HOST}${guide.image_url}`);
    if (fileRef.current) fileRef.current.value = "";
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSelectedProduct("");
    setPreviewUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const file = fileRef.current?.files?.[0];
    if (!selectedProduct) {
      showToast("Pilih produk", "error");
      return;
    }
    if (!file) {
      showToast(editing ? "Pilih gambar pengganti" : "Pilih gambar size guide", "error");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await sizeGuideService.update(editing.id, file);
        showToast("Size guide berhasil diganti", "success");
      } else {
        await sizeGuideService.create(selectedProduct, file);
        showToast("Size guide berhasil ditambahkan", "success");
      }
      closeModal();
      await loadData();
    } catch {
      showToast("Gagal menyimpan size guide", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await sizeGuideService.delete(deleting.id);
      showToast("Size guide berhasil dihapus", "success");
      setDeleting(null);
      await loadData();
    } catch {
      showToast("Gagal menghapus size guide", "error");
    } finally {
      setSaving(false);
    }
  };

  const productName = (productId: string) =>
    products.find((product) => product.id === productId)?.name ?? "Unknown Product";

  return (
    <>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Size Guide</h2>
            <p style={{ margin: "4px 0 0", color: "var(--admin-text-secondary)", fontSize: 14 }}>
              Satu gambar panduan ukuran untuk setiap produk editor
            </p>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openCreate} disabled={availableProducts.length === 0}>
            + Upload Size Guide
          </button>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-skeleton" style={{ height: 180, borderRadius: 12 }} />
          ) : guides.length === 0 ? (
            <div className="admin-empty">Belum ada size guide</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {guides.map((guide) => (
                <div key={guide.id} style={{ border: "1px solid var(--admin-border)", borderRadius: 12, overflow: "hidden", background: "white" }}>
                  <button
                    type="button"
                    onClick={() => setViewing(guide)}
                    style={{ display: "block", width: "100%", height: 180, padding: 0, border: 0, cursor: "pointer", background: "#f8fafc" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${API_HOST}${guide.image_url}`} alt={productName(guide.product_id)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                  <div style={{ padding: 12 }}>
                    <strong style={{ display: "block", marginBottom: 10 }}>{productName(guide.product_id)}</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="admin-btn admin-btn-secondary" onClick={() => openEdit(guide)}>Ganti</button>
                      <button className="admin-btn admin-btn-danger" onClick={() => setDeleting(guide)}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? "Ganti Size Guide" : "Upload Size Guide"}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Batal</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </>
        }
      >
        <div className="admin-form-group">
          <label className="admin-form-label">Produk *</label>
          <select className="admin-form-select" value={selectedProduct} onChange={(event) => setSelectedProduct(event.target.value)} disabled={Boolean(editing)}>
            <option value="">— Pilih Produk —</option>
            {availableProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">Gambar Size Guide *</label>
          <input ref={fileRef} className="admin-form-input" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
          <p className="admin-form-hint">Format: JPG, PNG, atau WebP</p>
        </div>
        {previewUrl && (
          <div style={{ border: "1px solid var(--admin-border)", borderRadius: 8, overflow: "hidden", background: "white" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview size guide" style={{ width: "100%", maxHeight: 360, objectFit: "contain", display: "block" }} />
          </div>
        )}
      </Modal>

      {viewing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }} onClick={() => setViewing(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${API_HOST}${viewing.image_url}`} alt="Size guide" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "white", borderRadius: 8 }} onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      <DeleteConfirm
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={saving}
        itemName={`size guide ${deleting ? productName(deleting.product_id) : ""}`}
      />
    </>
  );
}
