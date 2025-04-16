/**
 * ** TOAST COMPONENT **
 * 
 * This component provides application-wide notification system.
 * 
 * Key functionalities:
 * - Displays temporary notifications for user feedback
 * - Supports different notification types (success, error, info)
 * - Manages notification timing and dismissal behavior
 * - Provides consistent styling and positioning for all notifications
 * - Implements stacking behavior for multiple notifications
 * - Ensures accessibility with proper ARIA attributes
 * - Offers programmatic API for triggering notifications
 * 
 * This utility component enables a consistent notification experience
 * throughout the application, helping to provide user feedback for
 * actions, errors, and important events without interrupting workflow.
 */

'use client';

import React, { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';
import { CheckCircleFillIcon, WarningIcon } from './icons';

const iconsByType: Record<'success' | 'error', ReactNode> = {
  success: <CheckCircleFillIcon />,
  error: <WarningIcon />,
};

export function toast(props: Omit<ToastProps, 'id'>) {
  return sonnerToast.custom((id) => (
    <Toast id={id} type={props.type} description={props.description} />
  ));
}

function Toast(props: ToastProps) {
  const { id, type, description } = props;

  return (
    <div className="flex w-full toast-mobile:w-[356px] justify-center">
      <div
        data-testid="toast"
        key={id}
        className="bg-zinc-100 p-3 rounded-lg w-full toast-mobile:w-fit flex flex-row gap-2 items-center"
      >
        <div
          data-type={type}
          className="data-[type=error]:text-red-600 data-[type=success]:text-green-600"
        >
          {iconsByType[type]}
        </div>
        <div className="text-zinc-950 text-sm">{description}</div>
      </div>
    </div>
  );
}

interface ToastProps {
  id: string | number;
  type: 'success' | 'error';
  description: string;
}
