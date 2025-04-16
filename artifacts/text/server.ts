/**
 * ** TEXT ARTIFACT SERVER **
 * 
 * This module implements server-side functionality for text artifacts.
 * 
 * Key functionalities:
 * - Handles text document generation using AI models
 * - Processes document creation with rich text content
 * - Integrates with AI providers for text generation
 * - Streams generated text to the client word by word
 * - Updates existing documents based on user descriptions
 * - Uses specialized prompts for different text contexts
 * - Registers the text document handler with the artifact system
 * 
 * This server-side handler enables AI-powered text generation,
 * working in tandem with the client-side rendering functionality
 * to provide seamless document creation capabilities with smooth streaming.
 */

import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: title,
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;
        dataStream.writeData({
          type: 'text-delta',
          content: textDelta,
        });
      }
    }

    return draftContent;
  },
});
