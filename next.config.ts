import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves from /Meal-Builder-/ subdirectory
  basePath: "/Meal-Builder-",
  images: {
    // Next.js image optimisation requires a server; disable for static export
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
