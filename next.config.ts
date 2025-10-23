import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static export (SPA mode)

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
