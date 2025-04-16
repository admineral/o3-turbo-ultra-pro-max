/**
 * ** SIDEBAR TOGGLE COMPONENT **
 * 
 * This component provides controls for expanding and collapsing the sidebar.
 * 
 * Key functionalities:
 * - Toggles sidebar visibility state
 * - Provides clear visual indication of current sidebar state
 * - Implements responsive behavior for different screen sizes
 * - Integrates with the global sidebar context
 * - Offers keyboard accessibility for navigation
 * - Displays tooltips explaining the toggle action
 * - Maintains consistent appearance with application design
 * 
 * This component enhances the application's usability by allowing
 * users to maximize available screen space when needed while
 * providing easy access to navigation elements.
 */

'use client';

import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { SidebarLeftIcon } from './icons';
import { Button } from './ui/button';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={toggleSidebar}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <SidebarLeftIcon size={16} />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle Sidebar</TooltipContent>
    </Tooltip>
  );
}
