import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
  remotePatterns: [
    {
       protocol: "https",
        hostname: "res.cloudinary.com",
         port: '', // leave empty
        pathname: '/**', // allow all paths
    },
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
    },
    {
      protocol: "https",
      hostname: "cdn-icons-png.flaticon.com",
    },
    {
      protocol: 'https',
      hostname: 'pbs.twimg.com',
      pathname: '/**', // allow all Twitter profile image paths
    },
     {
        protocol: 'http',
        hostname: 'localhost', // Allows localhost for development
        port: '3000',
      },
  ],
}
};

export default nextConfig;
