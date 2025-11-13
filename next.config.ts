import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // نصدّر كـ static
  output: "export",
  // تعطيل تحسين الصور لأن الاستضافة غالباً ما تدعم static فقط
  images: { unoptimized: true },
  // مسارات تنتهي بشرطة مائلة (اختياري لكنه يساعد مع الاستضافة)
  trailingSlash: true,
};

export default nextConfig;
