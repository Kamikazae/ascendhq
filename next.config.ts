import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly tell Next.js to use src directory
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  typescript: {
    // Ensure TypeScript compilation works on Vercel
    tsconfigPath: './tsconfig.json',
  },
  experimental: {
    // Ensure proper module resolution
    esmExternals: true,
  },
};

export default nextConfig;
