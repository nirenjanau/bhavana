const path = require("path");

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
    // Prevent duplicate React instances in monorepo builds.
    // When NODE_ENV=development is set externally, Next.js can load both
    // prod and dev runtime bundles, creating two React copies that break
    // useContext. Force all React resolution to a single copy.
    config.resolve.alias = {
      ...config.resolve.alias,
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
    };
    return config;
  },
};

module.exports = nextConfig;
