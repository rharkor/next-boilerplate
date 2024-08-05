export const SESSION_MAX_AGE = 360 * 24 * 60 * 60 // 360 days

export const authRoutes = {
  signIn: ["/sign-in", "/login", "/signin"],
  signUp: ["/sign-up", "/register", "/signup"],
  redirectAfterSignIn: "/examples/profile",
  redirectOnUnhauthorized: "/sign-in",
}

export const minPasswordLength = 8
export const maxPasswordLength = 25
