import { notFound } from "next/navigation";
import { getListings, getListingById, type Listing } from "@/lib/api";
import EditListingForm from "./EditListingForm";

// نخلي الصفحة static قابلة للتصدير
export const revalidate = 60;

/**
 * نولّد كل IDs للإعلانات عشان Next يعمل
 * ملفات static لها ولصفحة الإيدت.
 */
export async function generateStaticParams() {
  const listings = await getListings().catch(() => []);
  return (listings || []).map((l: any) => ({ id: String(l?.id) }));
}

type PageProps = { params: { id: string } };

export default async function EditListingPage({ params }: PageProps) {
  const listing = (await getListingById(params.id).catch(() => null)) as Listing | null;

  if (!listing) {
    notFound();
  }

  const cleanedImages = (listing.imageUrls || [])
    .filter((u) => typeof u === "string" && u.trim() !== "")
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[rgb(255,247,232)] text-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Listing</h1>

        <EditListingForm
          listingId={String(listing.id)}
          ownerId={listing.seller?.id ?? ""}
          initial={{
            title: listing.title,
            desc: listing.desc ?? "",
            price: listing.price,
            minOrderQty: listing.minOrderQty,
            stock: listing.stock,
            imageUrls: cleanedImages,
          }}
        />
      </div>
    </div>
  );
}
