import NextAuth from "next-auth";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-auth-secret"),
  providers: [],
  session: {
    strategy: "jwt"
  },
  trustHost: true
});
