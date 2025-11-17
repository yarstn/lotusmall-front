// app/layout.tsx
import "./globals.css";
import Header from "@/components/header";
import type { Metadata } from "next";


export const metadata: Metadata = {
  metadataBase: new URL("https://lotusmall.shop"),
  title: {
    default: "Lotus Mall – Wholesale & Retail Marketplace",
    template: "%s | Lotus Mall",
  },
  description:
    "Lotus Mall is an online platform that connects wholesalers, retailers, shop owners, and consumers, allowing them to buy products from Vietnam and other countries at competitive prices.",
  openGraph: {
    title: "Lotus Mall – Wholesale & Retail Marketplace",
    description:
      "A modern shopping platform that simplifies communication between sellers and buyers and allows ordering both bulk and single quantities easily.",
    url: "https://lotusmall.shop",
    siteName: "Lotus Mall",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* مهم للجوال */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className="min-h-screen bg-[rgb(255,247,232)] text-gray-800 flex flex-col overflow-x-hidden">
        <Header />
        {/* نترك توزيع الأعمدة داخل الصفحات نفسها */}
        <main className="flex-1 w-full">{children}</main>

        <footer className="border-t bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} - جميع الحقوق محفوظة
          </div>
        </footer>
      </body>
    </html>
  );
}
