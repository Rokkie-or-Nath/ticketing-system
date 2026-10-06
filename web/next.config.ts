import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow the dev server to be opened from another device on the LAN
   * (e.g. http://192.168.137.1:3000) without Next.js blocking its HMR /
   * dev resources as a cross-origin request. Update the IP if it changes.
   *
   * Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: ["192.168.137.1"],
};

export default nextConfig;
