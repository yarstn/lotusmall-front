"use client";

import { useEffect, useState } from "react";
import { adminGetContacts, adminRespondContact, type ContactRow } from "@/lib/api";

export default function AdminContactsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [status, setStatus] = useState<"all"|"new"|"responded">("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [myEmail, setMyEmail] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    if (!t) window.location.href = "/login?next=/admin/contacts";
  }, []);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true); setErr(null);
        const list = await adminGetContacts(token, { status });
        setRows(list);
      } catch (e:any) {
        setErr(e?.message || "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, status]);

  async function markResponded(id: string) {
    if (!token) return;
    const email = prompt("Admin email who responded:", myEmail) || "";
    if (!email) return;
    setMyEmail(email);
    await adminRespondContact(token, id, email);
    setRows((r)=> r.map(x=> x.id===id ? { ...x, status:"responded", respondedBy: email } : x));
  }

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin · Contacts</h1>

      {err && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>}

      <div className="mb-4">
        <select className="rounded border px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="responded">Responded</option>
        </select>
      </div>

      {loading ? "Loading…" : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3 text-left">Created</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">{r.company || "-"}</td>
                  <td className="p-3 max-w-[360px] whitespace-pre-wrap">{r.message}</td>
                  <td className="p-3 text-center">
                    {r.status === "responded" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        responded · {r.respondedBy || "-"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        new
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {r.status !== "responded" && (
                      <button onClick={()=>markResponded(r.id)} className="rounded bg-indigo-600 text-white px-3 py-1 hover:bg-indigo-700">
                        Mark Responded
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={8}>No contacts.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

