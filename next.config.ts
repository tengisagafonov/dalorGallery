import type { NextConfig } from "next";

const strapiUrl = new URL(process.env.STRAPI_URL ?? "http://127.0.0.1:1337");
const isLocalStrapi = ["127.0.0.1", "localhost"].includes(strapiUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isLocalStrapi,
    remotePatterns: [
      {
        protocol: strapiUrl.protocol === "https:" ? "https" : "http",
        hostname: strapiUrl.hostname,
        port: strapiUrl.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
