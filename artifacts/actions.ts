/**
 * ** ARTIFACT ACTIONS **
 * 
 * This module provides server actions for artifact functionality.
 * 
 * Key functionalities:
 * - Retrieves suggestions for documents from the database
 * - Provides server-side functions for artifact operations
 * - Fetches related data for artifact enhancement
 * - Implements secure data access through server actions
 * - Supports client components with server-side data
 * 
 * These server actions enable secure data operations for artifacts
 * while maintaining separation between client and server code.
 */

'use server';

import { getSuggestionsByDocumentId } from '@/lib/db/queries';

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}
