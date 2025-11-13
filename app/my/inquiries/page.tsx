"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyInquiries } from "@/lib/api";

// الشكل الذي نعرضه في الواجهة
type Inquiry = {
  id: string;
  listingTitle?: string;
  quantity?: number;
  message?: string;
  createdAt?: string;
  status?: string;
};

// محاولة ذكية لاستخراج عنوان الإعلان من أشكال مختلفة
function extractListingTitle(x: any): string | undefined {
  return (
    x?.listingTitle ??
    x?.listing?.title ??
    x?.title ??
    undefined
  );
}

// نحول أي عنصر غير مضبوط إلى شكل Inquiry موحد
function normalizeInquiry(x: any, idx: number): Inquiry {
  const id =
    typeof x?.id === "string"
      ? x.id
      : x?.id != null
      ? String(x.id)
      : `tmp-${idx}`;

  return {
    id,
    listingTitle: extractListingTitle(x),
    quantity:
      typeof x?.quantity === "number"
        ? x.quantity
        : Number.isFinite(Number(x?.quantity))
        ? Number(x.quantity)
        : undefined,
    message: typeof x?.message === "string" ? x.message : undefined,
    createdAt:
      typeof x?.createdAt === "string" ? x.createdAt : undefined,
    status: typeof x?.status === "string" ? x.status : undefined,
  };
}

export default function MyInquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/login?next=/my/inquiries");
      return;
    }

    (async () => {
      try {
        // نتعامل مع النتيجة كـ unknown ثم نضيّقها بأنفسنا
        const data = (await getMyInquiries(token)) as unknown;

        const raw =
          Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.inquiries)
            ? (data as any).inquiries
            : [];

        const list: Inquiry[] = raw.map(normalizeInquiry);

        setItems(list);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load inquiries.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div
      className="min-h-screen text-gray-800"
      style={{ backgroundColor: "rgb(255, 247, 232)" }}
    >
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">My Inquiries</h1>

        {loading && <div className="text-gray-600">Loading…</div>}
        {err && <div className="text-red-600">{err}</div>}

        {!loading && !err && items.length === 0 && (
          <div className="rounded-xl border bg-white p-4">
            You have no inquiries yet.
          </div>
        )}

        <div className="grid gap-4">
          {items.map((inq) => (
            <div key={inq.id} className="rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {inq.listingTitle ?? "Listing"}
                </h3>
                <span className="text-sm text-gray-500">
                  {inq.status ?? "pending"}
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                Qty: <span className="font-medium">{inq.quantity ?? "-"}</span>
              </div>

              {inq.message && (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {inq.message}
                </p>
              )}

              {inq.createdAt && (
                <div className="mt-2 text-xs text-gray-500">
                  {new Date(inq.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
