import { notFound } from "next/navigation";
import { getListings, getListingById, type Listing } from "@/lib/api";
import EditListingForm from "./EditListingForm";

/**
 * لازم نولّد كل الـ IDs وقت الـ build لأن عندك output: "export".
 * نخزن فقط { id } كسلاسل نصية.
 */
export async function generateStaticParams() {
  const listings = await getListings().catch(() => []);
  return (listings || []).map((l: any) => ({ id: String(l?.id) }));
}

// يسمح بإعادة التحميل أثناء التطوير (ممكن تخليه >0 في الإنتاج)
export const revalidate = 0;

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = (await getListingById(params.id).catch(() => null)) as
    | Listing
    | null;

  if (!listing) {
    notFound();
  }

  // نظّف الصور قبل تمريرها للفورم (لا نسمح بقيم فاضية) وخذي حتى 4 فقط
  const cleanedImages = (listing.imageUrls || [])
    .filter((u) => typeof u === "string" && u.trim() !== "")
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>

        <EditListingForm
          listingId={String(listing.id)}
          initial={{
            title: listing.title,
            desc: listing.desc ?? "",
            price: listing.price,
            minOrderQty: listing.minOrderQty,
            stock: listing.stock,
            imageUrls: cleanedImages,
          }}
          ownerId={listing.seller?.id ?? ""}
        />
      </div>
    </div>
  );
}
