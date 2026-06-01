"use client";
import React from "react";
import Modal from "./Modal";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}

export default function DeleteConfirm({ isOpen, onClose, onConfirm, loading, itemName }: DeleteConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus"
      footer={
        <>
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading} type="button">
            Batal
          </button>
          <button className="admin-btn admin-btn-danger" onClick={onConfirm} disabled={loading} type="button">
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </>
      }
    >
      <div className="admin-confirm-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="admin-confirm-text">
        <h4>Hapus {itemName || "item"} ini?</h4>
        <p>Data yang sudah dihapus tidak bisa dikembalikan.</p>
      </div>
    </Modal>
  );
}
