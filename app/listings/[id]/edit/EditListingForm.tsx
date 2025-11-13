// app/listings/[id]/edit/EditListingForm.tsx
"use client";

import { useEffect, useState } from "react";
import { updateListing, type CreateListingInput } from "@/lib/api";
import { getUserIdFromToken } from "@/lib/api";
import { useRouter } from "next/navigation";

type Props = {
  listingId: string;
  ownerId: string;
  initial: CreateListingInput;
};

export default function EditListingForm({ listingId, ownerId, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateListingInput>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.replace("/login?next=" + encodeURIComponent(`/listings/${listingId}/edit`));
      return;
    }
      const uid = getUserIdFromToken(t);

      if (uid && String(uid) === String(ownerId)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }

      setAuthChecked(true);

  }, [listingId, ownerId, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      await updateListing(listingId, form, token);
      router.push(`/listings/${listingId}`);
    } catch (err: any) {
      setError(err?.message || "Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return <div className="text-gray-500">Checking permission…</div>;
  }
  if (!allowed) {
    return (
      <div className="rounded-xl border bg-white p-4 text-red-600">
        You don’t own this listing.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-xl border p-6">
      {error && <div className="text-red-600">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          className="w-full rounded-md border p-2"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full rounded-md border p-2"
          rows={5}
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border p-2"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value || 0) })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min order</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={form.minOrderQty}
            onChange={(e) => setForm({ ...form, minOrderQty: Number(e.target.value || 1) })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Stock</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value || 0) })}
            required
          />
        </div>
      </div>

      {/* صور بسيطة: حقل نصّي لكل رابط موجود + إضافة رابط جديد */}
      <div>
        <label className="block text-sm font-medium mb-2">Image URLs (up to 4)</label>
        <div className="space-y-2">
          {(form.imageUrls || []).map((u, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 rounded-md border p-2"
                value={u}
                onChange={(e) => {
                  const arr = [...(form.imageUrls || [])];
                  arr[i] = e.target.value;
                  setForm({ ...form, imageUrls: arr.slice(0, 4) });
                }}
              />
              <button
                type="button"
                className="px-3 rounded border"
                onClick={() => {
                  const arr = (form.imageUrls || []).filter((_, idx) => idx !== i);
                  setForm({ ...form, imageUrls: arr });
                }}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          {(form.imageUrls?.length || 0) < 4 && (
            <button
              type="button"
              className="rounded border px-3 py-1"
              onClick={() =>
                setForm({ ...form, imageUrls: [...(form.imageUrls || []), ""] })
              }
            >
              + Add image URL
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
        <a href={`/listings/${listingId}`} className="text-sm underline">
          Cancel
        </a>
      </div>
    </form>
  );
}
