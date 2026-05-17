import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "images.clerk.dev" },
      { hostname: "uploadthing.com" },
      { hostname: "utfs.io" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
