import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        pathname: "/**",
      },
    ],
  },

  env: {
    NEXT_PUBLIC_APP_NAME: "VibeShared",
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
