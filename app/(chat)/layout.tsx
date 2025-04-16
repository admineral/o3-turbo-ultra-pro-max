/**
 * ** CHAT LAYOUT **
 * 
 * This component provides the shared layout structure for all chat-related pages.
 * 
 * Key functionalities:
 * - Loads Pyodide (Python in browser) for code execution capabilities
 * - Manages sidebar collapsed/expanded state using cookies
 * - Retrieves and provides authentication context to child components
 * - Implements the application's sidebar navigation structure
 * - Wraps child routes in a consistent layout interface
 * - Uses Next.js's experimental PPR (Partial Prerendering) for performance
 * 
 * This layout creates the consistent interface shell around all chat pages,
 * handling authentication state and navigational elements that persist
 * across different pages within the chat section of the application.
 */

import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
