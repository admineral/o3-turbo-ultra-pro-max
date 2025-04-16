import 'server-only';

import { genSaltSync, hashSync, compare } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
} from './schema';
import { ArtifactKind } from '@/components/artifact';

// Initialize database connection
let db: ReturnType<typeof drizzle>;

if (process.env.NODE_ENV === 'development') {
  // In development, use mock database
  const mockData = {
    users: [] as Array<{ id: string; email: string; password: string }>,
    chats: [] as Array<{ id: string; userId: string; title: string; createdAt: Date; visibility: string }>,
    messages: [] as Array<DBMessage>,
    votes: [] as Array<{ chatId: string; messageId: string; isUpvoted: boolean }>,
  };

  // Create a default user for development
  const defaultUser = {
    id: 'dev-user-id',
    email: 'dev@example.com',
    password: hashSync('password', genSaltSync(10)),
  };
  mockData.users.push(defaultUser);

  const mockDb = {
    select: () => ({
      from: (table: string) => ({
        where: (condition: any) => {
          let results: any[] = [];
          if (table === 'User') {
            const email = condition?.email?.value;
            const user = mockData.users.find(u => u.email === email);
            if (user) {
              results = [{
                id: user.id,
                email: user.email,
                password: user.password
              }];
            }
          } else if (table === 'Chat') {
            if (condition?.id?.value) {
              const chatId = condition.id.value;
              results = mockData.chats.filter(chat => chat.id === chatId);
            } else if (condition?.userId?.value) {
              const userId = condition.userId.value;
              results = mockData.chats.filter(chat => chat.userId === userId);
            } else {
              results = mockData.chats;
            }
          } else if (table === 'Message_v2') {
            if (condition?.chatId?.value) {
              const chatId = condition.chatId.value;
              results = mockData.messages.filter(msg => msg.chatId === chatId);
            } else if (condition?.id?.value) {
              const messageId = condition.id.value;
              results = mockData.messages.filter(msg => msg.id === messageId);
            } else {
              results = mockData.messages;
            }
          } else if (table === 'Vote_v2') {
            if (condition?.chatId?.value) {
              const chatId = condition.chatId.value;
              results = mockData.votes.filter(vote => vote.chatId === chatId);
            } else if (condition?.messageId?.value) {
              const messageId = condition.messageId.value;
              results = mockData.votes.filter(vote => vote.messageId === messageId);
            } else {
              results = mockData.votes;
            }
          }
          return {
            orderBy: (order: any) => {
              if (order?.createdAt?.direction === 'desc') {
                results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              } else if (order?.createdAt?.direction === 'asc') {
                results.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
              }
              return Promise.resolve(results);
            },
            then: (resolve: any) => resolve(results)
          };
        }
      })
    }),
    insert: (table: string) => ({
      values: (data: any) => {
        if (table === 'User') {
          const user = { 
            id: uuidv4(), 
            email: data.email,
            password: hashSync(data.password, genSaltSync(10))
          };
          mockData.users.push(user);
          return Promise.resolve(user);
        }
        if (table === 'Chat') {
          const chat = { 
            id: uuidv4(), 
            createdAt: new Date(),
            visibility: 'private',
            ...data 
          };
          mockData.chats.push(chat);
          return Promise.resolve(chat);
        }
        if (table === 'Message_v2') {
          const message = { 
            id: uuidv4(), 
            createdAt: new Date(),
            ...data 
          };
          mockData.messages.push(message);
          return Promise.resolve(message);
        }
        if (table === 'Vote_v2') {
          const vote = { ...data };
          mockData.votes.push(vote);
          return Promise.resolve(vote);
        }
        return Promise.resolve();
      }
    }),
    update: (table: string) => ({
      set: (data: any) => ({
        where: (condition: any) => {
          if (table === 'Chat') {
            const chatId = condition?.id?.value;
            const chat = mockData.chats.find(c => c.id === chatId);
            if (chat) {
              Object.assign(chat, data);
            }
          }
          return Promise.resolve();
        }
      })
    }),
    delete: (table: string) => ({
      where: (condition: any) => {
        if (table === 'Chat') {
          const chatId = condition?.id?.value;
          mockData.chats = mockData.chats.filter(c => c.id !== chatId);
          mockData.messages = mockData.messages.filter(m => m.chatId !== chatId);
          mockData.votes = mockData.votes.filter(v => v.chatId !== chatId);
        }
        return Promise.resolve();
      }
    })
  };
  db = mockDb as any;
} else {
  // In production, use real database
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }
  const client = postgres(process.env.POSTGRES_URL);
  db = drizzle(client);
}

// Database query functions
export async function getUser(email: string): Promise<Array<User>> {
  try {
    const users = await db.select().from(user).where(eq(user.email, email));
    if (process.env.NODE_ENV === 'development') {
      // In development, ensure we have a default user
      if (users.length === 0 && email === 'dev@example.com') {
        const defaultUser = {
          id: 'dev-user-id',
          email: 'dev@example.com',
          password: hashSync('password', genSaltSync(10)),
        };
        return [defaultUser as User];
      }
    }
    return users;
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
