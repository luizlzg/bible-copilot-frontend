# Bible Copilot - Frontend

A conversational Bible study assistant built with Next.js. Users can ask questions about the Scriptures and receive AI-powered answers with biblical references and interpretations.

## Stack

- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Auth**: Supabase Auth (email/password)
- **Database**: Supabase (Postgres) with RLS
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Rendering**: React 19, react-markdown with remark-gfm
- **Icons**: lucide-react
- **Theme**: next-themes (light/dark)

## Architecture

```
app/
  (public)/          # Login page (unauthenticated)
  (protected)/chat/  # Chat layout with sidebar + session pages
  actions/           # Server actions (session init)
  api/sessions/      # API route for sidebar refresh
  auth/callback/     # Supabase OAuth callback
components/shared/   # ChatMessages, ChatInput, MessageBubble, SessionSidebar, ThemeToggle
lib/
  api.ts             # HTTP client for the Python backend
  supabase/          # Supabase client helpers (server + browser)
  utils.ts           # cn() helper
types/               # TypeScript types (ChatMessage, Session, BiblicalReference)
supabase/migrations/ # SQL migrations for Supabase
```

### How it works

1. User authenticates via Supabase Auth (email/password)
2. On first message, the frontend creates a session in both the Python backend (LangGraph thread) and Supabase
3. Messages are sent to the Python backend via `POST /chat`
4. The backend processes the message with a LangGraph agent, returns the AI response with biblical references, and persists everything to Supabase (conversation history, token usage, timing)
5. The frontend displays the response with formatted markdown and expandable biblical references

### Backend dependency

This frontend requires the [Bible Copilot backend](../bible-copilot) running at `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`).

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project with the migrations applied
- The Python backend running

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database

Run the migrations in order in the Supabase SQL Editor:

```
supabase/migrations/001_initial.sql          # Core tables: sessions, messages, user_information
supabase/migrations/002_ai_response_jsonb.sql # AI response as JSONB
supabase/migrations/003_model_name.sql        # model_name + num_tool_calls on messages
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
