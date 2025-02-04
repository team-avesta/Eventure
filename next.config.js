/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['view-eventure.s3.ap-south-1.amazonaws.com'],
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

module.exports = nextConfig;
