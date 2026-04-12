import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [], // To be populated in auth.ts to keep Edge compatibility
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verificationStatus = user.verificationStatus;
        token.collegeId = user.collegeId;
        token.batchId = user.batchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verificationStatus = token.verificationStatus as string;
        session.user.collegeId = token.collegeId as string | null;
        session.user.batchId = token.batchId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
