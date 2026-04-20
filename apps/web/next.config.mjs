/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ["sqlite3"],
  },
};

export default nextConfig;
