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

- **Framework:** Next.js 15 (App Router) with Turbopack
- **Backend:** Convex (real-time database + serverless functions)
- **Authentication:** Clerk
- **AI Models:** Google Gemini (`gemini-2.5-pro` for Q&A, `gemini-2.5-flash-lite` for chapter generation)
- **Styling:** Tailwind CSS 4
- **YouTube Integration:** youtubei.js (Innertube) + YouTube IFrame Player API
- **Deployment:** Vercel with Analytics and Speed Insights
- **Language:** TypeScript

## Project Structure

```
src/
├── app/                    # Next.js routes and page components
│   ├── page.tsx           # Landing page with video URL input
│   └── video/[id]/        # Main video interaction interface
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks for player state management
├── server/                # Convex backend logic
│   ├── schema.ts         # Database schema definitions
│   └── retrieveVideoInfo.ts  # YouTube data fetching
├── utils/
│   ├── ai/               # AI service integrations
│   │   ├── qna.ts       # Streaming Q&A responses
│   │   └── chapters.ts  # Video segmentation processing
│   └── ...              # Helper functions
└── fonts.ts              # Typography configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
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
npm install

# Run development servers (Next.js + Convex)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
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
