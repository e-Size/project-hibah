const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.esize.id/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Token storage ────────────────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem("access_token", accessToken);
  if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ─── Token refresh ────────────────────────────────────────

// Single in-flight refresh — all concurrent callers share the same promise.
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json() as { access_token: string };
    setTokens(data.access_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ─── Auth headers ─────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Core request ─────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const makeRequest = (token: string | null) =>
    fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      ...init,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

  let res = await makeRequest(getAccessToken());

  // On 401 try a single refresh then retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/admin/login";
      throw new ApiError("Session expired", 401);
    }
    res = await makeRequest(newToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(body.error || `HTTP ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

// ─── Public helpers ───────────────────────────────────────

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: "POST", body: form });
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPutForm<T>(path: string, form: FormData): Promise<T> {
  return request<T>(path, { method: "PUT", body: form });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

// ─── Auth-specific helpers used by layout ─────────────────

export async function verifySession(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) {
    // No access token — try refresh
    const newToken = await refreshAccessToken();
    if (!newToken) return false;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` },
    });
    if (res.ok) return true;

    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return false;
      const retry = await fetch(`${API_BASE}/auth/verify`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      return retry.ok;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logoutRequest(): Promise<void> {
  const token = getAccessToken();
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearTokens();
}

export { authHeaders };
