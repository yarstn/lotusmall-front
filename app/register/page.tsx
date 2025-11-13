"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  // أساسيات
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);

  // الحقول الجديدة للبائع
  const [fromVietnam, setFromVietnam] = useState<boolean | null>(null);
  const [country, setCountry] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // تحققات بسيطة
    if (isSeller) {
      if (fromVietnam === null) {
        setError("Please choose whether your products are from Vietnam.");
        return;
      }
      if (fromVietnam === false && !country.trim()) {
        setError("Please enter your products' origin country.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        name,
        email,
        phone,
        password,
        isSeller,
      };

      if (isSeller) {
        payload.fromVietnam = fromVietnam!;
        if (fromVietnam === false) {
          payload.country = country.trim();
        }
      }

      const { token, isSeller: sellerFlag, isAdmin, name: profileName } = await register(payload);

    
        localStorage.setItem("token", token ?? "");
        localStorage.setItem("isSeller", sellerFlag ? "true" : "false");
        localStorage.setItem("isAdmin",  isAdmin    ? "true" : "false");
        localStorage.setItem("name",     profileName ?? "");
      if (isAdmin) {
        router.replace("/admin");                 // ✅ الأدمن مباشرة
      } else {
        router.replace(sellerFlag ? "/my/listings" : "/my/inquiries");
      }
    } catch (err: any) {
      setError(err?.message || "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto" dir="rtl">
      <h1 className="text-2xl font-semibold mb-4">New Account</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="w-full rounded-lg border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-lg border p-2"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full rounded-lg border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isSeller}
            onChange={(e) => {
              setIsSeller(e.target.checked);
              // إعادة ضبط الحقول عند تغيير الدور
              setFromVietnam(null);
              setCountry("");
            }}
          />
          Seller?
        </label>

        {/* حقول المنشأ تظهر فقط للبائع */}
        {isSeller && (
          <div className="mt-3 rounded-lg border p-3 bg-white">
            <p className="text-sm font-medium mb-2">Are your products from Vietnam?</p>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="vn-origin"
                  checked={fromVietnam === true}
                  onChange={() => setFromVietnam(true)}
                />
                Yes
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="vn-origin"
                  checked={fromVietnam === false}
                  onChange={() => setFromVietnam(false)}
                />
                No
              </label>
            </div>

            {fromVietnam === false && (
              <div className="mt-3">
                <input
                  className="w-full rounded-lg border p-2"
                  placeholder="اكتب الدولة (مثال: China / Turkey / UAE ...)"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <button
          disabled={loading}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </form>
    </div>
  );
}
