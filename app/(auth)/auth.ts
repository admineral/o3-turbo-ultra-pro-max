/**
 * ** AUTHENTICATION CORE **
 * 
 * This file implements the core authentication functionality using NextAuth.js.
 * 
 * Key functionalities:
 * - Configures and extends NextAuth with credential-based authentication
 * - Implements password comparison using bcrypt
 * - Validates user credentials against database records
 * - Exports auth handlers for API routes (GET, POST)
 * - Provides auth() function for server-side authentication checks
 * - Manages JWT token and session handling
 * - Extends session with user ID for database operations
 * 
 * This file connects the authentication configuration with the database,
 * handling the actual validation logic and session management that
 * powers the application's security model.
 */

import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser } from '@/lib/db/queries';

import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        if (!process.env.POSTGRES_URL) {
          // If no database, always return a valid user
          return {
            id: 'dev-user-id',
            email: 'dev@example.com',
          };
        }
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].password!);
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
