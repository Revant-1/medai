import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.module.rules.push({
        test: /\.js$/,
        include: /node_modules\/recharts/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      });
    }
    return config;
  },
  images: {
    domains: ['i.postimg.cc', 'rfdkrbtbidsmxych.public.blob.vercel-storage.com'],

  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*', // Modify if needed
      },
    ];
  },
};

export default nextConfig;
