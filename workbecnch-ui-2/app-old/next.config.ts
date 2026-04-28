import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? "dist" : ".next",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
