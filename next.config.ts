import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "topmate.io"
      },
      {
        protocol: "https",
        hostname: "www.python.org"
      }
    ]
  },
  trailingSlash: true
};

export default nextConfig;
