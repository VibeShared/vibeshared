import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
    },
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
    },
    {
      protocol: "https",
      hostname: "cdn-icons-png.flaticon.com",
    },
  ],
}
};

export default nextConfig;
