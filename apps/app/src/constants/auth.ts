export const JWT_MAX_AGE = 90 * 24 * 60 * 60 // 90 days

export const authRoutes = {
  signIn: ["/sign-in", "/login", "/signin"],
  signUp: ["/sign-up", "/register", "/signup"],
  redirectAfterSignIn: "/examples/profile",
  redirectOnUnhauthorized: "/sign-in",
}

export const minPasswordLength = 8
export const maxPasswordLength = 25
