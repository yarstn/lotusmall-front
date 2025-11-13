"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, updateMe, deleteMe, type Me } from "@/lib/api";

export default function AccountPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // figure out role label
  const roleLabel = useMemo(() => (isSeller ? "Seller" : "Account"), [isSeller]);

  // Auth gate + fetch profile
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);

    (async () => {
      try {
        const profile = await getMe(t);
        setMe(profile);
        setIsSeller(!!profile.isSeller);
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        // حافظي أيضاً على isSeller في التخزين المحلي لو تحتاجينه في الهيدر
        localStorage.setItem("isSeller", String(!!profile.isSeller));
        localStorage.setItem("name", profile.name || "");
      } catch (e: any) {
        setError(e?.message || "Failed to load account.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setError(null);
    setOk(null);
    setSaving(true);
    try {
      const updated = await updateMe(token, {
        name,
        email,
        phone,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword || undefined,
      });
      setMe(updated);
      setIsSeller(!!updated.isSeller);
      setOk("Saved successfully.");
      localStorage.setItem("name", updated.name || "");
      localStorage.setItem("isSeller", String(!!updated.isSeller));
    } catch (e: any) {
      // السيرفر يرجع "Email already in use" عند تعارض الإيميل
      setError(e?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function onDelete() {
    if (!token) return;
    const yes = window.confirm(
      "This will permanently delete your account and all related data. Are you sure?"
    );
    if (!yes) return;

    setError(null);
    setOk(null);
    setSaving(true);
    try {
      await deleteMe(token);
      localStorage.removeItem("token");
      localStorage.removeItem("isSeller");
      localStorage.removeItem("name");
      localStorage.removeItem("userId");
      router.replace("/register");
    } catch (e: any) {
      setError(e?.message || "Failed to delete account.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-gray-500">
        Loading account…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-red-600">
        {error || "No data."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">{roleLabel} Settings</h1>
        <span className="rounded-full bg-gray-100 text-gray-700 text-xs px-2 py-1">
          {isSeller ? "Seller" : "Buyer"}
        </span>
      </div>

      {/* تنبيه بسيط يخص البائعين */}
      {isSeller && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          Tip: As a seller, changes here will reflect on your ads and how buyers contact you.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}
      {ok && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          {ok}
        </div>
      )}

      <form onSubmit={onSave} className="space-y-6">
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
          <h2 className="font-semibold">Basic Info</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                className="w-full rounded-lg border p-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border p-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              className="w-full rounded-lg border p-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
          <h2 className="font-semibold">Change Password (optional)</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Current password</label>
              <input
                type="password"
                className="w-full rounded-lg border p-3"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">New password</label>
              <input
                type="password"
                className="w-full rounded-lg border p-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New strong password"
              />
              <p className="text-xs text-gray-500 mt-1">
                To change password, fill both current and new fields.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="rounded-lg border border-red-300 text-red-700 px-4 py-2 hover:bg-red-50 disabled:opacity-50"
            >
              Delete account
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black text-white px-5 py-2 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
