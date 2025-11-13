"use client";
import { useEffect, useState } from "react";
import { getNews, type NewsItem } from "@/lib/api";

export default function VietnamNewsPage() {
  const [rows, setRows] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await getNews();
        setRows(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[rgb(252,240,210)] text-gray-900">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-[#f9d67a] via-[#f5cd82] to-[#f2b564] bg-clip-text text-transparent">
          What’s New in Vietnam
        </h1>

        {/* Intro EN + VI كما في النسخة السابقة ... */}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {loading && <div className="opacity-60">Loading…</div>}
          {!loading && rows.length === 0 && (
            <div className="opacity-60">No published news yet.</div>
          )}
          {rows.map(n => (
            <article key={n.id} className="bg-white/85 rounded-2xl shadow-sm p-5">
              <div className="flex items-start gap-4">
                {n.coverURL && (
                  <img src={n.coverURL} className="w-28 h-28 rounded-xl object-cover" alt="" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#b78c32]">{n.titleEn}</h3>
                  {n.location && <div className="text-sm text-gray-500">{n.location}</div>}
                  {n.eventDate && (
                    <div className="text-sm text-gray-500">
                      {new Date(n.eventDate).toLocaleDateString()}
                    </div>
                  )}
                  {n.bodyEn && <p className="mt-2 text-gray-700 line-clamp-3">{n.bodyEn}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
