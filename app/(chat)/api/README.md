# API Documentation

This document provides detailed information about all available API endpoints in the chat application.

## Authentication

All endpoints require authentication. Requests without valid authentication will receive a `401 Unauthorized` response.

## Available Endpoints

### Chat API

Handles chat functionality including processing messages and responses.

#### POST `/api/chat`

Processes incoming chat messages and streams AI responses.

**Request Body:**
```json
{
  "id": "string",         // Chat ID
  "messages": [           // Array of chat messages
    {
      "id": "string",     // Message ID
      "role": "user" | "assistant",
      "parts": ["string"] // Message content
    }
  ],
  "selectedChatModel": "string" // Selected AI model name
}
```

**Response:** 
- Streamed AI response using DataStream
- Status: 200 OK

#### DELETE `/api/chat?id={chatId}`

Removes a chat from the database.

**Query Parameters:**
- `id`: The ID of the chat to delete

**Response:**
- Status: 200 OK - "Chat deleted"
- Status: 404 Not Found - If chat doesn't exist
- Status: 401 Unauthorized - If user doesn't own the chat

### Document API

Manages document operations for creation, retrieval, and deletion.

#### GET `/api/document?id={documentId}`

Retrieves documents by ID for authorized users.

**Query Parameters:**
- `id`: The document ID to retrieve

**Response:**
- Status: 200 OK - Array of document objects
- Status: 404 Not Found - If document doesn't exist
- Status: 401 Unauthorized - If user doesn't own the document

#### POST `/api/document?id={documentId}`

Creates or updates documents.

**Query Parameters:**
- `id`: The document ID to create/update

**Request Body:**
```json
{
  "content": "string",   // Document content
  "title": "string",     // Document title
  "kind": "string"       // Document type/kind
}
```

**Response:**
- Status: 200 OK - Created/updated document object
- Status: 401 Unauthorized - If not authenticated

#### PATCH `/api/document?id={documentId}`

Deletes document versions after a specified timestamp.

**Query Parameters:**
- `id`: The document ID to update

**Request Body:**
```json
{
  "timestamp": "string"  // ISO date string
}
```

**Response:**
- Status: 200 OK - "Deleted"
- Status: 401 Unauthorized - If user doesn't own the document

### Files Upload API

Handles file uploads for the application.

#### POST `/api/files/upload`

Accepts and validates files (JPEG/PNG under 5MB).

**Request Body:**
- `FormData` with a file field containing JPEG or PNG image under 5MB

**Response:**
- Status: 200 OK - Upload result with URL
- Status: 400 Bad Request - If file validation fails
- Status: 500 Internal Server Error - If upload fails

### History API

Provides chat history functionality.

#### GET `/api/history`

Retrieves all chats associated with the authenticated user.

**Response:**
- Status: 200 OK - Array of chat objects
- Status: 401 Unauthorized - If not authenticated

### Suggestions API

Manages AI-generated suggestions related to documents.

#### GET `/api/suggestions?documentId={documentId}`

Retrieves suggestions for a specific document.

**Query Parameters:**
- `documentId`: The document ID to get suggestions for

**Response:**
- Status: 200 OK - Array of suggestion objects (or empty array)
- Status: 401 Unauthorized - If user doesn't own the document
- Status: 404 Not Found - If documentId is not provided

### Vote API

Handles user feedback on chat messages.

#### GET `/api/vote?chatId={chatId}`

Retrieves all votes for a specific chat.

**Query Parameters:**
- `chatId`: The chat ID to get votes for

**Response:**
- Status: 200 OK - Array of vote objects
- Status: 401 Unauthorized - If user doesn't own the chat
- Status: 404 Not Found - If chat doesn't exist
- Status: 400 Bad Request - If chatId is not provided

#### PATCH `/api/vote`

Records upvotes or downvotes on specific messages.

**Request Body:**
```json
{
  "chatId": "string",    // Chat ID
  "messageId": "string", // Message ID
  "type": "up" | "down"  // Vote type
}
```

**Response:**
- Status: 200 OK - "Message voted"
- Status: 401 Unauthorized - If user doesn't own the chat
- Status: 404 Not Found - If chat doesn't exist
- Status: 400 Bad Request - If required parameters are missing 