/**
 * ** THEME PROVIDER GLOBAL CONTEXT **
 * 
 * This component provides global theming context for the entire application.
 * 
 * Key functionalities:
 * - Manages theme state (light/dark) globally
 * - Provides theme switching capabilities to all components
 * - Persists theme preferences across sessions
 * - Supports system preference detection and matching
 * - Enables consistent theming throughout the application
 * - Wraps the Next.js theme provider with application-specific settings
 * - Applies theme changes without page reloads
 * 
 * This global context provider ensures consistent theming across
 * the entire application with minimal implementation overhead.
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
