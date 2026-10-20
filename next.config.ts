import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Next 16 requires an explicit allow-list of optimisable qualities.
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", port: "", pathname: "/s/**" },
      { protocol: "https", hostname: "*.myshopify.com", port: "", pathname: "/cdn/shop/**" },
      { protocol: "https", hostname: "shopify.com", port: "", pathname: "/cdn/shop/**" },
    ],
  },
};

export default nextConfig;
