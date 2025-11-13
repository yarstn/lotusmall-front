// app/admin/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  getAdminStats,
  getAdminUsers,
  adminDeleteUser,
  adminDeleteSellerListings,
  setUserAdmin,
  createAdminUser,
  type AdminUserRow,
} from "@/lib/api";

type Stats = { users: number; sellers: number; listings: number };

function ConfirmDialog({
  open,
  message,
  onCancel,
  onOK,
}: { open: boolean; message: string; onCancel: () => void; onOK: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onOK} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
            Yes, confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const OWNER_EMAIL = "yaraalfawaz@gmail.com";
    // داخل AdminPage
    const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const initialTab = (search?.get("tab") ?? "users") as "users" | "contacts";
    // ثم استخدم initialTab لتحديد التبويب الافتراضي

  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | "seller" | "buyer">("all");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const pendingAction = useRef<null | (() => Promise<void>)>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPass, setNewPass] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (!t) window.location.href = "/login?next=/admin";
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const s = await getAdminStats(token);
        setStats(s);
        const list = await getAdminUsers(token, { role, search: query, page: 1, limit: 50 });
        setRows(list);
      } catch (e: any) {
        setErr(e?.message || "Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, role, query]);

  function ask(message: string, action: () => Promise<void>) {
    setConfirmMsg(message);
    pendingAction.current = action;
    setConfirmOpen(true);
  }
  async function onConfirmOK() {
    setConfirmOpen(false);
    const act = pendingAction.current;
    pendingAction.current = null;
    if (!act) return;
    try { await act(); } catch (e: any) { alert(e?.message || "Operation failed."); }
  }
  function onConfirmCancel() { pendingAction.current = null; setConfirmOpen(false); }

  function handleDeleteUser(id: string) {
    if (!token) return;
    const removedUser = rows.find((x) => x.id === id);
    ask("Delete this user and all their listings?", async () => {
      await adminDeleteUser(token, id);
      setRows((r) => r.filter((x) => x.id !== id));
      setStats((s) =>
        s
          ? {
              ...s,
              users: s.users - 1,
              sellers: s.sellers - (removedUser?.isSeller ? 1 : 0),
              listings: Math.max(0, s.listings - (removedUser?.listingsCount || 0)),
            }
          : s
      );
    });
  }

  function handleDeleteListings(id: string) {
    if (!token) return;
    const count = rows.find((x) => x.id === id)?.listingsCount || 0;
    ask("Delete ALL listings of this seller?", async () => {
      await adminDeleteSellerListings(token, id);
      setRows((r) => r.map((x) => (x.id === id ? { ...x, listingsCount: 0 } : x)));
      setStats((s) => (s ? { ...s, listings: Math.max(0, s.listings - count) } : s));
    });
  }

  async function toggleAdmin(u: AdminUserRow) {
    if (!token) return;
    const target = !u.isAdmin;
    ask(`${target ? "Make" : "Remove"} admin for ${u.email}?`, async () => {
      await setUserAdmin(token, u.id, target);
      setRows((r) => r.map((x) => (x.id === u.id ? { ...x, isAdmin: target } : x)));
    });
  }

  async function onCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    try {
      const newUser = await createAdminUser(token, {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        password: newPass,
      });
      setRows((r) => [newUser, ...r]);
      setStats((s) => (s ? { ...s, users: s.users + 1 } : s));
      setNewName(""); setNewEmail(""); setNewPhone(""); setNewPass("");
      alert("Admin created successfully.");
    } catch (e: any) {
      alert(e?.message || "Failed to create admin.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {err && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">{err}</div>}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white p-4 shadow ring-1 ring-gray-100">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-bold">{stats.users}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow ring-1 ring-gray-100">
            <div className="text-sm text-gray-500">Sellers</div>
            <div className="text-2xl font-bold">{stats.sellers}</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow ring-1 ring-gray-100">
            <div className="text-sm text-gray-500">Listings</div>
            <div className="text-2xl font-bold">{stats.listings}</div>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl bg-white p-5 shadow ring-1 ring-gray-100">
        <h2 className="text-lg font-semibold mb-3">Create Admin</h2>
        <form onSubmit={onCreateAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="rounded border p-2" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <input type="email" className="rounded border p-2" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <input className="rounded border p-2" placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
          <input type="password" className="rounded border p-2" placeholder="Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
          <div className="sm:col-span-2">
            <button disabled={creating} className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50">
              {creating ? "Creating…" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          className="rounded border border-gray-300 px-3 py-2 w-full sm:w-80"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded border border-gray-300 px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="seller">Sellers</option>
          <option value="buyer">Buyers</option>
        </select>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-center p-3">Seller</th>
                <th className="text-center p-3">Admin</th>
                <th className="text-center p-3">Listings</th>
                <th className="text-left p-3">Created</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isOwnerRow = u.email.toLowerCase() === OWNER_EMAIL;
                return (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">
                      {isOwnerRow ? (
                        <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">{u.email}</span>
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="p-3 text-center">{u.isSeller ? "Yes" : "No"}</td>
                    <td className="p-3 text-center">
                      {isOwnerRow ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 text-pink-700 px-2 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-pink-600" />
                          owner
                        </span>
                      ) : u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          admin
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">{u.listingsCount}</td>
                    <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>
                    <td className="p-3 text-right space-x-2">
                        {!(u.email === "yaraalfawaz@gmail.com" && u.isAdmin) && (
                          <button
                            onClick={() => toggleAdmin(u)}
                            className={`rounded px-3 py-1 text-white ${
                              u.isAdmin
                                ? "bg-slate-600 hover:bg-slate-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                          >
                            {u.isAdmin ? "Remove Admin" : "Make Admin"}
                          </button>
                        )}

                      {u.isSeller && u.listingsCount > 0 && (
                        <button
                          onClick={() => handleDeleteListings(u.id)}
                          className="rounded bg-yellow-500 text-white px-3 py-1 hover:bg-yellow-600"
                        >
                          Delete Listings
                        </button>
                      )}
                        {u.email !== "yaraalfawaz@gmail.com" && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded bg-red-600 text-white px-3 py-1 hover:bg-red-700"
                          >
                            Delete User
                          </button>
                        )}

                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={7}>No users.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={confirmOpen} message={confirmMsg} onCancel={onConfirmCancel} onOK={onConfirmOK} />
    </div>
  );
}
