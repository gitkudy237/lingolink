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

### Authentication

- `POST /api/auth/register`
   - Request body:
      - `email` (string, required)
      - `password` (string, required)
      - `username` (string, required)
      - `phone` (string, required)
      - `preferredLanguage` (string, optional)
   - Response: `201 Created`
      - `{ user, token }`
   - Errors: `400 Bad Request` for validation or duplicate email/phone/username.

- `POST /api/auth/login`
   - Request body:
      - `email` (string, required) // this value may be either the user's email or phone number
      - `password` (string, required)
   - Response: `200 OK`
      - `{ user, token }`
   - Errors: `401 Unauthorized` for invalid credentials.

- `GET /api/auth/me`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Response: `200 OK`
      - `{ user }`
   - Errors: `401 Unauthorized` if the token is missing or invalid.

### Users

- `GET /api/users/me`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Response: `200 OK`
      - `{ user }`
   - Errors: `401 Unauthorized` if unauthenticated, `404 Not Found` if the user no longer exists.

- `PUT /api/users/me`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Request body:
      - `username` (string, optional)
      - `preferredLanguage` (string, optional)
   - Response: `200 OK`
      - `{ user }`
   - Errors: `400 Bad Request` when no update fields are provided.

### Conversations

- `GET /api/conversations`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Response: `200 OK`
      - `{ conversations }`
   - Errors: `401 Unauthorized` when unauthenticated.

- `POST /api/conversations`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Request body for a direct conversation:
      - `type`: `direct`
      - `otherUserId`: string
   - Request body for a group conversation:
      - `type`: `group`
      - `title`: string
      - `participantIds`: string[] (optional)
   - Response: `201 Created`
      - `{ conversation }`
   - Errors: `400 Bad Request` for invalid type, missing fields, or invalid participants.

- `GET /api/conversations/:id`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Response: `200 OK`
      - `{ conversation }`
   - Errors: `400 Bad Request` for invalid ID or access denied.

- `PUT /api/conversations/:id`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Request body:
      - `title` (string, optional)
      - `avatarUrl` (string, optional)
      - `participantIds` (string[], optional) // only valid for group conversations
   - Response: `200 OK`
      - `{ conversation }`
   - Errors: `400 Bad Request` when modifying a direct conversation with `participantIds`, invalid request data, or access denied.

### Messages

- `GET /api/conversations/:conversationId/messages`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Query parameters:
      - `limit` (number, optional, default `50`)
   - Response: `200 OK`
      - `{ messages }`
   - Errors: `400 Bad Request` for invalid conversation access.

- `POST /api/conversations/:conversationId/messages`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Request body:
      - `type` (string, required)
      - `originalText` (string, required for `type: "text"`)
      - `transcriptionText` (string, optional)
      - `metadata` (object, optional)
   - Response: `201 Created`
      - `{ message }`
   - Errors: `400 Bad Request` for missing required text fields or invalid access.

- `POST /api/conversations/:conversationId/messages/read`
   - Request headers:
      - `Authorization: Bearer <token>`
   - Response: `200 OK`
      - `{ success: true }`
   - Errors: `400 Bad Request` when access is invalid.

## Notes

- All protected routes require a valid JWT token in the `Authorization` header.
- Prisma is configured for PostgreSQL.
- Run `npm run prisma:generate` after changing `prisma/schema.prisma`.
- Run `npm run prisma:migrate` to apply schema changes.
