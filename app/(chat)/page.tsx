/**
 * ** MAIN CHAT PAGE **
 * 
 * This component serves as the entry point for the chat application.
 * 
 * Key functionalities:
 * - Generates a unique ID for new chat conversations
 * - Retrieves user preferences for AI models from cookies
 * - Initializes empty chat sessions with appropriate configuration
 * - Sets default visibility to private for new conversations
 * - Renders the Chat component with proper initial state
 * - Integrates DataStreamHandler for real-time updates
 * 
 * This page creates fresh chat sessions when users start a new conversation,
 * ensuring proper initialization with either default or previously selected models.
 * It provides a clean slate for users to begin interacting with the AI.
 */

import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
