# LingoLink

**LingoLink** is a real-time language translation chat application that enables seamless global conversations with invisible translation. Users can chat in their preferred language while communicating with others across language barriers.

##  Features

- **Real-time Messaging**: Instant message delivery with WebSocket support
- **Automatic Translation**: Messages are automatically translated to recipient's preferred language
- **Multi-language Support**: Support for English, French, German, Spanish, Arabic, Chinese, Portuguese, Italian, and African languages
- **Direct & Group Chats**: One-on-one conversations and group chat functionality
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Profile Management**: User profiles with customizable language preferences
- **Professional UI**: Consistent, theme-based interface with Ionicons
- **Real-time Database**: PostgreSQL with Prisma ORM

##  Project Structure

```
lingolink/
├── backend/              # Express.js server
│   ├── src/
│   │   ├── app.ts       # Express app setup
│   │   ├── index.ts     # Server entry point
│   │   ├── routes/      # API endpoints (auth, conversations, messages)
│   │   ├── services/    # Business logic
│   │   ├── models/      # Database queries
│   │   ├── middleware/  # Auth middleware
│   │   └── utils/       # JWT, utilities
│   ├── prisma/          # Database schema & migrations
│   └── package.json
├── frontend/            # React Native (Expo) mobile app
│   ├── app/             # App screens & navigation
│   ├── src/             # Services, theme, utilities
│   ├── components/      # Reusable UI components
│   └── package.json
├── shared/              # Shared TypeScript types
│   └── src/index.ts
└── package.json         # Root workspace

```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin support

### Frontend
- **React Native** + **TypeScript**
- **Expo** - Mobile app framework
- **Expo Router** - Navigation
- **Ionicons** - Icon library
- **Axios** - HTTP client
- **Expo SecureStore** - Secure credential storage
- **React Native Safe Area Context** - Safe area handling

### Shared
- **TypeScript** - Type definitions for both frontend & backend

##  Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

##  Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lingolink
```

### 2. Install Dependencies

```bash
npm run bootstrap
```

This installs dependencies for all workspaces (backend, frontend, shared).

### 3. Set Up Environment Variables

#### Backend (`.env`)

Create a `.env` file in the `backend/` directory:

```bash
cd backend
touch .env
```

Add the following:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lingolink"
PORT=4000
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Replace:
- `user` and `password` with your PostgreSQL credentials
- `your_jwt_secret_key_here` with a strong secret key

#### Frontend (`.env.local`)

The frontend already has `.env.local` configured. Update it if needed:

```bash
cd frontend
cat .env.local
```

Current value:
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.43.142:4000/api
```

Update the IP address to match your backend's network address.

### 4. Set Up Database

#### Create PostgreSQL Database

```bash
createdb lingolink
```

Or via PostgreSQL shell:
```bash
psql
CREATE DATABASE lingolink;
\q
```

#### Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

This creates all tables based on the Prisma schema.

#### Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

##  Startup Commands

### Start Backend Server

```bash
npm run dev:backend
```

The backend will start on `http://localhost:4000`

**Expected output:**
```
Lingolink backend listening on port 4000
```

### Start Frontend (Development)

In a new terminal:

```bash
npm run dev:frontend
```

This launches Expo CLI. Options will appear:
- Press `i` for iOS simulator (macOS only)
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on physical device

### Build Backend for Production

```bash
npm run build:backend
npm start:backend
```

### Additional Frontend Commands

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web

# Lint
npm run lint:frontend
```

##  API Endpoints

### Authentication

```
POST   /api/auth/register   - Register new user
POST   /api/auth/login      - Login user
GET    /api/auth/me         - Get current user (requires token)
```

### Conversations

```
GET    /api/conversations                 - List user's conversations
POST   /api/conversations                 - Create new conversation
GET    /api/conversations/:id             - Get conversation details
PUT    /api/conversations/:id             - Update conversation
```

### Messages

```
GET    /api/conversations/:conversationId/messages
POST   /api/conversations/:conversationId/messages
```

### Users

```
GET    /api/users/:id       - Get user profile
PUT    /api/users/:id       - Update user profile
```

##  Database Schema

### Users
- Stores user credentials, profile info, and language preferences
- Email and phone are unique identifiers

### Conversations
- Direct (1-to-1) and group chat support
- Tracks conversation type, title, and avatar

### Messages
- Supports multiple message types (text, image, audio, document, voice_note)
- Stores original and translated text
- Timestamps for ordering

### ConversationParticipant
- Junction table linking users to conversations
- Tracks unread count per user

##  Authentication Flow

1. User registers with email, phone, username, and password
2. Password is hashed with bcrypt (12 rounds)
3. JWT token is issued upon login (valid for session)
4. Token sent as `Authorization: Bearer <token>` header on requests
5. Auth middleware validates token on protected routes

##  UI/UX Features

- **Consistent Theme**: Centralized color palette and spacing tokens
- **Default Avatars**: Colored initials for users without profile pictures
- **Loading States**: Loading spinners on data fetching
- **Empty States**: User-friendly messages when no conversations exist
- **Real-time Updates**: Socket.io integration for live message delivery

##  Testing

Run linting on frontend:

```bash
npm run lint:frontend
```

##  Debugging

### Backend Logs
Add logging to `src/services/` files. Check console output when `npm run dev:backend` is running.

### Frontend Logs
Use Expo CLI console or physical device logs:
```bash
# Android
adb logcat

# iOS
xcrun simctl spawn booted log stream --predicate 'process == "Lingolink"'
```

### Database
Connect to PostgreSQL:
```bash
psql lingolink
\dt  # List tables
```

##  Security Notes

- **JWT Secret**: Use a strong, random string in production
- **Database**: Keep credentials in `.env` (never commit to git)
- **HTTPS**: Use HTTPS in production, not HTTP
- **Password Hashing**: All passwords hashed with bcrypt (12 rounds)
- **Secure Storage**: Frontend stores tokens in Expo SecureStore (encrypted)

##  Development Tips

### Hot Reload
- Backend: ts-node auto-restarts on file changes
- Frontend: Expo CLI auto-refreshes on file changes

### Prisma Studio (Visual Database Explorer)
```bash
cd backend
npm run prisma
# Opens Prisma Studio at http://localhost:5555
```

### Clear Frontend Cache
```bash
npm run reset-project:frontend
```

##  Deployment

### Backend Deployment (Example: Heroku/Railway)

1. Build the TypeScript:
```bash
npm run build
```

2. Set environment variables on hosting platform
3. Run: `npm start:backend`

### Frontend Deployment (Example: Expo)

```bash
cd frontend
eas build --platform android
eas build --platform ios
eas submit
```

##  Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "feat: description"`
3. Push to branch: `git push origin feature/your-feature`
4. Create a pull request

##  License

ISC License

##  Troubleshooting

### "Cannot find module '@lingolink/shared'"
Rebuild shared package:
```bash
cd shared
npm run build
```

### "DATABASE_URL is not set"
Ensure `.env` file exists in `backend/` with DATABASE_URL

### "EXPO_PUBLIC_API_BASE_URL is incorrect"
Update `.env.local` in `frontend/` with correct backend URL

### "Port 4000 already in use"
Kill existing process:
```bash
lsof -ti:4000 | xargs kill -9
```

### WebSocket connection errors
Ensure backend is running and CORS origin is correctly configured

##  Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with  for seamless global communication**
