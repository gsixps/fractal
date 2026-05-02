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
    "*.space-z.ai",
    "http://*.space-z.ai",
    "https://*.space-z.ai",
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion", "lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
