"use client";
import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import "../../styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import ToastContainer from "@/components/admin/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.esize.id/api";

interface AuthContextType {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ logout: () => {} });
export const useAuth = () => useContext(AuthContext);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  const verify = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setAuthed(false);
      setChecking(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: token },
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        localStorage.removeItem("admin_token");
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    verify();
  }, [verify, pathname]);

  const logout = useCallback(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: token },
      }).catch(() => {});
    }
    localStorage.removeItem("admin_token");
    setAuthed(false);
    router.replace("/admin/login");
  }, [router]);

  // Still checking auth status
  if (checking) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div className="login-spinner" />
        </div>
      </div>
    );
  }

  // Not authed & not on login page → show login page
  if (!authed && !isLoginPage) {
    router.replace("/admin/login");
    return (
      <div className="login-page">
        <div className="login-card" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div className="login-spinner" />
        </div>
      </div>
    );
  }

  // On login page (either authed or not) → render children directly (no sidebar)
  if (isLoginPage) {
    return (
      <AuthContext.Provider value={{ logout }}>
        {children}
        <ToastContainer />
      </AuthContext.Provider>
    );
  }

  // Authed & not login page → full admin layout
  return (
    <AuthContext.Provider value={{ logout }}>
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
            <button
              className="admin-btn admin-btn-ghost"
              onClick={logout}
              title="Logout"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 001.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
              </svg>
              Logout
            </button>
          </div>
          <main className="admin-main">{children}</main>
        </div>
        <ToastContainer />
      </div>
    </AuthContext.Provider>
  );
}
