import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password?.trim();
        if (!email || !password) return null;

        try {
          const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (res.status === 401) return null;
          if (!res.ok) throw new Error("API_ERROR");

          const data = await res.json() as {
            token: string;
            user: { id: string; email: string; name: string; role: string };
          };

          return {
            id: data.user.id,
            email: data.user.email ?? "",
            name: data.user.name,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch (err) {
          if (err instanceof Error && err.message === "API_ERROR") throw err;
          throw new Error("API_UNREACHABLE");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as { role?: string }).role ?? "";
        token.accessToken = (user as { accessToken?: string }).accessToken ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      session.user.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export type { Session } from "next-auth";
