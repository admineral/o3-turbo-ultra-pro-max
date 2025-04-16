import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

// Bypass auth in development mode
const middleware = process.env.NODE_ENV === 'development' 
  ? () => null 
  : NextAuth(authConfig).auth;

export default middleware;

export const config = {
  matcher: ['/', '/:id', '/api/:path*', '/login', '/register'],
};
