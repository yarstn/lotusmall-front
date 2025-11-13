"use client";

import { useEffect, useState } from "react";
import {
  adminGetNews,
  adminCreateNews,
  adminUpdateNews,
  adminDeleteNews,
  type NewsItem,
} from "@/lib/api";

const emptyForm = {
  titleEn: "",
  titleVi: "",
  coverURL: "",
  location: "",
  bodyEn: "",
  bodyVi: "",
  eventDate: "", // من input type=date
  isPublished: true,
};

// يحوّل أي قيمة تاريخ إلى ISO8601 (أو يرجّع undefined)
function toISODateSmart(input?: string): string | undefined {
  if (!input) return undefined;
  const s = input.trim();

  // 1) HTML date → yyyy-mm-dd
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
  let m = s.match(ymd);
  if (m) {
    const iso = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`).toISOString();
    return iso;
  }

  // 2) dd/mm/yyyy
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  m = s.match(dmy);
  if (m) {
    const iso = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`).toISOString();
    return iso;
  }

  // 3) لو أصلا ISO
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}

  return undefined;
}

export default function AdminNewsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<NewsItem[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const list = await adminGetNews(token);
        setRows(list);
      } catch (e: any) {
        setErr(e.message || "Failed");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    try {
      const payload: any = {
        titleEn: form.titleEn,
        titleVi: form.titleVi,
        coverURL: form.coverURL || undefined,
        location: form.location || undefined,
        bodyEn: form.bodyEn || undefined,
        bodyVi: form.bodyVi || undefined,
        isPublished: !!form.isPublished,
        eventDate: toISODateSmart(form.eventDate), // ← تحويل ذكي
      };

      // امسح المفاتيح undefined حتى لا تُرسل للباك
      if (payload.eventDate === undefined) delete payload.eventDate;
      if (payload.coverURL === undefined) delete payload.coverURL;
      if (payload.location === undefined) delete payload.location;
      if (payload.bodyEn === undefined) delete payload.bodyEn;
      if (payload.bodyVi === undefined) delete payload.bodyVi;

      let saved: NewsItem;
      if (editingId) {
        saved = await adminUpdateNews(token, editingId, payload);
        setRows((prev) => prev.map((r) => (r.id === editingId ? saved : r)));
      } else {
        saved = await adminCreateNews(token, payload);
        setRows((prev) => [saved, ...prev]);
      }

      setForm(emptyForm);
      setEditingId(null);
      setErr(null);
    } catch (e: any) {
      setErr(e.message || "Failed to save");
    }
  }

  function startEdit(n: NewsItem) {
    setEditingId(n.id);
    setForm({
      titleEn: n.titleEn,
      titleVi: n.titleVi,
      coverURL: n.coverURL || "",
      location: n.location || "",
      bodyEn: n.bodyEn || "",
      bodyVi: n.bodyVi || "",
      // حطّه في الحقل كـ yyyy-mm-dd (لـ input date)
      eventDate: n.eventDate ? new Date(n.eventDate).toISOString().slice(0, 10) : "",
      isPublished: n.isPublished,
    });
  }

  async function remove(id: string) {
    if (!token) return;
    if (!confirm("Delete this item?")) return;
    await adminDeleteNews(token, id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <main className="min-h-screen bg-[rgb(252,240,210)] text-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-[#f9d67a] via-[#f5cd82] to-[#f2b564] bg-clip-text text-transparent">
          Admin • Vietnam News
        </h1>

        {err && <div className="mb-4 text-red-600">{err}</div>}

        {/* Form */}
        <form onSubmit={onSubmit} className="bg-white/90 rounded-2xl p-5 shadow-sm grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Title (EN)"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Title (VI)"
            value={form.titleVi}
            onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
            required
          />
          <input
            className="input"
            placeholder="Cover URL"
            value={form.coverURL}
            onChange={(e) => setForm({ ...form, coverURL: e.target.value })}
          />
          <input
            className="input"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
       
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            <span>Published</span>
          </label>
          <textarea
            className="textarea sm:col-span-2"
            rows={4}
            placeholder="Body (EN)"
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
          />
          <textarea
            className="textarea sm:col-span-2"
            rows={4}
            placeholder="Body (VI)"
            value={form.bodyVi}
            onChange={(e) => setForm({ ...form, bodyVi: e.target.value })}
          />
          <div className="sm:col-span-2 flex gap-3">
            <button className="px-4 py-2 rounded-full bg-[#f2b564] font-semibold">
              {editingId ? "Save changes" : "Add news"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="px-4 py-2 rounded-full border"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div className="mt-8 grid gap-4">
          {loading
            ? "Loading…"
            : rows.map((n) => (
                <div key={n.id} className="bg-white/90 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                
                  <div className="flex-1">
                    <div className="font-bold">{n.titleEn}</div>
                    <div className="text-sm text-gray-500">
                      {n.location || "—"} · {n.eventDate ? new Date(n.eventDate).toLocaleDateString() : "—"}
                      {n.isPublished ? " · Published" : " · Draft"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(n)} className="px-3 py-1 rounded-full border">
                      Edit
                    </button>
                    <button onClick={() => remove(n.id)} className="px-3 py-1 rounded-full bg-red-500 text-white">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <style jsx>{`
        .input {
          @apply rounded-xl border px-3 py-2 bg-white/70;
        }
        .textarea {
          @apply rounded-xl border px-3 py-2 bg-white/70;
        }
      `}</style>
    </main>
  );
}
