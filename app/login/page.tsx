"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // لو المستخدم أصلاً مسجل دخول، نودّيه حسب دوره
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const isSeller = localStorage.getItem("isSeller") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token) {
      if (isAdmin) router.replace("/admin");
      else router.replace(isSeller ? "/my/listings" : "/my/inquiries");
    }
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password); // يرجع AuthResponse { token, isSeller, isAdmin, name }

      // نخزن البيانات في localStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("isSeller", res.isSeller ? "true" : "false");
      localStorage.setItem("isAdmin", res.isAdmin ? "true" : "false");
      localStorage.setItem("name", res.name || "");

      // نوجّه حسب الدور
      if (res.isAdmin) {
        router.replace("/admin");
      } else {
        router.replace(res.isSeller ? "/my/listings" : "/my/inquiries");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(252,240,210)] px-4">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Login
        </h1>

        {error && (
          <div className="mb-3 text-red-600 text-sm border border-red-200 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[#f5cd82] via-[#f2b564] to-[#e6a93a] text-gray-900 font-semibold px-4 py-2 mt-2 shadow hover:-translate-y-[1px] transition-all disabled:opacity-60"
          >
            {loading ? "جارٍ تسجيل الدخول..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
