/**
 * ** ARTIFACT CLOSE BUTTON COMPONENT **
 * 
 * This component provides the functionality to close the artifact sidebar.
 * 
 * Key functionalities:
 * - Handles artifact visibility toggling
 * - Resets artifact state when closing
 * - Preserves artifact state during streaming operations
 * - Provides consistent closing behavior across artifact types
 * - Integrates with the global artifact context
 * - Implements optimized rendering with memoization
 * - Offers clear visual indicator for closing action
 * 
 * This component provides a simple but essential user control for
 * managing the workspace layout by allowing users to hide the
 * artifact sidebar when not needed.
 */

import { memo } from 'react';
import { CrossIcon } from './icons';
import { Button } from './ui/button';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setArtifact((currentArtifact) =>
          currentArtifact.status === 'streaming'
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: 'idle' },
        );
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
