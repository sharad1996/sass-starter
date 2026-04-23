import type { NextConfig } from "next";

/** Used by rewrites to proxy `/api/v1/*` to Express (same-origin cookies in the browser). */
const internalApiBase = (process.env.INTERNAL_API_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/favicon.svg" },
      { source: "/api/v1/:path*", destination: `${internalApiBase}/v1/:path*` },
    ];
  },
};

export default nextConfig;
