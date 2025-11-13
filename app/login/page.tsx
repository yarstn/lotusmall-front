"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // نضمن تنظيف القيم
      const payloadEmail = email.trim().toLowerCase();
      const payloadPassword = password;

      // ننده الـ API الموحّد
      const { token, isSeller, isAdmin, name } = await login(
        payloadEmail,
        payloadPassword
      );

      // تخزين القيم الصحيحة في localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("isSeller", isSeller ? "true" : "false");
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      localStorage.setItem("name", name || "");

      // لو فيه next= بالـ URL نوجّه له
      const next = search.get("next");
      if (next) {
        router.replace(next);
        return;
      }

      // توجيه حسب الدور
      if (isAdmin) {
        router.replace("/admin");
      } else if (isSeller) {
        router.replace("/my/listings");
      } else {
        router.replace("/my/inquiries");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      {error && (
        <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
