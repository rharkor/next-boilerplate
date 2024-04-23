/* eslint-disable no-process-env */
import bunldeAnalyzer from "@next/bundle-analyzer"

/**
 * @type {import('next').NextConfig}
 */
let config = {
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

config = process.env.ANALYZE === "true" ? bunldeAnalyzer()(config) : config

export default withBundleAnalyzer(config)
