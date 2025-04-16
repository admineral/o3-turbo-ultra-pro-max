# Authentication System

This document explains the authentication system implemented in the `(auth)` route group.

## Overview

The authentication system uses NextAuth.js to provide secure user authentication with credential-based login. The implementation is structured across multiple files to ensure compatibility with various environments and maintain separation of concerns.

## Key Files

### auth.config.ts

- Contains base configuration for NextAuth.js
- Defines custom pages for sign-in and registration
- Implements authentication logic for route protection
- Handles redirection based on authentication state
- Keeps provider configuration separate for environment compatibility

### auth.ts

- Extends the base configuration with actual implementations
- Sets up credential-based authentication
- Connects to the database for user verification
- Implements password comparison with bcrypt
- Manages JWT tokens and sessions
- Extends user sessions with database IDs

### actions.ts

- Implements server-side actions for login and registration
- Uses Zod for form validation
- Provides type-safe state management for auth operations
- Handles user creation and credential verification
- Manages authentication errors and feedback

## Authentication Flow

1. **Registration**:
   - User submits email and password
   - Form data is validated with Zod schema
   - System checks if user already exists
   - If not, creates a new user with hashed password
   - Automatically signs in the new user

2. **Login**:
   - User submits credentials
   - Form data is validated with Zod schema
   - Credentials are passed to NextAuth
   - System fetches user from database by email
   - Passwords are compared using bcrypt
   - On success, JWT token and session are created

3. **Route Protection**:
   - Each route's access is checked via the `authorized` callback
   - Authenticated users are redirected from login/register pages
   - Unauthenticated users are redirected from protected routes
   - Public routes remain accessible to all

## Integration with the Rest of the Application

The authentication system provides:

- `auth()` function used throughout the application to verify user sessions
- User context including ID for database operations
- Session information for conditional UI rendering
- Protection for routes that require authentication

The system is designed to be secure, user-friendly, and compatible with both server and client components in Next.js App Router. 