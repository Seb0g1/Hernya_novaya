import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production"
    ? "dev-only-secret-min-32-characters-long!!"
    : undefined);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: authSecret,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const { prisma } = await import("@/lib/prisma");
          const email = String(credentials.email).toLowerCase();
          const user = await prisma.adminUser.findUnique({
            where: { email },
          });
          if (!user) return null;
          const ok = await bcrypt.compare(
            String(credentials.password),
            user.passwordHash,
          );
          if (!ok) return null;
          return { id: user.id, email: user.email };
        } catch (e) {
          if (process.env.NODE_ENV === "development") {
            console.error("[auth] Вход: ошибка БД (проверьте DATABASE_URL):", e);
          }
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  trustHost: true,
});
