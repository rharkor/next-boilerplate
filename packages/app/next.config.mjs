/**
 * @type {import('next').NextConfig}
 */
const config = {
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
  redirects() {
    //? Permanent redirects only in prod env
    return [
      { source: "/signin", destination: "/sign-in", permanent: process.env.ENV === "production" ? true : false },
      { source: "/login", destination: "/sign-in", permanent: process.env.ENV === "production" ? true : false },
      { source: "/signup", destination: "/sign-up", permanent: process.env.ENV === "production" ? true : false },
      { source: "/register", destination: "/sign-up", permanent: process.env.ENV === "production" ? true : false },

      {
        source: "/:lang/signin",
        destination: "/:lang/sign-in",
        permanent: process.env.ENV === "production" ? true : false,
      },
      {
        source: "/:lang/login",
        destination: "/:lang/sign-in",
        permanent: process.env.ENV === "production" ? true : false,
      },
      {
        source: "/:lang/signup",
        destination: "/:lang/sign-up",
        permanent: process.env.ENV === "production" ? true : false,
      },
      {
        source: "/:lang/register",
        destination: "/:lang/sign-up",
        permanent: process.env.ENV === "production" ? true : false,
      },
    ]
  },
}

export default config
