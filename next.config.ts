import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
    ],
  },
  sassOptions: {
    prependData: `@import "app/_functions.scss"; @import "app/_variables.scss";`,
    implementation: 'sass-embedded',
  },
};

export default nextConfig;
