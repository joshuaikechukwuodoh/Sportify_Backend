import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      // send email with link to reset password
    },
    disableSignUp: true,
  },
  roles: {
    admin: {
      name: "admin",
      permissions: ["all"],
    },
  },
});
