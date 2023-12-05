export const JWT_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export const authRoutes = {
  signIn: ["/sign-in", "/login", "/signin"],
  signUp: ["/sign-up", "/register", "/signup"],
  redirectAfterSignIn: "/examples/profile",
  redirectOnUnhauthorized: "/sign-in",
}
