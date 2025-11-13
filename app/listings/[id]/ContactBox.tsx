"use client";

import { useEffect, useState } from "react";
import { getUserIdFromToken } from "@/lib/api";
import InquiryForm from "./InquiryForm";

type Props = {
  listingID: string;
  sellerID: string;
};

export default function ContactBox({ listingID, sellerID }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);   // هل هو مالك الإعلان؟
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null); // هل هو مسجل دخول؟
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const token = localStorage.getItem("token");
      setIsAuthed(!!token);

      if (token) {
        const userId = getUserIdFromToken(token);
        setIsOwner(userId !== null && String(userId) === String(sellerID));
      } else {
        setIsOwner(false);
      }
    } catch (e) {
      // لو فشل فك التوكن اعتبره غير مسجل وغير مالك
      console.error("ContactBox: failed to read token or decode user id", e);
      setIsAuthed(false);
      setIsOwner(false);
    }
  }, [sellerID]);

  // أثناء التحميل/التحقّق نتجنّب أي تغيّر بصري مفاجئ
  if (!mounted || isOwner === null || isAuthed === null) {
    return <div className="rounded-xl border p-4 bg-white">...</div>;
  }

  // إن كان مالك الإعلان
  if (isOwner) {
    return (
      <div className="rounded-xl border p-4 bg-white">
you are the own Add{" "}
        <a href="/my/listings" className="underline">
Manage your Add        </a>
      </div>
    );
  }

  // إن لم يكن مسجّل دخول: أظهر زر تسجيل الدخول مع next للرجوع بعد الدخول
  if (!isAuthed) {
    // نحاول أخذ المسار الحالي ليعود له بعد تسجيل الدخول
    const nextPath =
      typeof window !== "undefined" ? window.location.pathname : `/listings/${listingID}`;

    return (
      <div className="rounded-xl border p-4 bg-white">
        <p className="mb-3 text-sm text-gray-700">
please login to send an inquiry        </p>
        <a
          href={`/login?next=${encodeURIComponent(nextPath)}`}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-[#f9d67a] via-[#f5cd82] to-[#f2b564] text-gray-900 font-semibold px-4 py-2 shadow hover:opacity-90 transition"
        >
          Login
        </a>
      </div>
    );
  }

  // مستخدم مسجّل (وليس المالك): اسمح بفتح النموذج والإرسال
  return (
    <div className="rounded-xl border p-4 bg-white">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-gradient-to-r from-[#f9d67a] via-[#f5cd82] to-[#f2b564] text-gray-900 font-semibold px-4 py-2 shadow hover:opacity-90 transition"
        >
          Contact to buy
        </button>
      ) : (
        <div>
          <h3 className="font-semibold mb-2">Send inquiry</h3>
          <InquiryForm listingID={listingID} />
          <button onClick={() => setOpen(false)} className="mt-3 text-sm underline">
    Close
          </button>
        </div>
      )}
    </div>
  );
}
