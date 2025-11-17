"use client";

import { useEffect, useState } from "react";
import { getListingById, type Listing } from "@/lib/api";
import Gallery from "./Gallery";
import ContactBox from "./ContactBox";

type Props = {
  id: string;
};

export default function ListingClient({ id }: Props) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getListingById(id);
        if (!cancelled) {
          setListing(data);
          setErr(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setErr(e?.message || "تعذّر جلب المنتج");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 flex items-center justify-center">
        <p className="text-gray-600">جارٍ تحميل المنتج…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 flex items-center justify-center">
        <p className="text-red-600">{err}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 flex items-center justify-center">
        <p className="text-gray-600">المنتج غير موجود.</p>
      </div>
    );
  }

  const images = (listing.imageUrls?.length ? listing.imageUrls : ["/placeholder.png"]).slice(0, 4);

  const price = listing.price ?? 0;
  const minOrderQty = listing.minOrderQty ?? 1;
  const stock = listing.stock ?? 0;
  const sellerId = listing.seller?.id ? String(listing.seller.id) : "";

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800">
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* المعرض */}
          <Gallery images={images} title={listing.title} />

          {/* التفاصيل */}
          <section className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>

            {listing.desc && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.desc}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                السعر:{" "}
                <span className="font-semibold text-gray-900">
                  ر․س {price}
                </span>
              </div>
              <div>
                الحد الأدنى:{" "}
                <span className="font-medium">{minOrderQty}</span>
              </div>
              <div>
                المخزون: <span className="font-medium">{stock}</span>
              </div>
            </div>

            <div className="pt-2">
              <ContactBox listingID={String(listing.id)} sellerID={sellerId} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
