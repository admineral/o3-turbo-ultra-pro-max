/**
 * ** CHAT SERVER ACTIONS **
 * 
 * This file contains server-side actions for chat functionality using Next.js server actions.
 * 
 * Key functionalities:
 * - saveChatModelAsCookie: Stores user's preferred chat model in cookies
 * - generateTitleFromUserMessage: Creates a descriptive title for new chats based on first message
 * - deleteTrailingMessages: Removes messages after a specified message (for regeneration)
 * - updateChatVisibility: Changes chat visibility settings (private/public)
 * 
 * These actions separate server-side operations from client components,
 * enabling secure data manipulation without exposing sensitive operations to the client.
 * The 'use server' directive ensures these functions only execute on the server.
 */

'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  if (process.env.NODE_ENV === 'development') {
    return 'New Chat';
  }
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
