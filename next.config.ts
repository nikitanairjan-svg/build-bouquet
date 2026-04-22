import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  srcDir: "src",
  allowedDevOrigins: ['192.168.1.7'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;