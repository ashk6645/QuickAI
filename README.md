# QuickAI

QuickAI is a full‑stack AI content & media assistant. It lets authenticated users (Clerk) generate articles, craft blog title ideas, create images, remove image backgrounds / objects, and get AI feedback on resumes. A community area lets users publish creations and like others' work. Free users have a limited quota; premium users unlock advanced image & resume tools.

## Features
- Authentication & user metadata via Clerk
- Free tier quota enforcement (10 free text generations) & premium plan gating
- Article writer (length configurable)
- Blog title ideation
- AI image generation (ClipDrop API, premium)
- Background removal & object removal (Cloudinary AI, premium)
- Resume PDF review & feedback (Gemini model, premium)
- Publish & like creations (Neon/PostgreSQL storage)
- Community feed of published creations
- Responsive React UI (Vite + Tailwind CSS)

## Tech Stack
Client: React 19, React Router, Tailwind CSS, Clerk React, Axios, React Hot Toast
Server: Express 5, Clerk Express, OpenAI SDK (pointing to Gemini endpoint), Neon serverless Postgres, Cloudinary, Multer, ClipDrop API, PDF Parse
Infra & Build: Vite, Vercel (deployment configs present), Node 18+ recommended

## Project Structure
- `client/` React SPA (routes under `/` and `/ai/*`)
- `server/` Express API (`/api/ai/*`, `/api/user/*`), auth middleware, controllers, external service configs

## Environment Variables
Create `.env` files in `client` and `server` (never commit secrets). Required server variables:
```
PORT=3000
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=... (client also needs this)
GEMINI_API_KEY=...
CLIPDROP_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
DATABASE_URL=postgres://... (Neon connection string)
```
Optional:
```
VERCEL_ENV=...
```
Client `.env` (prefix keys as required by Vite, e.g. `VITE_CLERK_PUBLISHABLE_KEY`).

## Installation & Local Development
From the repo root (the directory containing `client` and `server`):

1. Install dependencies
```
# PowerShell
cd client; npm install; cd ..\server; npm install; cd ..
```
2. Configure environment files (`client/.env`, `server/.env`).
3. Start the server API
```
cd server; npm run server
```
4. In a new terminal, start the client
```
cd client; npm run dev
```
5. Open the printed local URL (typically http://localhost:5173). Ensure server runs on `PORT` (default 3000).

## API Overview
Base URL: `/api`
- `POST /api/ai/generate-article` (auth) `{ prompt, length }`
- `POST /api/ai/generate-blog-title` (auth) `{ prompt }`
- `POST /api/ai/generate-image` (premium) `{ prompt, publish? }`
- `POST /api/ai/remove-image-background` (premium, multipart `image`)
- `POST /api/ai/remove-image-object` (premium, multipart `image`, body: `{ object }`)
- `POST /api/ai/resume-review` (premium, multipart `resume` PDF <=5MB)
- `GET /api/user/get-user-creations` (auth)
- `GET /api/user/get-published-creations` (auth)
- `POST /api/user/toggle-like-creation` (auth) `{ id }`

All endpoints return JSON `{ success: boolean, ... }`.

## Auth & Quotas
`auth` middleware attaches `req.plan` (`free` or `premium`) and `req.free_usage` (number of free generations). Free users blocked after 10 text generations; premium required for image & resume features.

## Database (Neon / Postgres)
Expected table `creations` (inferred columns):
```
creations(
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  prompt TEXT,
  content TEXT,
  type TEXT,           -- 'article' | 'image' | 'resume-review' etc
  publish BOOLEAN DEFAULT false,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
)
```
Adjust to match your actual migrations.

## Deployment
- Vercel configs present for both client & server (`vercel.json`). Deploy each as separate project or as monorepo with build settings.
- Ensure environment variables configured in hosting dashboard.
- For serverless Postgres (Neon) ensure pooled connection string for serverless Node.

## Potential Improvements
- Add migration & schema management (e.g., Drizzle, Prisma, or SQL migrations)
- Rate limiting / abuse protection
- Add unit tests & integration tests
- Improved error handling & structured logging
- Accessibility & SEO enhancements on client

## License
Specify a license (currently none declared). Consider MIT if open-source.

## Disclaimer
AI outputs may be inaccurate. Users should review generated content before publishing.

---
Feel free to tailor wording, add screenshots, and update schema details as the project evolves.
