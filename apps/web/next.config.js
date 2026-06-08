/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    // In a monorepo build, npm can hoist an older React (18.2.x, from
    // Next.js's peer-dep range) to the root node_modules while
    // apps/web/node_modules has 18.3.x. dedupe tells webpack to always
    // resolve to a single copy — the first one it finds when walking up
    // from apps/web, which is the correct 18.3.x.
    config.resolve.dedupe = ["react", "react-dom"];
    return config;
  },
};

module.exports = nextConfig;
