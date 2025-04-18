import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  sassOptions: {
    prependData: `@import "app/_functions.scss"; @import "app/_variables.scss";`,
  },
};

export default nextConfig;
