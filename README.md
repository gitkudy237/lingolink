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

## Notes

- Prisma is configured for PostgreSQL.
- Run `npm run prisma:generate` after changing `prisma/schema.prisma`.
- Run `npm run prisma:migrate` to apply schema changes.
