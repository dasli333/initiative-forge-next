import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'output: export' to support dynamic routing
  // App is still SPA (all components use 'use client')
  // but with proper Next.js routing support

  // Keep image optimization disabled for simplicity
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
