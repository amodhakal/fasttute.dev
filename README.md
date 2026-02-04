# Fasttute.dev

An AI-powered YouTube learning platform that transforms passive video tutorials into interactive lessons. Stop scrubbing through videos—learn smarter with AI-generated chapters, synchronized transcripts, and context-aware assistance.

## Core Features

**AI-Generated Chapters**  
Automatically creates a granular, thematic table of contents for any YouTube video, allowing instant navigation to specific topics.

**Interactive Transcripts**  
Click any sentence in the synchronized transcript to jump directly to that moment in the video. No more manual seeking.

**AI Q&A Chat**  
Ask questions about the video content and receive AI-generated answers with time-stamped citations linking back to relevant moments.

**Mobile Optimized**  
Fully responsive design built with Tailwind CSS for seamless learning across all devices.

## Tech Stack

- **Monorepo:** Turborepo with Bun workspaces
- **Framework:** Next.js 16 (App Router) with Turbopack
- **Backend:** Convex as shared package (`@fasttute/backend`)
- **Authentication:** Clerk
- **AI Models:** Google Gemini (`gemini-2.5-pro` for Q&A, `gemini-2.5-flash-lite` for chapter generation)
- **Styling:** Tailwind CSS 4
- **YouTube Integration:** youtubei.js (Innertube) + YouTube IFrame Player API
- **Deployment:** Vercel with Analytics and Speed Insights
- **Language:** TypeScript

## Project Structure

```
fasttute.dev/
├── apps/
│   └── web/                    # Next.js frontend
│       ├── src/app/            # Routes and pages
│       │   ├── page.tsx        # Landing page
│       │   └── video/[id]/     # Video interaction interface
│       ├── src/components/     # Reusable UI components
│       ├── src/hooks/          # React hooks for player state
│       └── src/utils/          # Helper functions
├── packages/
│   └── backend/                # Shared Convex backend
│       ├── convex/             # Database & serverless functions
│       ├── utils/ai/           # AI services (Q&A, chapters)
│       └── api/                # API exports
├── turbo.json                  # Turborepo configuration
└── package.json                # Root monorepo config
```

## Getting Started

### Prerequisites

- Bun 1.3.5+
- Convex account
- Clerk account
- Google Gemini API key

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_KEY=your_gemini_api_key
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer
```

### Installation

```bash
# Install dependencies
bun install

# Run development servers (Next.js + Convex)
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linter
bun run lint

# Type check all packages
bun run check-types
```

The application will be available at `http://localhost:3000` (default Next.js port).

## How It Works

1. **Input:** User enters a YouTube URL or Video ID
2. **Processing:** Backend fetches video metadata and transcript via youtubei.js
3. **AI Analysis:** Gemini generates structured chapters and powers the Q&A chat
4. **Streaming:** Chat responses are streamed in real-time using Convex mutations
5. **Interaction:** Users navigate via chapters, click transcript timestamps, or ask the AI questions

### Architecture Highlights

- **Real-time Streaming:** AI responses are pushed chunk-by-chunk for instant feedback
- **Hybrid Data Fetching:** Uses Node.js runtime for complex YouTube API interactions
- **Context Synchronization:** React Context API keeps video player, transcript, and chat perfectly aligned
- **Citation Format:** AI responses use `[[OFFSET IN SECONDS]]` format parsed into clickable links

## Deployment

This project is optimized for Vercel deployment with automatic Convex integration. Push to your repository and Vercel will handle the rest.

## Contributing

Contributions are welcome. Submit feedback through the in-app feedback system or open an issue on GitHub.

---

**Built for developers, students, and anyone who learns from YouTube tutorials.**
