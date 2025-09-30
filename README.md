# fastiture.dev

Stop scrubbing. Start learning.

Fastiture transforms passive YouTube tutorials into active, efficient learning environments. It's a tool built to fix the broken experience of learning complex technical topics from video.

## The Pain

Learning from technical YouTube videos is fundamentally inefficient. The workflow consists of:

- Endlessly scrubbing back and forth to find a specific concept.
- Constantly pausing and manually typing out code from the video player.
- Losing context and having no way to search for information within the video.
- Forgetting which video contained that one crucial explanation you now need.

This is a waste of time and a massive barrier to effective learning.

## The Solution

Fastiture is a web application that takes a YouTube URL and generates an interactive, AI-powered learning session. It provides:

- **A time-synced transcript** that lets you read along and click to jump to any point in the video.
- **AI-generated chapter markers** that structure the video and make navigation effortless.
- **AI-extracted code blocks** that you can copy with a single click.
- **A personal, searchable library** to save, organize, and revisit the content that matters to you.

## Tech Stack

- **Framework:** Next.js
- **Deployment:** Vercel
- **Authentication:** Clerk
- **Database & Backend:** Convex
- **AI:** OpenAI API

## The Battle Plan: From MVP to Growth Engine

This is not a feature list. This is a sequential plan of execution. Each phase builds upon the last.

### Phase 0: The Foundation (The Non-AI Core)

**Goal:** Build a tool that is useful even without any AI. Prove the core user experience is solid.

**Key Deliverables:**

- [ ] A single input field to accept a YouTube URL.
- [ ] An embedded video player next to a scrollable transcript.
- [ ] Fetching the transcript using a public library.
- [ ] Clicking any sentence in the transcript jumps the video player to that exact timestamp.
- [ ] A clean, responsive UI.

### Phase 1: The First Spark of Magic (Core AI Feature)

**Goal:** Integrate AI to solve the single biggest navigation problem: lack of structure.

**Key Deliverables:**

- [ ] A backend API endpoint that takes a transcript.
- [ ] The API calls an LLM with a prompt to generate a JSON object of detailed chapter markers.
- [ ] The generated chapters are displayed on the frontend, allowing for one-click navigation.
- [ ] Results are cached to avoid redundant API calls for the same video.

### Phase 2: The Retention Engine (Building the Asset)

**Goal:** Give users a reason to come back. Transform the tool from a one-off gadget into a personal library.

**Key Deliverables:**

- [ ] Implement user authentication with Clerk.
- [ ] When an authenticated user enhances a video, it is automatically saved to their personal library.
- [ ] A dedicated dashboard page (`/library`) where users can see and search their saved videos.

### Phase 3: The Growth Engine (Product-Led Growth)

**Goal:** Turn users into evangelists. Build the mechanisms for the product to spread itself.

**Key Deliverables:**

- [ ] Make every enhanced video page a public, sharable URL (`fastiture.dev/v/...`).
- [ ] The shared page shows the full enhanced experience to non-users, with a clear CTA to sign up.
- [ ] A browser extension that allows users to enhance a video with one click directly from YouTube.
