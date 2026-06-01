"use client";
import React, { useState } from "react";
import "../../styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import ToastContainer from "@/components/admin/Toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-content">
        <div className="admin-topbar">
          <button
            className="admin-mobile-toggle"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
          <h1>Admin Panel</h1>
          <div />
        </div>
        <main className="admin-main">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
