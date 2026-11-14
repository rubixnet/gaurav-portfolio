import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  allowedDevOrigins: ['172.27.78.217'],
};

export default nextConfig;
