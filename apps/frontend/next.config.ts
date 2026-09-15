import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:5279"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
