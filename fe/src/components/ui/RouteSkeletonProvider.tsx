"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import PageLoader from "./PageLoader";

const MIN_VISIBLE_MS = 450;
const MAX_VISIBLE_MS = 1400;

function isAdminPath(pathname: string | null) {
  return pathname === "/admin" || pathname?.startsWith("/admin/");
}

function isInternalPublicLink(anchor: HTMLAnchorElement) {
  if (!anchor.href || anchor.target || anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin) return false;
  if (isAdminPath(url.pathname)) return false;

  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export default function RouteSkeletonProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = isAdminPath(pathname);
  const [visible, setVisible] = useState(() => !isAdmin);
  const shownAtRef = useRef(Date.now());

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }

    shownAtRef.current = Date.now();
    setVisible(true);
  }, [isAdmin, pathname]);

  useEffect(() => {
    if (!visible || isAdmin) return;

    const elapsed = Date.now() - shownAtRef.current;
    const delay = Math.max(MIN_VISIBLE_MS - elapsed, 0);
    const hideTimer = window.setTimeout(() => setVisible(false), delay);
    const fallbackTimer = window.setTimeout(() => setVisible(false), MAX_VISIBLE_MS);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [visible, isAdmin, pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || !isInternalPublicLink(anchor as HTMLAnchorElement)) return;

      shownAtRef.current = Date.now();
      setVisible(true);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <PageLoader visible={visible} pathname={pathname}>
      {children}
    </PageLoader>
  );
}
