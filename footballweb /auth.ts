import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { IdentityProvider } from "@prisma/client";

import { ensureUserByEmail } from "@/lib/auth/user-provisioning";

const isGoogleAuthEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email",
    credentials: {
      email: {
        label: "Email",
        type: "email"
      },
      display_name: {
        label: "Display name",
        type: "text"
      }
    },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const displayName = typeof credentials?.display_name === "string" ? credentials.display_name.trim() : "";

      if (!email) {
        return null;
      }

      const user = await ensureUserByEmail(email, displayName || null);

      return {
        id: user.id,
        email: user.email,
        name: user.display_name
      };
    }
  })
];

if (isGoogleAuthEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    })
  );
}

const authConfig = {
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-auth-secret"),
  providers,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";

        if (!email) {
          return false;
        }

        const displayName = typeof user.name === "string" ? user.name : null;
        const providerSubject =
          account.providerAccountId ||
          (profile && typeof profile.sub === "string" ? profile.sub : null) ||
          email;

        await ensureUserByEmail(email, displayName, {
          provider: IdentityProvider.google,
          providerSubject
        });
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && typeof token.email === "string") {
        const providerSubject =
          account.providerAccountId ||
          (profile && typeof profile.sub === "string" ? profile.sub : null) ||
          token.email;
        const dbUser = await ensureUserByEmail(token.email, typeof token.name === "string" ? token.name : null, {
          provider: IdentityProvider.google,
          providerSubject
        });

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.display_name;

        return token;
      }

      if (user?.id) {
        token.id = user.id;
      }

      if (user?.name) {
        token.name = user.name;
      }

      if (!token.id && typeof token.email === "string") {
        const dbUser = await ensureUserByEmail(token.email, typeof token.name === "string" ? token.name : null);

        token.id = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.display_name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }

      if (session.user && typeof token.name === "string") {
        session.user.name = token.name;
      }

      return session;
    }
  },
  trustHost: true
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
export { isGoogleAuthEnabled };
