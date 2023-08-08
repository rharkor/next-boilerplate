import withBundleAnalyzer from "@next/bundle-analyzer"
import withPlugins from "next-compose-plugins"
import { env } from "./env.mjs"

/**
 * @type {import('next').NextConfig}
 */
const config = withPlugins([[withBundleAnalyzer({ enabled: env.ANALYZE })]], {
  reactStrictMode: true,
  experimental: { instrumentationHook: true },
  rewrites() {
    return [
      { source: "/healthz", destination: "/api/health" },
      { source: "/api/healthz", destination: "/api/health" },
      { source: "/health", destination: "/api/health" },
      { source: "/ping", destination: "/api/health" },
      { source: "/api/ping", destination: "/api/health" },
      { source: "/login", destination: "/sign-in" },
      { source: "/signin", destination: "/sign-in" },
      { source: "/register", destination: "/sign-up" },
      { source: "/signup", destination: "/sign-up" },
    ]
  },
  compiler: {
    styledComponents: true,
  },
})

export default config
