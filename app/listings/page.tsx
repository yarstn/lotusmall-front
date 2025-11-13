// app/listings/page.tsx
import { notFound } from "next/navigation";
import { getListings } from "@/lib/api";

/** نوع خفيف يكفي للواجهة هنا */
type ListingLite = {
  id: string;
  title: string;
  desc?: string | null;
  price?: number | null;
  minOrderQty?: number | null;
  stock?: number | null;
  imageUrls?: string[] | null;
  seller?: { id?: string; originCountry?: string } | null;
};

export const revalidate = 0;

/** فحص صلاحية رابط الصورة */
function isValidSrc(u: unknown) {
  if (typeof u !== "string") return false;
  const s = u.trim();
  if (!s) return false;
  return /^https?:\/\//.test(s) || s.startsWith("/uploads/") || s.startsWith("data:");
}

/** قراءة باراميتر من searchParams كسلسلة واحدة */
function readParam(
  obj: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const v = obj?.[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function ListingsIndex({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // نحاول دعم ?originCountry=… أو ?origin=…
  const originParamRaw =
    readParam(searchParams, "originCountry") ?? readParam(searchParams, "origin");
  const originParam = originParamRaw?.trim();

  // جيبي كل الإعلانات (الدالة ممكن ما تدعم فلترة على السيرفر)
  const all = ((await getListings().catch(() => [])) || []) as unknown as ListingLite[];

  // رشّحي حسب الدولة إن وُجدت (من seller.originCountry أو مستخرجة من الوصف)
  const filtered = originParam
    ? all.filter((it) => {
        const bySeller =
          it.seller?.originCountry &&
          it.seller.originCountry.toLowerCase() === originParam.toLowerCase();

        const byDesc = (it.desc || "")
          .toLowerCase()
          .includes(`origin: ${originParam.toLowerCase()}`);

        return Boolean(bySeller || byDesc);
      })
    : all;

  // لو ما عندنا شيء ومعنا باراميتر، اعتبريه 404
  if (originParam && filtered.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {originParam ? `Products from ${originParam}` : "All Products"}
        </h1>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-white shadow p-6 text-gray-600">
            لا توجد منتجات متاحة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => {
              const images = (item.imageUrls || []).filter(isValidSrc);
              const cover = images[0] ?? "/placeholder.png";
              const price = item.price ?? 0;
              const minOrderQty = item.minOrderQty ?? 1;

              const origin =
                item.seller?.originCountry ||
                ((item.desc || "").match(/Origin:\s*([^\n—-]+)/i)?.[1]?.trim() ?? "");

              return (
                <a
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition ring-1 ring-gray-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={item.title}
                    className="w-full h-52 object-contain bg-gray-50"
                  />
                  <div className="p-4 space-y-2">
                    <h2 className="font-semibold line-clamp-1">{item.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {(item.desc || "").split("\n")[0]}
                    </p>
                    <div className="text-sm text-gray-700 flex justify-between">
                      <span>Min: {minOrderQty}</span>
                      <span className="font-semibold">ر․س {price}</span>
                    </div>
                    {origin ? (
                      <div className="text-xs text-gray-500">Origin: {origin}</div>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
