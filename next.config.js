const { getBTCServer, ORDERSERVER_HOST } = require('./src/config/btc-server')
const btcserver = getBTCServer()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['antd'],
  images: {
    formats: ['image/avif', 'image/webp']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false
      }
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding')

    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/oapi/:path*', // 捕获所有以 '/api/oapi' 开头的订单服务请求
        destination: ORDERSERVER_HOST + '/oapi/:path*' // 将请求代理到目标服务器
      },
      {
        source: '/api/btc/:path*', // 捕获所有以 '/api/btc' 开头的请求
        destination: btcserver + '/btc/:path*' // 将请求代理到目标服务器
      }
    ]
  }
}

module.exports = nextConfig
