# 🚀 QuickAI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![React](https://img.shields.io/badge/Frontend-React_19-blue?logo=react) ![Express](https://img.shields.io/badge/Backend-Express_5-green?logo=express) ![Postgres](https://img.shields.io/badge/Database-Postgres-316192?logo=postgresql) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel) ![Node](https://img.shields.io/badge/Node-18+-brightgreen?logo=node.js)

Full‑stack AI content & media assistant (Clerk auth) for: articles, blog titles, image generation, background/object removal, resume review. Includes publish/like community. Free tier (10 text generations) + premium unlocks advanced tools.

---

## 1. Features
• Authentication & user metadata 
• Free quota & premium plan 
• Article writer (length) 
• Blog title ideas 
• AI image generation (premium) 
• Background & object removal (premium) 
• Resume PDF review (premium) 
• Publish & like creations 
• Community feed 
• Responsive UI.

## 2. Tech Stack
Client: React 19, React Router, Tailwind, Clerk React, React Hot Toast, Axios
Server: Express 5, Clerk Express, OpenAI SDK (Gemini endpoint), Neon/Postgres, Cloudinary, Multer, ClipDrop API, PDF Parse
Build/Deploy: Vite, Vercel, Node 18+

## 3. Structure
```
client/  React SPA (/ , /ai/*)
server/  Express API (/api/ai/*, /api/user/*)
```

## 4. Environment Variables
server/.env
```
PORT=3000
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...
GEMINI_API_KEY=...
CLIPDROP_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
DATABASE_URL=postgres://...
VERCEL_ENV=...
```
client/.env (Vite prefix)
```
VITE_CLERK_PUBLISHABLE_KEY=...
```

## 5. Local Development
```
# install
cd client; npm install; cd ..\server; npm install; cd ..
# run api
cd server; npm run server
# run client (new terminal)
cd client; npm run dev
```
Open http://localhost:5173 (server default 3000).

## 6. API (Base /api)
| Endpoint | Method | Auth | Notes |
|----------|-------|------|-------|
| /api/ai/generate-article | POST | ✅ | { prompt, length } |
| /api/ai/generate-blog-title | POST | ✅ | { prompt } |
| /api/ai/generate-image | POST | ⭐ | { prompt, publish? } |
| /api/ai/remove-image-background | POST | ⭐ | multipart image |
| /api/ai/remove-image-object | POST | ⭐ | multipart image + { object } |
| /api/ai/resume-review | POST | ⭐ | multipart resume (PDF ≤5MB) |
| /api/user/get-user-creations | GET | ✅ | user creations |
| /api/user/get-published-creations | GET | ✅ | community feed |
| /api/user/toggle-like-creation | POST | ✅ | { id } |
Response shape: `{ "success": boolean, ... }`

## 7. Auth & Quotas
Middleware sets `req.plan` (free|premium) and `req.free_usage`. Free users capped at 10 text generations. Premium required for image & resume endpoints.

## 8. Database (sample)
```
creations(
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  prompt TEXT,
  content TEXT,
  type TEXT,
  publish BOOLEAN DEFAULT false,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
)
```

## 9. Deployment
Vercel configs (client & server). Deploy separately or as monorepo. Supply env vars. Use pooled Neon connection.

## 10. Improvements
Schema/migrations • Rate limiting • Tests • Structured logging • Accessibility & SEO.

## 11. License (MIT)
```
MIT License

Copyright (c) 2025 Ashutosh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 12. Disclaimer
AI outputs may be inaccurate; review before publishing.
