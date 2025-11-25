/** @type {import('next').NextConfig} */
const config = {
  images: {
    domains: ["images.squarespace-cdn.com"],
  },
  async rewrites() {
    return [
      {
        source: "/agencies/:state/:id",
        destination: "/states/:state/:id",
      },
      {
        source: "/officers/:state/:personNbr/:full_name",
        destination: "/officers/:personNbr/:full_name?state=:state",
      },
    ];
  },
};

export default config;
