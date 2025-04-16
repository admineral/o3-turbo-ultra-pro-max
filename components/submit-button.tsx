/**
 * ** SUBMIT BUTTON COMPONENT **
 * 
 * This component provides an enhanced submit button with state feedback.
 * 
 * Key functionalities:
 * - Displays appropriate visual state (idle, loading, success)
 * - Shows loading spinner during form submission
 * - Provides success animation on completion
 * - Prevents multiple submissions during processing
 * - Maintains consistent styling with application design
 * - Supports custom children for flexible labeling
 * - Enhances user feedback during form interactions
 * 
 * This component improves form submission UX by providing
 * clear visual feedback about the current submission state.
 */

'use client';

import { useFormStatus } from 'react-dom';

import { LoaderIcon } from '@/components/icons';

import { Button } from './ui/button';

export function SubmitButton({
  children,
  isSuccessful,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type={pending ? 'button' : 'submit'}
      aria-disabled={pending || isSuccessful}
      disabled={pending || isSuccessful}
      className="relative"
    >
      {children}

      {(pending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? 'Loading' : 'Submit form'}
      </output>
    </Button>
  );
}
