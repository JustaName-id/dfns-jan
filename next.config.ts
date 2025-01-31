import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dfns/sdk-browser"],
};

export default nextConfig;
