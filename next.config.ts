import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Vercel will set NEXTAUTH_URL automatically in production
  // Only use http://localhost:3000 in development

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // Optimize package imports for smaller bundles
  experimental: {
    optimizePackageImports: [
      "recharts",
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },

  // Dev-only: allow preview panel origins (space-z.ai iframe)
  ...(process.env.NODE_ENV === "development" && {
    turbopack: { root: ".." },
    allowedDevOrigins: [
      "localhost",
      "127.0.0.1",
      "*.space-z.ai",
      "http://*.space-z.ai",
      "https://*.space-z.ai",
    ],
  }),

  // Security headers + CORS (applied to all responses)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
