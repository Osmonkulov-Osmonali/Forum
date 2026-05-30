/** @type {import('next').NextConfig} */
const nextConfig = {
  // Three.js ecosystem packages ship as ESM-only — must be transpiled by Next.js
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
    "postprocessing",
  ],

  images: {
    // Image optimization enabled (was unoptimized: true — that kills Lighthouse LCP scores)
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Vercel Blob storage (speaker photos uploaded via admin)
      { protocol: "https", hostname: "*.vercel-storage.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Placeholder avatars (team photos)
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
    // Reasonable device sizes for mobile-first
    deviceSizes: [320, 420, 640, 768, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Long-lived cache for Next.js static chunks
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
