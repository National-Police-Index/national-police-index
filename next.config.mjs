/** @type {import('next').NextConfig} */
const config = {
  images: {
    domains: ["images.squarespace-cdn.com"],
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

export default config;
