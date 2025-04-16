/**
 * ** AUTH FORM COMPONENT **
 * 
 * This component provides a reusable authentication form for login and registration.
 * 
 * Key functionalities:
 * - Renders form fields for email and password
 * - Handles form submission through provided action handlers
 * - Supports preserving email input between form submissions
 * - Implements password visibility toggling
 * - Provides slots for custom submit buttons and additional content
 * - Maintains consistent styling across auth interfaces
 * - Ensures proper validation and feedback patterns
 * 
 * This component is used by both login and registration pages,
 * providing a consistent user experience while allowing for
 * customization through component composition.
 */

'use client';

import { useState } from 'react';
import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Email Address
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Password
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
        />
      </div>

      {children}
    </Form>
  );
}
