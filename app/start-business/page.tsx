// app/start-business/page.tsx
"use client";

import { useState } from "react";
import { createContact } from "@/lib/api";

export default function StartBusinessPage() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | "success" | "error">(null);
  const [errMsg, setErrMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErrMsg("");
    if (!fullName.trim() || !phone.trim() || !email.trim() || !message.trim()) {
      setOk("error");
      setErrMsg("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createContact({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim() || undefined,
        message: message.trim(),
      });
      setOk("success");
      setFullName(""); setCompany(""); setPhone(""); setEmail(""); setMessage("");
    } catch (e: any) {
      setOk("error");
      setErrMsg(e?.message || "Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50">
        <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_20%_-10%,rgba(255,200,120,0.35),transparent),radial-gradient(400px_200px_at_80%_-5%,rgba(255,180,80,0.25),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-white/70 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm">
                LotusMall Partners
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Start Your Business
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Launch your brand with trusted Vietnamese suppliers, quality checks, and smooth logistics to Saudi Arabia.
              </p>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {["Verified suppliers", "Quality inspection", "Negotiation support", "Logistics to KSA"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm shadow ring-1 ring-amber-200/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Callout Card (VN + EN) */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-amber-200/60 p-6">
              <h3 className="text-lg font-bold text-gray-900 text-end">Khởi nghiệp cùng chúng tôi</h3>
              <p className="mt-2 text-sm text-gray-700 text-end leading-6">
                Bắt đầu dự án kinh doanh của bạn từ Việt Nam đến Ả Rập Xê Út cùng LotusMall.
                Chúng tôi hỗ trợ tìm nguồn hàng, đàm phán, kiểm định chất lượng, vận chuyển và kết nối
                với nhà cung cấp uy tín để bạn có thể tập trung vào bán hàng và tăng trưởng.
              </p>
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
              <h3 className="text-lg font-bold text-gray-900">Start your business from Vietnam to Saudi Arabia</h3>
              <p className="mt-2 text-sm text-gray-700 leading-6">
                Launch with LotusMall: we help you source products, negotiate, inspect quality, handle logistics,
                and connect you with reliable suppliers — so you can focus on selling and growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Share your idea", d: "Tell us your category, budget, and target." },
            { t: "Find suppliers", d: "We shortlist verified factories & brands." },
            { t: "Quality & deals", d: "Samples, inspections, and best pricing." },
            { t: "Ship & launch", d: "Shipping, customs, and delivery to KSA." },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-amber-100">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold">
                {i + 1}
              </div>
              <h4 className="font-semibold text-gray-900">{s.t}</h4>
              <p className="mt-1 text-sm text-gray-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact form */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-amber-200/60">
            <div className="grid md:grid-cols-2">
              {/* Left intro */}
              <div className="relative overflow-hidden rounded-t-3xl md:rounded-s-3xl md:rounded-tr-none bg-gradient-to-br from-amber-100 via-amber-50 to-white p-8">
                <h3 className="text-2xl font-bold text-gray-900">Get in touch</h3>
                <p className="mt-2 text-sm text-gray-700">
                  Send your request and our admin team will contact you. You’ll see the inquiry in the admin panel too.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-gray-700">
                  <li>• Typical reply within 24–48h</li>
                  <li>• WhatsApp or email follow-up</li>
                  <li>• Arabic / English / Vietnamese support</li>
                </ul>
              </div>

              {/* Right form */}
              <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-3">
                {ok === "success" && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
                    Sent! We’ll get back to you soon.
                  </div>
                )}
                {ok === "error" && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                    {errMsg || "Something went wrong."}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-lg border border-amber-200/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Full name *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-amber-200/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Company (optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className="rounded-lg border border-amber-200/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Phone / WhatsApp *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <input
                    type="email"
                    className="rounded-lg border border-amber-200/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <textarea
                  rows={5}
                  className="w-full rounded-lg border border-amber-200/70 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
                  placeholder="What do you want to source? (category, quantity, budget, timeline) *"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="pt-1">
                  <button
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400 px-5 py-2.5 font-semibold text-white shadow-[0_6px_20px_rgba(245,183,66,0.35)] hover:brightness-105 disabled:opacity-60"
                  >
                    {loading ? "Sending…" : "Send request"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  By sending, you agree to be contacted by LotusMall team.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
