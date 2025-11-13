"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInquiry } from "@/lib/api";

export default function InquiryForm({ listingID }: { listingID: string }) {
  const router = useRouter();

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOk(false);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_token") || localStorage.getItem("token")
        : null;

    if (!token) {
      setSubmitting(false);
      setError("You must log in before sending an inquiry.");
      router.push("/login");
      return;
    }

    try {
      const cleanedPhone = buyerPhone.trim();
      const qty = Math.max(1, Number(quantity) || 1);

      await createInquiry(
        {
          listingID,
          buyerName: buyerName.trim(),
          buyerPhone: cleanedPhone,
          // لا نرسل buyerEmail — السيرفر سيستخدم إيميل الحساب من التوكن
          quantity: qty,
          message: message.trim() || undefined,
        },
        token
      );

      setOk(true);
      setBuyerName("");
      setBuyerPhone("");
      setQuantity(1);
      setMessage("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to send inquiry");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 mt-6">
      {error && <div className="text-red-600">{error}</div>}
      {ok && <div className="text-green-600">Inquiry sent successfully 👌</div>}

      <input
        className="w-full rounded-lg border p-2"
        placeholder="Your name"
        value={buyerName}
        onChange={(e) => setBuyerName(e.target.value)}
        required
      />
      <input
        className="w-full rounded-lg border p-2"
        placeholder="Your phone"
        value={buyerPhone}
        onChange={(e) => setBuyerPhone(e.target.value)}
        required
      />
      <input
        type="number"
        min={1}
        className="w-full rounded-lg border p-2"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        required
      />
      <textarea
        className="w-full rounded-lg border p-2"
        placeholder="Message (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <button
        disabled={submitting}
        className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
