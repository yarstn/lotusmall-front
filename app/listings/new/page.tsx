"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { uploadImage, createListing, type CreateListingInput } from "@/lib/api";

type ExtraFields = {
  category?: string;
  condition?: "new" | "used";
  color?: string;
  size?: string;
  tags?: string;
};

type FormErrors = Partial<Record<keyof (CreateListingInput & ExtraFields), string>>;

const CATEGORIES = [
  "أزياء وملابس",
  "شنط وإكسسوارات",
  "ساعات",
  "أجهزة صغيرة",
  "منزل ومطبخ",
  "ألعاب وهدايا",
];

export default function NewListingPage() {
  const router = useRouter();

  // ===== Auth gate =====
  const [token, setToken] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const s = typeof window !== "undefined" ? localStorage.getItem("isSeller") : null;
    setToken(t);
    setIsSeller(s === "true");
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isSeller) {
      router.replace("/my/inquiries");
    }
  }, [authChecked, token, isSeller, router]);

  // ===== Form state =====
  const [form, setForm] = useState<CreateListingInput & ExtraFields>({
    title: "",
    desc: "",
    price: 0,
    minOrderQty: 1,
    stock: 0,
    imageUrls: [],
    category: "",
    condition: "new",
    color: "",
    size: "",
    tags: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // ===== Dropzone (JPG/PNG فقط + منع HEIC) =====
  const onDrop = async (accepted: File[]) => {
    // رفض أي HEIC/HEIF
    const valid = accepted.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const isHeic = f.type === "image/heic" || f.type === "image/heif" || ext === "heic" || ext === "heif";
      return !isHeic;
    });
    const rejected = accepted.length - valid.length;
    if (rejected > 0) alert("صيغة HEIC غير مدعومة. فضلاً ارفعي JPG أو PNG.");

    const remains = 4 - (form.imageUrls?.length ?? 0);
    if (remains <= 0 || valid.length === 0) return;

    const toUpload = valid.slice(0, remains);

    // معاينات مؤقتة
    const tempPreviews = toUpload.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls || []), ...tempPreviews] }));

    try {
      const t = localStorage.getItem("token") || "";
      // رفع بالتوازي
      const uploaded = await Promise.all(toUpload.map((f) => uploadImage(f, t)));

      // استبدال المعاينات بروابط نهائية
      setForm((prev) => {
        const current = prev.imageUrls || [];
        const withoutTemps = current.slice(0, current.length - tempPreviews.length);
        return { ...prev, imageUrls: [...withoutTemps, ...uploaded] };
      });
    } catch (e: any) {
      // إرجاع الحالة لو فشل الرفع
      setForm((prev) => {
        const current = prev.imageUrls || [];
        return { ...prev, imageUrls: current.slice(0, current.length - tempPreviews.length) };
      });
      alert(e?.message || "فشل رفع الصورة");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // منع HEIC من المصدر
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: true,
    maxFiles: 4,
    onDrop,
  });

  // ===== Local draft =====
  useEffect(() => {
    const saved = localStorage.getItem("new_listing_draft_local");
    if (saved) {
      try {
        setForm((p) => ({ ...p, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("new_listing_draft_local", JSON.stringify(form));
  }, [form]);

  // ===== Validation =====
  function validate(values: typeof form): FormErrors {
    const e: FormErrors = {};
    if (!values.title?.trim()) e.title = "أدخلي عنوان المنتج.";
    if (!values.desc?.trim()) e.desc = "اكتبي وصفًا للمنتج.";
    if (values.price <= 0) e.price = "السعر يجب أن يكون أكبر من صفر.";
    if (values.minOrderQty < 1) e.minOrderQty = "الحد الأدنى لا يمكن أن يكون أقل من 1.";
    if (values.stock < 0) e.stock = "المخزون لا يمكن أن يكون سالبًا.";
    if (!values.category) e.category = "اختاري تصنيف المنتج.";
    if (!values.condition) e.condition = "اختاري حالة المنتج.";
    return e;
  }

  // ===== Submit =====
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    if (!isSeller) {
      setError("لا يمكنك إنشاء إعلان لأن حسابك غير مفعّل كبائع.");
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = (form.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const userOrigin =
        (typeof window !== "undefined" && localStorage.getItem("sellerOrigin")) || "Vietnam";

      const extraLinesArr: string[] = [];
      if (form.category) extraLinesArr.push("Category: " + form.category);
      if (form.condition)
        extraLinesArr.push("Condition: " + (form.condition === "new" ? "New" : "Used"));
      if (form.color) extraLinesArr.push("Color: " + form.color);
      if (form.size) extraLinesArr.push("Size: " + form.size);
      if (tagsArray.length) extraLinesArr.push("Tags: " + tagsArray.join(", "));
      if (userOrigin) extraLinesArr.push("Origin: " + userOrigin);

      const joinedExtra = extraLinesArr.join(" — ");

      const freshToken = (typeof window !== "undefined" && localStorage.getItem("token")) || "";
      if (!freshToken) {
        router.replace("/login");
        return;
      }

      // تنظيف روابط الصور (لا فراغات ولا empty)
      const cleanedImages = (form.imageUrls || [])
        .filter((u) => typeof u === "string" && u.trim() !== "")
        .slice(0, 4);

      await createListing(
        {
          title: form.title,
          desc: joinedExtra ? form.desc + "\n\n" + joinedExtra : form.desc,
          price: form.price,
          minOrderQty: form.minOrderQty,
          stock: form.stock,
          imageUrls: cleanedImages,
        },
        freshToken
      );

      localStorage.removeItem("new_listing_draft_local");
      router.push("/my/listings");
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "تعذّر إنشاء الإعلان.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function clearDraft() {
    localStorage.removeItem("new_listing_draft_local");
    setForm({
      title: "",
      desc: "",
      price: 0,
      minOrderQty: 1,
      stock: 0,
      imageUrls: [],
      category: "",
      condition: "new",
      color: "",
      size: "",
      tags: "",
    });
    setErrors({});
  }

  const cover = form.imageUrls?.find((u) => u && u.trim() !== "") || "/placeholder.png";
  const priceFormatted = useMemo(
    () => (form.price ? `${Number(form.price).toFixed(2)} ر.س` : "—"),
    [form.price]
  );

  // ===== Auth guard rendering =====
  if (!authChecked) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-gray-500">
        جارٍ التحقق من تسجيل الدخول…
      </div>
    );
  }
  if (!token || !isSeller) return null;

  // ===== UI =====
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 text-gray-800" dir="rtl">
      <section className="border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-7">
          <h1 className="text-3xl font-extrabold">+ Ads</h1>
          <p className="text-gray-600 mt-1">
            Fill in the following information. The preview on the right update automatically.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ===== Form ===== */}
            <form onSubmit={onSubmit} className="lg:col-span-2 space-y-8">
              {/* Details */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Product Details</h2>
                  <div className="flex items-center gap-3 text-xs">
                    <button type="button" onClick={clearDraft} className="rounded-lg border px-3 py-1 hover:bg-gray-50">
                      مسح المسودة
                    </button>
                    <span className="text-gray-500">* Required Feild</span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Address *</label>
                  <input
                    type="text"
                    placeholder="hand bag - hermes"
                    className={`w-full rounded-xl p-3 border ${
                      errors.title ? "border-red-400" : "border-gray-300"
                    } focus:border-gray-800 focus:ring-gray-800`}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Category*</label>
                  <select
                    className={`w-full rounded-xl p-3 border ${
                      errors.category ? "border-red-400" : "border-gray-300"
                    } focus:border-gray-800 focus:ring-gray-800`}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Choose Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Details *</label>
                  <textarea
                    placeholder="الخامة، المقاسات/الأبعاد، الضمان، ملاحظات الشحن…"
                    maxLength={400}
                    className={`w-full rounded-xl p-3 border ${
                      errors.desc ? "border-red-400" : "border-gray-300"
                    } focus:border-gray-800 focus:ring-gray-800`}
                    rows={6}
                    value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>write what consumer should know</span>
                    <span>{form.desc.length}/400</span>
                  </div>
                  {errors.desc && <p className="text-xs text-red-600">{errors.desc}</p>}
                </div>
              </section>

              {/* Price & Stock */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold">Price and stock</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Price *</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="149.00"
                        className={`w-full rounded-xl p-3 pe-14 border ${
                          errors.price ? "border-red-400" : "border-gray-300"
                        } focus:border-gray-800 focus:ring-gray-800`}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      />
                      <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">ر.س</span>
                    </div>
                    {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                  </div>

                  {/* Min Order */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Minimum*</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      className={`w-full rounded-xl p-3 border ${
                        errors.minOrderQty ? "border-red-400" : "border-gray-300"
                      } focus:border-gray-800 focus:ring-gray-800`}
                      value={form.minOrderQty}
                      onChange={(e) => setForm({ ...form, minOrderQty: Number(e.target.value) })}
                    />
                    {errors.minOrderQty && <p className="text-xs text-red-600">{errors.minOrderQty}</p>}
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Stock *</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="20"
                      className={`w-full rounded-xl p-3 border ${
                        errors.stock ? "border-red-400" : "border-gray-300"
                      } focus:border-gray-800 focus:ring-gray-800`}
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    />
                    {errors.stock && <p className="text-xs text-red-600">{errors.stock}</p>}
                  </div>
                </div>
              </section>

              {/* Images */}
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-5">
                <h2 className="text-lg font-bold">Product pictures - only 4</h2>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    isDragActive ? "border-gray-800 bg-gray-50" : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  <p className="text-gray-600">
                    Drag or click <span className="text-gray-400">(PNG, JPG — 4 pics)</span>
                  </p>
                </div>

                {form.imageUrls?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {form.imageUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`صورة ${i + 1}`}
                          className="h-28 w-full object-cover rounded-lg border bg-gray-100"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, idx) => idx !== i),
                            }));
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          aria-label="Delete picture"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Tip: Upload a clear image on a simple background.</p>
                )}
              </section>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <a href="/" className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
                  Cancele
                </a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-white font-medium shadow-sm hover:bg-black disabled:opacity-60"
                >
                  {submitting ? "جارٍ الحفظ..." : "حفظ الإعلان"}
                </button>
              </div>
            </form>

            {/* ===== Preview ===== */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="font-bold mb-3">Quick Preview</h3>
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden ring-1 ring-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="غلاف" className="h-48 w-full object-cover bg-gray-100" />
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold line-clamp-1">{form.title || "Product title"}</h4>
                      <span className="text-gray-900 font-bold">{priceFormatted}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {form.desc || "The product description will appear here"}
                    </p>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>الحد الأدنى: {form.minOrderQty || 1}</span>
                      <span>المخزون: {form.stock || 0}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This is a preview of what the product card looks like.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
