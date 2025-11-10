import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
    ],
  },
  sassOptions: {
    prependData: `@import "app/_functions.scss"; @import "app/_variables.scss";`,
    implementation: "sass-embedded",
  },
  async rewrites() {
    return [
      {
        source: "/agencies/:state/:id",
        destination: "/agencies/:id",
      },
      {
        source: "/officers/:state/:agency/:personNbr/:full_name",
        destination: "/officers/:personNbr/:full_name",
      },
    ];
  },
};

export default nextConfig;
