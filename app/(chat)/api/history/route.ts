/**
 * *** HISTORY API ***
 * Provides chat history functionality:
 * - GET: Retrieves all chats associated with the authenticated user
 * 
 * Requires authentication and returns all chat conversations
 * the current user has participated in.
 */

import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: session.user.id! });
  return Response.json(chats);
}
