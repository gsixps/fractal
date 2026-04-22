import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ".space.z.ai",
  ],
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion", "lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
