"use client";

import React from "react";

export default function BannerSlider() {
  return (
    <div className="relative w-full h-[300px] md:h-[420px] overflow-hidden rounded-lg shadow">
      <img
        src="/hero-1.jpg" // ← حطي هنا اسم الصورة اللي تبينها كصورة عرض
        alt="Main banner"
        className="w-full h-full object-cover"
      />

      {/* تدرّج شفاف جميل فوق الصورة */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

      {/* نص بسيط على الصورة (اختياري) */}
      <div className="absolute bottom-6 left-6 text-white">
        <h2 className="text-3xl font-bold drop-shadow">Cổng thông tin kinh doanh Việt Nam - Trung Đông</h2>
        <p className="text-sm opacity-90">💫</p>
      </div>
    </div>
  );
}
