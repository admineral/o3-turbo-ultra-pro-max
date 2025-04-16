/**
 * ** IMAGE ARTIFACT SERVER **
 * 
 * This module implements server-side functionality for image artifacts.
 * 
 * Key functionalities:
 * - Handles image generation using AI image models
 * - Processes document creation with image content
 * - Integrates with AI providers for image generation
 * - Streams generated image data to the client
 * - Handles base64 encoding of image data
 * - Updates existing images based on text descriptions
 * - Registers the image document handler with the artifact system
 * 
 * This server-side handler enables AI-powered image generation,
 * working in tandem with the client-side rendering functionality
 * to provide seamless image creation capabilities.
 */

import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
});
