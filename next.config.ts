import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'beta.soldoutafrica.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kong-c7447f26ccus2ngvp.kongcloud.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
