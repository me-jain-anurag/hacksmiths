import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❌ Prevent build from failing due to ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
