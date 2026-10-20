import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryNav, CategoryNavFallback } from "@/components/layout/category-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { CartProvider } from "@/lib/cart/cart-provider";
import { WishlistProvider } from "@/lib/wishlist/wishlist-provider";
import { siteConfig } from "@/lib/config/site";
import { getSiteUrl } from "@/lib/config/env";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-homekart-sans",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-homekart-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.fullName} — Everything for a Better Home`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.shortDescription,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.fullName,
    title: `${siteConfig.fullName} — Everything for a Better Home`,
    description: siteConfig.shortDescription,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: siteConfig.name, description: siteConfig.shortDescription },
  icons: { icon: "/brand/homekart-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#D36946",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-warm-white text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <CartProvider>
          <WishlistProvider>
            <SiteHeader />
            <div className="sticky top-0 z-40">
              <Suspense fallback={<CategoryNavFallback />}>
                <CategoryNav />
              </Suspense>
            </div>
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
