"use client";

import { useMemo, useState } from "react";

type Props = {
  images?: unknown[];     // نتساهل في النوع وننظّفه
  title?: string;
  className?: string;
};

// التحقق من صلاحية رابط الصورة
function isValidSrc(u: unknown): u is string {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!s) return false;
  // نسمح بروابط http/https أو ملفات الرفع المحلية أو data:
  return /^https?:\/\//.test(s) || s.startsWith("/uploads/") || s.startsWith("data:");
}

export default function Gallery({ images = [], title = "", className = "" }: Props) {
  // نفلتر أي عناصر غير صالحة أو سلاسل فاضية
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(isValidSrc) : []).slice(0, 4),
    [images]
  );

  // لو ما فيه صور صالحة نعرض placeholder فقط
  const [index, setIndex] = useState(0);
  const current = safeImages[index] ?? "/placeholder.png";

  return (
    <div className={className}>
      <div className="rounded-2xl bg-white shadow p-4">
        {/* الصورة الرئيسية */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={title || "image"}
          className="w-full h-80 object-contain bg-gray-50"
        />

        {/* المصغّرات */}
        {safeImages.length > 1 && (
          <div className="mt-3 flex gap-2">
            {safeImages.map((url, i) => {
              const selected = i === index;
              return (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border ${
                    selected ? "ring-2 ring-gray-900" : ""
                  }`}
                  aria-label={`preview ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${title || "image"} - ${i + 1}`}
                    className="h-full w-full object-contain bg-gray-50"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
