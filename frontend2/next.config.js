/** @type {import('next').NextConfig} */
const nextConfig = {
  // Our fabric.js canvas breaks in strict mode
  reactStrictMode: false,
  webpack: (config) => {
    // This is required to make fabric.js work in Next
    config.externals = [...config.externals, "canvas", "jsdom"];
    return config;
  },
  eslint: {
    // Disable ESLint during build since we have a separate step for linting in our CI workflow
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
