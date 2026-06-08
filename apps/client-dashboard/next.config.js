/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Load static assets (CSS/JS) directly from the portal's own Vercel domain
  // so they are not broken when the page is proxied through www.bhavanastudio.com
  assetPrefix: process.env.ASSET_PREFIX ?? "",
  images: {
    // unoptimized: the browser fetches photos directly from their source URL
    // (localhost:9000 in dev, Cloudflare R2 in prod).
    // This avoids Next.js's server-side image proxy trying to reach MinIO
    // inside Docker where "localhost" resolves to the container itself.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http",  hostname: "localhost" },
      { protocol: "http",  hostname: "minio" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.bhavanastudio.com" },
    ],
  },
};

module.exports = nextConfig;
