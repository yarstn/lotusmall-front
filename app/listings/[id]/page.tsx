import { notFound } from "next/navigation";
import { getListings, getListingById, type Listing } from "@/lib/api";
import Gallery from "./Gallery";
import ContactBox from "./ContactBox";

export async function generateStaticParams() {
  const listings = await getListings().catch(() => []);
  return (listings || []).map((item: any) => ({
    id: String(item?.id),
  }));
}

export const revalidate = 0;

export default async function ListingDetailPage(
  { params }: { params: { id: string } }
) {
  const listing = (await getListingById(params.id).catch(() => null)) as Listing | null;
  if (!listing) notFound();

  const images = (listing.imageUrls?.length ? listing.imageUrls : ["/placeholder.png"]).slice(0, 4);

  const price = listing.price ?? 0;
  const minOrderQty = listing.minOrderQty ?? 1;
  const stock = listing.stock ?? 0;
  const sellerId = listing.seller?.id ? String(listing.seller.id) : "";

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800">
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Gallery images={images} title={listing.title} />
          <section className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            {listing.desc && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.desc}
              </p>
            )}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>السعر: <span className="font-semibold text-gray-900">ر․س {price}</span></div>
              <div>الحد الأدنى: <span className="font-medium">{minOrderQty}</span></div>
              <div>المخزون: <span className="font-medium">{stock}</span></div>
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
