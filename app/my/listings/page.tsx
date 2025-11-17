// app/my/listings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyListings, type Listing, deleteListing } from "@/lib/api";

export default function MyListingsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(t ?? "");
  }, []);

  useEffect(() => {
    if (token === undefined) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await getMyListings(token);
        setItems(data);
        setErr(null);
      } catch (e: any) {
        setErr(
          typeof e?.message === "string" ? e.message : "تعذر جلب إعلاناتك"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  // دالة حذف بموافقة المستخدم + optimistic UI
  async function handleDelete(id: string) {
    const ok = confirm(
      "هل أنت متأكد أنك تبي تحذف الإعلان؟ لا يمكن التراجع عن الحذف."
    );
    if (!ok) return;

    const previous = items;
    setItems((cur) => cur.filter((it) => it.id !== id));
    setDeletingId(id);

    try {
      if (!token) throw new Error("غير مسموح");
      await deleteListing(token, id);
    } catch (e: any) {
      setItems(previous);
      alert(typeof e?.message === "string" ? e.message : "فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  if (token === undefined) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold mb-4">إعلاناتي</h1>
        <div className="text-gray-500">جارٍ التحقق من الجلسة…</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold mb-4">إعلاناتي</h1>
        <div className="text-gray-500">جارٍ التحميل…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Adds</h1>
        <Link
          href="/listings/new"
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          + New Add
        </Link>
      </div>

      {err && <div className="text-red-600 mb-3">{err}</div>}

      {items.length === 0 ? (
        <div className="rounded-xl border p-6">You dont have any ads</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            // نفس معالجة الصورة زي الهوم بيج
            const rawSrc = item.imageUrls?.[0] ?? "/placeholder.png";
            const imgSrc = rawSrc.startsWith("http://localhost:8080")
              ? rawSrc.replace("http://localhost:8080", "")
              : rawSrc;

            return (
              <div
                key={item.id}
                className="rounded-2xl border bg-white overflow-hidden relative"
              >
                <img
                  src={imgSrc}
                  alt={item.title}
                  className="w-full h-40 object-contain bg-gray-100"
                />
                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-lg">{item.title}</h2>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.desc}
                  </p>

                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div>
                      Price:{" "}
                      <span className="font-medium">{item.price}</span>
                    </div>
                    <div>
                      Min to order:{" "}
                      <span className="font-medium">
                        {item.minOrderQty}
                      </span>
                    </div>
                    <div>
                      Stock:{" "}
                      <span className="font-medium">{item.stock}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <Link
                      href={`/listings/${item.id}`}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Details
                    </Link>

                    <Link
                      href={`/listings/${item.id}/edit`}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 bg-red-50 text-red-700"
                    >
                      {deletingId === item.id ? "Delete..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
