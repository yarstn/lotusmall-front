"use client";

import { useEffect, useState } from "react";
import { SellerGate } from "@/components/auth-gates";
import { type Inquiry } from "@/lib/api";

type Paged<T> = {
  items: T[];
  metadata?: { page: number; per: number; total: number };
};

export default function SellerInquiriesPage() {
  const [data, setData] = useState<Paged<Inquiry>>({ items: [] });
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token") || "";
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
const url = `${apiBase}/seller/inquiries`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setErr(e?.message ?? "تعذّر جلب الاستفسارات");
      }
    })();
  }, []);

  return (
    <SellerGate>
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold mb-4">Inquirires</h1>
        {err && <div className="text-red-600 mb-3">{err}</div>}

        {data.items.length === 0 ? (
          <div className="rounded-xl border bg-white p-6">You dont have any Inquirires</div>
        ) : (
          <div className="space-y-3">
            {data.items.map((inq) => (
              <div key={inq.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{inq.buyerName} • {inq.buyerPhone}</div>
                  <span className="text-xs rounded-full px-2 py-0.5 border">
                    {inq.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{inq.message}</div>
                <div className="text-xs text-gray-500 mt-2">
                  كمية مطلوبة: {inq.quantity} — {new Date(inq.createdAt || "").toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerGate>
  );
}
