/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'platform-lookaside.fbsbx.com',
            port: '',
            pathname: '/platform/profilepic/**',
          },
          {
            protocol: 'https',
            hostname: 'i.scdn.co',
            port: '',
            pathname: '/image/**',
          },
        ],
      },
};

export default nextConfig;