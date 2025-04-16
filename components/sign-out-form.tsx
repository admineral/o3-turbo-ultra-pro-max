/**
 * ** SIGN OUT FORM COMPONENT **
 * 
 * This component provides the logout functionality for authenticated users.
 * 
 * Key functionalities:
 * - Handles user sign-out process securely
 * - Implements form-based submission for proper CSRF protection
 * - Provides visual feedback during sign-out process
 * - Integrates with Next.js authentication system
 * - Maintains consistent styling with application design
 * - Ensures proper session cleanup on logout
 * - Supports navigation after successful sign-out
 * 
 * This component enables users to securely end their authenticated
 * sessions, properly clearing credentials and session data.
 */

import Form from 'next/form';

import { signOut } from '@/app/(auth)/auth';

export const SignOutForm = () => {
  return (
    <Form
      className="w-full"
      action={async () => {
        'use server';

        await signOut({
          redirectTo: '/',
        });
      }}
    >
      <button
        type="submit"
        className="w-full text-left px-1 py-0.5 text-red-500"
      >
        Sign out
      </button>
    </Form>
  );
};
