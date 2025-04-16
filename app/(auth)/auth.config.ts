/**
 * ** AUTHENTICATION CONFIGURATION **
 * 
 * This file defines the configuration settings for NextAuth.js authentication.
 * 
 * Key functionalities:
 * - Specifies custom login and registration pages
 * - Implements route protection through authorized callback
 * - Handles redirection logic based on authentication state
 * - Controls access to protected and public routes
 * - Manages navigation flow for authenticated/unauthenticated users
 * - Separates configuration from implementation for environment compatibility
 * 
 * This configuration file doesn't include provider implementation details
 * to remain compatible with non-Node.js environments like Edge runtime.
 * Actual provider setup happens in auth.ts where Node.js dependencies can be used.
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
