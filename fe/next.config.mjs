const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const apiOrigin = new URL(apiBaseUrl).origin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: new URL(apiOrigin).protocol.replace(":", ""),
        hostname: new URL(apiOrigin).hostname,
        port: new URL(apiOrigin).port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
