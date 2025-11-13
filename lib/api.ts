// lib/api.ts
// --------------------------------------
// Base + helpers
// --------------------------------------
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/+$/, ""); // remove trailing slashes


function buildUrl(endpoint: string) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE}${path}`;
}

const DEFAULT_TIMEOUT = 20;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { timeoutSec?: number }
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    (options?.timeoutSec ?? DEFAULT_TIMEOUT) * 1000
  );

  let res: Response;
  try {
    res = await fetch(buildUrl(endpoint), {
      mode: "cors",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") throw new Error("انتهت المهلة: السيرفر لم يستجب");
    throw new Error("تعذّر الاتصال بالسيرفر (Failed to fetch)");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let reason = "";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        reason = (data as any)?.reason || (data as any)?.message || JSON.stringify(data);
      } else {
        reason = await res.text();
      }
    } catch {}
    throw new Error(reason || `API error: ${res.status}`);
  }

  const raw = await res.text();
  if (!raw) return null as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

// --------------------------------------
// Auth
// --------------------------------------
export type AuthResponse = {
  token: string;
  isSeller: boolean;
  isAdmin: boolean;   // ✅ جديد
  name: string;
};

export async function register(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  isSeller?: boolean;
  fromVietnam?: boolean;   // جديد
  country?: string;        // جديد (يُرسل فقط إذا fromVietnam === false)
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// --------------------------------------
// Listings
// --------------------------------------
export type Listing = {
  id: string;
  title: string;
  desc: string;
  price: number;
  minOrderQty: number;
  stock: number;
  imageUrls: string[];
  category?: string;        // 👈 أضفناها هنا
  compareAtPrice?: number;  // 👈 أضيفي هذه
  seller?: { id: string };
};

export type CreateListingInput = {
  title: string;
  desc: string;
  price: number;
  minOrderQty: number;
  stock: number;
  imageUrls: string[];
};

export async function getMyListings(token: string): Promise<Listing[]> {
  return apiFetch<Listing[]>("/my/listings", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getListingById(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/listings/${id}`);
}

export async function createListing(input: CreateListingInput, token: string): Promise<Listing> {
  return apiFetch<Listing>("/listings", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

// --------------------------------------
// JWT helpers
// --------------------------------------
function base64UrlDecode(input: string): string {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad) s += "=".repeat(4 - pad);

  try {
    if (typeof atob === "function") return atob(s);
  } catch {}
  try {
    // Node.js fallback (SSR)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof Buffer !== "undefined") return Buffer.from(s, "base64").toString("binary");
  } catch {}
  return s; // last-resort fallback
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// --------------------------------------
// Inquiries
// --------------------------------------
export type Inquiry = {
  id: string;
  listing?: { id: string };
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  quantity: number;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInquiryInput = {
  listingID: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  quantity: number;
  message?: string;
};

export async function createInquiry(input: CreateInquiryInput, token?: string): Promise<Inquiry> {
  return apiFetch<Inquiry>("/inquiries", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(input),
  });
}

export async function getMyInquiries(token: string): Promise<Inquiry[]> {
  return apiFetch<Inquiry[]>("/inquiries/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --------------------------------------
// Upload (multipart/form-data)
// --------------------------------------
/**
 * يرفع صورة لـ POST /api/v1/upload ويُرجع رابطًا عامًا.
 * ملاحظة: لا تضيف Content-Type مع FormData؛ المتصفح يحدد boundary تلقائيًا.
 */
export async function uploadImage(file: File, token?: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file); // يجب أن يكون اسم الحقل "file" في Vapor

  const res = await fetch(buildUrl("/upload"), {
    method: "POST",
    body: fd,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  // لو رجع HTML هذا يعني إن المسار غلط أو Request وقع على Next بدل السيرفر
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/html")) {
    const html = await res.text();
    console.error("Upload returned HTML (wrong endpoint):", html.slice(0, 200));
    throw new Error("Upload endpoint returned HTML. Check NEXT_PUBLIC_API_URL and server route.");
  }

  if (!res.ok) {
    let reason = "";
    try {
      reason = ct.includes("application/json") ? JSON.stringify(await res.json()) : await res.text();
    } catch {}
    throw new Error(reason || `Upload failed: ${res.status}`);
  }

  const data = (await res.json()) as { url: string };
  if (!data?.url) throw new Error("Upload response missing url");
  return data.url;
}

// ===== Profile APIs =====
export type Me = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isSeller: boolean;
  isAdmin: boolean; // ✅ جديد
};

export async function getMe(token: string): Promise<Me> {
  const r = await fetch(buildUrl("/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Failed to load profile");
  return r.json();
}
export async function updateMe(
  token: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<Me> {
  return apiFetch<Me>("/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function deleteMe(token: string): Promise<void> {
  await apiFetch<void>("/me", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --------------------------------------
// Delete Listing
// --------------------------------------
export async function deleteListing(token: string, listingId: string): Promise<void> {
  try {
    await apiFetch<void>(`/listings/${listingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    throw new Error(err?.message || "فشل حذف الإعلان");
  }
}

// Update Listing (PATCH)
export async function updateListing(
  id: string,
  data: Partial<CreateListingInput>,
  token: string
): Promise<Listing> {
  return apiFetch<Listing>(`/listings/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function getListings(params?: { origin?: string; originCountry?: string }): Promise<Listing[]> {
  // ندعم كلا الاسمين ونتحوّل للباكند بـ originCountry
  const key = (params?.originCountry ?? params?.origin)?.trim();
  const qs = key ? `?originCountry=${encodeURIComponent(key)}` : "";
  return apiFetch<Listing[]>(`/listings${qs}`);
}
// ===== Admin APIs =====
export async function getAdminStats(token: string): Promise<{ users: number; sellers: number; listings: number; }> {
  return apiFetch("/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
}


// ===== Admin Types =====
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  isSeller: boolean;
  isAdmin: boolean;
  listingsCount: number;
  createdAt?: string;
};

export async function getAdminUsers(
  token: string,
  opts: { role: "all" | "seller" | "buyer"; search?: string; page?: number; limit?: number }
): Promise<AdminUserRow[]> {
  const q = new URLSearchParams({
    role: opts.role,
    search: opts.search ?? "",
    page: String(opts.page ?? 1),
    limit: String(opts.limit ?? 50),
  });
  return apiFetch(`/admin/users?${q.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
}


export async function adminDeleteUser(token: string, userId: string): Promise<void> {
  await apiFetch<void>(`/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminDeleteSellerListings(token: string, userId: string): Promise<void> {
  await apiFetch<void>(`/admin/users/${encodeURIComponent(userId)}/listings`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
// NEW: toggle admin
export async function setUserAdmin(token: string, userId: string, isAdmin: boolean): Promise<void> {
  await apiFetch<void>(`/admin/users/${encodeURIComponent(userId)}/admin`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isAdmin }),
  });
}

// NEW: create admin user
export async function createAdminUser(
  token: string,
  data: { name: string; email: string; phone: string; password: string }
): Promise<AdminUserRow> {
  return apiFetch<AdminUserRow>("/admin/users/admin", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

// ------------------------------
// Contact
// ------------------------------
export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
};

export type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  status: "new" | "responded";
  respondedBy?: string | null;
  createdAt?: string;
};

export async function sendContact(data: ContactInput): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Admin contacts
export async function adminGetContacts(
  token: string,
  opts?: { status?: "all" | "new" | "responded" }
): Promise<ContactRow[]> {
  const qs = opts?.status ? `?status=${encodeURIComponent(opts.status)}` : "";
  return apiFetch<ContactRow[]>(`/admin/contacts${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminRespondContact(
  token: string,
  id: string,
  respondedBy: string
): Promise<void> {
  await apiFetch<void>(`/admin/contacts/${encodeURIComponent(id)}/respond`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ respondedBy }),
  });
}
// تحت قسم APIs الأخرى
export async function createContact(data: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
}): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ===== News =====
export type NewsItem = {
  id: string;
  titleEn: string;
  titleVi: string;
  coverURL?: string;
  location?: string;
  bodyEn?: string;
  bodyVi?: string;
  eventDate?: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getNews(): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/news");
}

// Admin
export async function adminGetNews(token: string): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>("/admin/news", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function adminCreateNews(token: string, data: Omit<NewsItem,"id"|"createdAt"|"updatedAt">) {
  return apiFetch<NewsItem>("/admin/news", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}
export async function adminUpdateNews(token: string, id: string, data: Omit<NewsItem,"id"|"createdAt"|"updatedAt">) {
  return apiFetch<NewsItem>(`/admin/news/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}
export async function adminDeleteNews(token: string, id: string) {
  await apiFetch<void>(`/admin/news/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

