import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "192.168.1.7"
  ],
  // The site is fully client-rendered (GSAP/Lenis, all 'use client'), with a
  // single prerenderable route — so we ship it as a static export and serve it
  // as plain CDN files (no serverless runtime needed).
  // output: "export",
  images: {
    // next/image can't run the optimizer on a static host; serve sources as-is.
    unoptimized: true,
  },
};

export default nextConfig;
