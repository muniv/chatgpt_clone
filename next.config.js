const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

const withPWA = require("next-pwa")({
  dest: "public"
})

module.exports = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    // Netlify 배포 최적화
    trailingSlash: true,
    output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost"
        },
        {
          protocol: "http",
          hostname: "127.0.0.1"
        },
        {
          protocol: "https",
          hostname: "**"
        },
        {
          protocol: "https",
          hostname: "oaidalleapiprodscus.blob.core.windows.net"
        }
      ]
    },
    experimental: {
      serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
    },
    // API Routes를 Netlify Functions로 변환
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: '/.netlify/functions/:path*'
        }
      ]
    }
  })
)
