/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'mssql': 'commonjs mssql',
        'tedious': 'commonjs tedious'
      })
    }
    
    // Handle node: protocol imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "stream": false,
      "url": false,
      "util": false,
      "crypto": false,
      "fs": false,
      "path": false,
      "os": false,
      "net": false,
      "tls": false,
      "child_process": false
    }
    
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['mssql', 'tedious']
  }
}

export default nextConfig
