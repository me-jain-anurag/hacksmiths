import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";
import { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

type AppRole = "admin" | "client";
type AppUser = User & { role?: AppRole };
type RoleToken = JWT & { role?: AppRole };
type RoleSessionUser = NonNullable<Session["user"]> & { role?: AppRole };

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "client-credentials",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<"email" | "password", string>) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await prisma.client.findUnique({ where: { email: credentials.email } });
        if (client && client.password && (await bcrypt.compare(credentials.password, client.password))) {
          return { id: client.id.toString(), email: client.email, role: "client" };
        }
        return null;
      },
    }),

    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<"email" | "password", string>) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await prisma.admin.findUnique({ where: { email: credentials.email } });
        if (admin && (await bcrypt.compare(credentials.password, admin.password))) {
          return { id: admin.id.toString(), email: admin.email, role: "admin" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      const typedToken = token as RoleToken;
      const typedUser = user as AppUser | undefined;
      if (typedUser?.role) typedToken.role = typedUser.role;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      const typedToken = token as RoleToken;
      if (session.user) {
        (session.user as RoleSessionUser).role = typedToken.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login/client", // Default page to redirect to on login errors
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };