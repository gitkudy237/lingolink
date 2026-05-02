# Lingolink Backend

A multilingual chat backend prototype using Node.js, Express, Socket.io, PostgreSQL, and Prisma.

## Getting started

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Apply Prisma migrations once your database is ready:
   ```bash
   npm run prisma:migrate
   ```
5. Run the backend in development mode:
   ```bash
   npm run dev
   ```

## Prisma

- Schema file: `prisma/schema.prisma`
- Prisma client wrapper: `src/lib/prisma.ts`

## API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:id`
- `PUT /api/conversations/:id`
- `POST /api/conversations/:conversationId/messages`
- `GET /api/conversations/:conversationId/messages`
- `POST /api/conversations/:conversationId/messages/read`

## Socket.io Events

### Connection
- Requires JWT token in `socket.handshake.auth.token`

### Client → Server Events
- `join_conversation` - Join a conversation room (payload: `conversationId`)
- `leave_conversation` - Leave a conversation room (payload: `conversationId`)
- `send_message` - Send a message (payload: `{ conversationId, type, originalText, transcriptionText?, metadata? }`)
- `typing` - Indicate user is typing (payload: `{ conversationId }`)
- `stop_typing` - Indicate user stopped typing (payload: `{ conversationId }`)
- `message_read` - Mark a message as read (payload: `{ conversationId, messageId }`)

### Server → Client Events
- `joined_conversation` - Joined conversation (payload: `{ conversationId }`)
- `user_joined` - Another user joined (payload: `{ userId, email }`)
- `user_left` - Another user left (payload: `{ userId }`)
- `message` - New message received (payload: full message object)
- `user_typing` - Another user is typing (payload: `{ userId, email }`)
- `user_stopped_typing` - Another user stopped typing (payload: `{ userId }`)
- `message_read_receipt` - Message marked read (payload: `{ conversationId, userId, messageId }`)
- `unread_counts_updated` - Unread counts changed (payload: `{ conversationId, unreadCounts: Record<userId, count> }`)
- `error` - Error occurred (payload: `{ message }`)

## Notes

- Prisma is configured for PostgreSQL.
- Socket.io requires JWT authentication via token in handshake.
- Run `npm run prisma:generate` after changing `prisma/schema.prisma`.
- Run `npm run prisma:migrate` to apply schema changes.
- CORS configuration for Socket.io is controlled by `CORS_ORIGIN` environment variable.
