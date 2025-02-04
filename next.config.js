/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['view-eventure.s3.ap-south-1.amazonaws.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
