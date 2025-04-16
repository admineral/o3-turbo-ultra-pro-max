/**
 * ** CHAT VISIBILITY GLOBAL CONTEXT HOOK **
 * 
 * This hook provides global state management for chat visibility settings.
 * 
 * Key functionalities:
 * - Manages visibility state (private/public) for chat conversations
 * - Synchronizes local state with server using SWR cache
 * - Provides optimistic UI updates for visibility changes
 * - Handles server-side persistence through server actions
 * - Updates chat history cache to reflect visibility changes
 * - Maintains consistent visibility state across components
 * - Falls back to initial visibility when server data is unavailable
 * 
 * This hook enables components throughout the application to access and
 * modify chat visibility without prop drilling, while ensuring data
 * consistency between client and server states.
 */

'use client';

import { updateChatVisibility } from '@/app/(chat)/actions';
import { VisibilityType } from '@/components/visibility-selector';
import { Chat } from '@/lib/db/schema';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';

export function useChatVisibility({
  chatId,
  initialVisibility,
}: {
  chatId: string;
  initialVisibility: VisibilityType;
}) {
  const { mutate, cache } = useSWRConfig();
  const history: Array<Chat> = cache.get('/api/history')?.data;

  const { data: localVisibility, mutate: setLocalVisibility } = useSWR(
    `${chatId}-visibility`,
    null,
    {
      fallbackData: initialVisibility,
    },
  );

  const visibilityType = useMemo(() => {
    if (!history) return localVisibility;
    const chat = history.find((chat) => chat.id === chatId);
    if (!chat) return 'private';
    return chat.visibility;
  }, [history, chatId, localVisibility]);

  const setVisibilityType = (updatedVisibilityType: VisibilityType) => {
    setLocalVisibility(updatedVisibilityType);

    mutate<Array<Chat>>(
      '/api/history',
      (history) => {
        return history
          ? history.map((chat) => {
              if (chat.id === chatId) {
                return {
                  ...chat,
                  visibility: updatedVisibilityType,
                };
              }
              return chat;
            })
          : [];
      },
      { revalidate: false },
    );

    updateChatVisibility({
      chatId: chatId,
      visibility: updatedVisibilityType,
    });
  };

  return { visibilityType, setVisibilityType };
}
