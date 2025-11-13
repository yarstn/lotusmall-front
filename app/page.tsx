// app/page.tsx
import { getListings, type Listing } from "@/lib/api";
import BannerSlider from "@/components/BannerSlider";
import StatsStrip from "@/components/StatsStrip";

export const revalidate = 60;

type ListingEx = Listing & { sellerOrigin?: string };

export default async function HomePage() {
  let listings: ListingEx[] = [];
  try {
    listings = (await getListings()) as ListingEx[];
  } catch {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
        <p className="text-red-600">تعذّر جلب المنتجات. تأكدي أن السيرفر شغّال.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800 bg-[rgb(255,247,232)]">
      {/* ===== شريط إعلان متحرك (فيتنامي) ===== */}
      <div className="w-full border-y border-black/5 bg-gradient-to-r from-[#f9d67a] via-[#f5cd82] to-[#f2b564] text-gray-900 py-2">
        <div className="marquee-wrap">
          <div className="marquee-track font-semibold">
            <span>🇻🇳 Đây là nền tảng thương mại thử nghiệm miễn phí. • Đây là nền tảng thương mại thử nghiệm miễn phí. • Đây là nền tảng thương mại thử nghiệm miễn phí.</span>
            <span aria-hidden>🇻🇳 Đây là nền tảng thương mại thử nghiệm miễn phí. • Đây là nền tảng thương mại thử nghiệm miễn phí. • Đây là nền tảng thương mại thử nghiệm miễn phí.</span>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* تخطيط 3 أعمدة */}
          <div className="grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_16rem] gap-6">
            {/* العمود الأيسر */}
            <aside className="hidden lg:block space-y-6">
              <div className="rounded-[28px] p-5 shadow-lg bg-gradient-to-b from-[#f9d67a] via-[#f5cd82] to-[#f2b564]">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Categories</h3>
                <p className="text-sm text-gray-700 mb-4">Shop by category</p>
                <ul className="space-y-2 text-gray-800 font-medium">
                  <li>
                    <a href="/listings?origin=Vietnam" className="hover:underline">
                      🇻🇳 Products from Vietnam
                    </a>
                  </li>
                  <li><a href="#" className="hover:underline">👗 Traditional Wear</a></li>
                  <li><a href="#" className="hover:underline">👚 Western Wear</a></li>
                  <li><a href="#" className="hover:underline">🧥 Winter Wear</a></li>
                  <li><a href="#" className="hover:underline">💄 Beauty & Grooming</a></li>
                  <li><a href="#" className="hover:underline">💍 Jewellery</a></li>
                  <li><a href="#" className="hover:underline">⚡ Appliances</a></li>
                  <li><a href="#" className="hover:underline">🌍 International Brands</a></li>
                  <li><a href="#" className="hover:underline">👟 Footwear</a></li>
                  <li><a href="#" className="hover:underline">⌚ Watches</a></li>
                  <li><a href="#" className="hover:underline">🎒 Accessories</a></li>
                </ul>

                <a
                  href="#"
                  className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/10 hover:-translate-y-0.5 transition"
                >
                  Shop By Category
                </a>
              </div>

              <div className="rounded-[28px] p-5 shadow-lg bg-white border">
                <h4 className="font-semibold mb-3 text-gray-900">Trending Now</h4>
                <p className="text-sm text-gray-600">Catch the latest deals and drops.</p>
              </div>
            </aside>

            {/* المحتوى الرئيسي */}
            <section className="space-y-8">
              <BannerSlider />

              {/* بانرات */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-lg p-6 flex items-center justify-between text-white">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold truncate">Biggest Offer Revealed</h2>
                    <p className="text-lg">More deals inside up to 50% off</p>
                    <a href="#" className="text-white font-semibold underline">Wishlist Now →</a>
                  </div>
                  <img src="/banner.png" alt="banner" className="h-24 sm:h-28 md:h-32 object-contain" />
                </div>

                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 p-4 rounded-lg text-white font-medium">
                    Up to 30% Off – Hand Purses
                  </div>
                  <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-300 p-4 rounded-lg text-white font-medium">
                    Don’t miss the year end sale
                  </div>
                </div>
              </div>

              <StatsStrip />

              {/* المنتجات */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Deals of the Day</h3>
                {listings.length === 0 ? (
                  <div className="text-center text-gray-500">ما فيه منتجات حاليًا.</div>
                ) : (
                  <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {listings.map((item) => (
                      <div key={item.id} className="group">
                        <div className="relative rounded-xl bg-white">
                          <img
                            src={item.imageUrls?.[0] ?? "/placeholder.png"}
                            alt={item.title}
                            className="w-full h-44 sm:h-56 object-contain"
                          />
                          <span className="absolute -top-3 left-6 rounded-full bg-white text-gray-700 text-xs px-3 py-1 shadow">
                            Sale!
                          </span>
                          {item.sellerOrigin === "Vietnam" && (
                            <span className="absolute top-2 right-2 rounded-full bg-red-50 text-red-700 text-[11px] px-2 py-0.5 border border-red-200">
                              From Vietnam
                            </span>
                          )}
                        </div>

                        <div className="mt-3 text-xs sm:text-sm text-gray-500">
                          {item.category ?? "Smartwatches"}
                        </div>

                        <a
                          href={`/listings/${item.id}`}
                          className="block mt-1 text-gray-900 font-semibold hover:underline line-clamp-2"
                        >
                          {item.title}
                        </a>

                        <div className="mt-1 flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                          {"compareAtPrice" in item && (item as any).compareAtPrice ? (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ر․س {(item as any).compareAtPrice}
                            </span>
                          ) : null}
                          <span className="text-sm sm:text-base text-gray-900 font-semibold">ر․س {item.price}</span>
                        </div>

                        <div className="mt-3">
                          <a
                            href={`/listings/${item.id}#wishlist`}
                            className="inline-flex items-center gap-2 text-sm text-[#1E66F5]"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-.99-1.06a5.5 5.5 0 0 0-7.79 7.77L12 21.35l8.78-8.97a5.5 5.5 0 0 0 .06-7.77z"/>
                            </svg>
                            Add to Wishlist
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* العمود الأيمن */}
            <aside className="hidden lg:block space-y-6">
              <div className="rounded-[28px] p-5 shadow-lg bg-gradient-to-br from-[#f9d67a] via-[#f5cd82] to-[#f2b564]">
                <h4 className="font-semibold mb-2 text-gray-900">Recently Viewed</h4>
                <div className="rounded-2xl p-3 bg-white/70">
                  <img src="/thumb-3.png" alt="recent" className="h-28 mx-auto object-contain" />
                  <p className="text-sm text-center text-gray-700 mt-2">See your browsing history</p>
                </div>
                <a
                  href="#"
                  className="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.12)] ring-1 ring-black/10 hover:-translate-y-0.5 transition"
                >
                  Shop By Category
                </a>
              </div>

              <div className="rounded-[28px] p-5 shadow-lg bg-gradient-to-br from-[#f9d67a] via-[#f5cd82] to-[#f2b564] text-gray-900">
                <h4 className="font-semibold mb-2">Suggestions for You</h4>
                <div className="rounded-2xl p-3 bg-white/10">
                  <img src="/thumb-2png.png" alt="suggestion" className="h-20 mx-auto object-contain" />
                  <p className="text-sm text-center text-white/80 mt-2">Watch more</p>
                </div>
                <a
                  href="#"
                  className="mt-4 inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(0,0,0,0.25)] ring-1 ring-black/10 hover:-translate-y-0.5 transition"
                  style={{ backgroundColor: "rgb(245, 205, 130)" }}
                >
                  Shop By Category
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
