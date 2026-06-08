"use client";
import React from "react";
import type { PaginationMeta } from "@/types/admin";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.limit === 0 || meta.total_pages <= 1) return null;

  const { page, total_pages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | "...")[] = [];
  if (total_pages <= 7) {
    for (let i = 1; i <= total_pages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(total_pages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < total_pages - 2) pages.push("...");
    pages.push(total_pages);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 0", flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 13, color: "var(--admin-text-secondary)" }}>
        {from}–{to} dari {total} data
      </span>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          className="admin-btn admin-btn-ghost admin-btn-icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          title="Sebelumnya"
          style={{ padding: "4px 8px", fontSize: 14 }}
        >
          ‹
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} style={{ padding: "4px 8px", fontSize: 14, color: "var(--admin-text-secondary)" }}>…</span>
          ) : (
            <button
              key={p}
              className={`admin-btn ${p === page ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => onPageChange(p as number)}
              style={{ padding: "4px 10px", fontSize: 13, minWidth: 32 }}
            >
              {p}
            </button>
          )
        )}
        <button
          className="admin-btn admin-btn-ghost admin-btn-icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          title="Berikutnya"
          style={{ padding: "4px 8px", fontSize: 14 }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
