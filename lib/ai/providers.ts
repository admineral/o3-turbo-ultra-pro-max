/**
 * ** AI PROVIDERS **
 * 
 * This module configures and exports AI model providers for the application.
 * 
 * Key functionalities:
 * - Defines AI model providers for different use cases
 * - Implements environment-specific provider configurations
 * - Provides language models for chat, reasoning, and artifacts
 * - Configures image generation models
 * - Sets up middleware for reasoning extraction
 * - Switches between production and test providers based on environment
 * - Creates a unified provider interface for the application
 * 
 * This central provider configuration enables consistent AI model
 * access throughout the application while allowing for environment-specific
 * optimizations and test mocks.
 */

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('o4-mini-2025-04-16'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('o4-mini-2025-04-16'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-4o'),
        'artifact-model': openai('gpt-4o'),
      },
      imageModels: {
        'small-model': openai.image('gpt-4o'),
      },
    });
