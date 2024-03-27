import bunldeAnalyzer from "@next/bundle-analyzer"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: "standalone",
  reactStrictMode: true,
  rewrites() {
    return [
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
      { source: "/api/ping", destination: "/api/health" },
    ]
  },
}

const withBundleAnalyzer = bunldeAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

export default withBundleAnalyzer(config)
