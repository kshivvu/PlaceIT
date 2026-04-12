import { DefaultSession } from "next-auth"

// We're reaching into NextAuth's own type system and
// adding our custom fields to it.
// The "declare module" syntax says: 
// "find this module's existing types and extend them"
declare module "next-auth" {

  // Session is what you get back when you call auth()
  // We're saying: session.user has ALL the default fields
  // (name, email, image) PLUS our custom ones below
  interface Session {
    user: {
      id: string
      role: string
      verificationStatus: string
      collegeId: string | null  // null because faculty/coordinators have no batch
      batchId: string | null    // null because not every user has a batch
    } & DefaultSession["user"] // & means "merge with" — keeps name, email, image
  }

  // This extends the User type that flows through the
  // jwt callback — the object returned from authorize()
  // Without this, token.role would throw a TS error too
  interface User {
    role: string
    verificationStatus: string
    collegeId: string | null
    batchId: string | null
  }
}

// This extends the JWT token type
// Without this, writing token.role in the jwt callback throws an error
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    verificationStatus: string
    collegeId: string | null
    batchId: string | null
  }
}