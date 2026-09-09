import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities declared here. Two values, deliberately:
    // every shared cache entry is one of these, and adding a third silently
    // triples the number of variants the optimizer stores.
    qualities: [45, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
