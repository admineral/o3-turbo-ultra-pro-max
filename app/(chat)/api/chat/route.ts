/**
 * *** CHAT API ***
 * Handles chat functionality including:
 * - POST: Processes incoming chat messages, saves them to the database, and streams AI responses
 * - DELETE: Removes chats from the database when requested by the owner
 * 
 * Uses authentication to verify user access and supports multiple chat models
 * with various AI tools like weather, document creation/updating, and suggestions.
 */

import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();
    console.log('POST /api/chat called with:', { id, messagesCount: messages.length, selectedChatModel });
    const session = await auth();
    console.log('Session from auth():', session);
    if (!session || !session.user || !session.user.id) {
      console.log('Unauthorized access attempt to POST /api/chat');
      return new Response('Unauthorized', { status: 401 });
    }
    console.log('User authenticated for POST /api/chat:', session.user.id);

    const userMessage = getMostRecentUserMessage(messages);
    console.log('Most recent user message:', userMessage);
    if (!userMessage) {
      console.log('No user message found in POST /api/chat');
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });
    console.log('Chat fetched for id:', id, chat);
    if (!chat) {
      console.log('No existing chat, generating title');
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
      console.log('saveChat successful for chat id:', id);
    } else {
      console.log('Existing chat belongs to user:', chat.userId);
      if (chat.userId !== session.user.id) {
        console.log('Unauthorized: chat.userId does not match session.user.id');
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });
    console.log('saveMessages (user message) successful for message id:', userMessage.id);

    return createDataStreamResponse({
      execute: (dataStream) => {
        console.log('Stream execution started for chat id:', id);
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            console.log('Stream finished with response messages count:', response.messages.length);
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Error in dataStreamResponse:', error);
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/chat:', error);
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  console.log('DELETE /api/chat called with id:', id);
  if (!id) {
    console.log('DELETE /api/chat missing id parameter');
    return new Response('Not Found', { status: 404 });
  }
  const session = await auth();
  console.log('Session for DELETE /api/chat:', session);
  if (!session || !session.user) {
    console.log('Unauthorized DELETE attempt to /api/chat with id:', id);
    return new Response('Unauthorized', { status: 401 });
  }
  console.log('User authenticated for DELETE:', session.user.id);
  try {
    console.log('Fetching chat for deletion with id:', id);
    const chat = await getChatById({ id });
    console.log('Fetched chat:', chat);
    if (chat.userId !== session.user.id) {
      console.log('Unauthorized: chat.userId does not match session.user.id for DELETE');
      return new Response('Unauthorized', { status: 401 });
    }
    console.log('Deleting chat with id:', id);
    await deleteChatById({ id });
    console.log('deleteChatById successful for id:', id);
    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/chat for id', id, error);
    return new Response('An error occurred while processing your request!', { status: 500 });
  }
}
