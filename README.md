Perfect 👍 Here’s the **complete, final README.md** with badges, emojis, and the MIT license included — all in **one clean markdown file**:

```markdown
# 🚀 QuickAI  

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)  
![React](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)  
![Express](https://img.shields.io/badge/Backend-Express_5-green?logo=express)  
![Postgres](https://img.shields.io/badge/Database-Postgres-316192?logo=postgresql)  
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)  
![Node](https://img.shields.io/badge/Node-18+-brightgreen?logo=node.js)  

QuickAI is a **full-stack AI content & media assistant**.  
It enables authenticated users (via Clerk) to:  
✨ Generate articles  
✨ Craft blog title ideas  
✨ Create images  
✨ Remove image backgrounds & objects  
✨ Get AI-powered resume feedback  

A **community space** allows publishing creations and liking others' work.  
Free users enjoy limited access, while premium users unlock advanced tools.  

---

## 🌟 Features  
- 🔑 Authentication & user metadata (Clerk)  
- 🎟 Free tier quota (10 free text generations) & premium plan  
- ✍️ **Article Writer** (length configurable)  
- 📝 **Blog Title Ideation**  
- 🖼 **AI Image Generation** (ClipDrop API, premium)  
- 🧹 **Background & Object Removal** (Cloudinary AI, premium)  
- 📄 **Resume Review & Feedback** (Gemini model, premium)  
- 🌍 Publish & like creations (Postgres storage via Neon)  
- 📰 Community feed of published creations  
- 📱 Responsive UI (React + Vite + Tailwind)  

---

## 🛠 Tech Stack  

**Client:**  
⚛️ React 19 • 🛤 React Router • 🎨 Tailwind CSS • 🔑 Clerk React • 🔔 React Hot Toast • 🌐 Axios  

**Server:**  
🚏 Express 5 • 🔑 Clerk Express • 🤖 OpenAI SDK (Gemini) • 🐘 Neon/Postgres • ☁️ Cloudinary • 📎 Multer • 🎨 ClipDrop API • 📑 PDF Parse  

**Infra & Build:**  
⚡ Vite • ▲ Vercel • 🔧 Node 18+ (recommended)  

---

## 📂 Project Structure  
```

client/   → React SPA (routes: / and /ai/*)
server/   → Express API (/api/ai/*, /api/user/\*), auth middleware, controllers, service configs

```

---

## 🔐 Environment Variables  

Create `.env` files in **client** and **server** (⚠️ never commit secrets).  

**Server (`server/.env`):**  
```

PORT=3000
CLERK\_SECRET\_KEY=...
CLERK\_PUBLISHABLE\_KEY=...   # also needed by client
GEMINI\_API\_KEY=...
CLIPDROP\_API\_KEY=...
CLOUDINARY\_CLOUD\_NAME=...
CLOUDINARY\_API\_KEY=...
CLOUDINARY\_API\_SECRET=...
DATABASE\_URL=postgres\://... # Neon connection string

```

**Optional:**  
```

VERCEL\_ENV=...

```

**Client (`client/.env`):**  
Use Vite prefix:  
```

VITE\_CLERK\_PUBLISHABLE\_KEY=...

````

---

## ⚙️ Installation & Local Development  

From repo root:  

1. 📦 Install dependencies  
```bash
# PowerShell
cd client; npm install; cd ..\server; npm install; cd ..
````

2. 🛠 Configure environment files (`client/.env`, `server/.env`).

3. ▶️ Start the server API

```bash
cd server; npm run server
```

4. ▶️ Start the client (new terminal)

```bash
cd client; npm run dev
```

5. 🌐 Open [http://localhost:5173](http://localhost:5173) (default). Ensure server is running on `PORT` (default: 3000).

---

## 📡 API Overview

**Base URL:** `/api`

| Endpoint                            | Method | Auth      | Description                     |
| ----------------------------------- | ------ | --------- | ------------------------------- |
| `/api/ai/generate-article`          | POST   | ✅         | `{ prompt, length }`            |
| `/api/ai/generate-blog-title`       | POST   | ✅         | `{ prompt }`                    |
| `/api/ai/generate-image`            | POST   | ⭐ Premium | `{ prompt, publish? }`          |
| `/api/ai/remove-image-background`   | POST   | ⭐ Premium | multipart `image`               |
| `/api/ai/remove-image-object`       | POST   | ⭐ Premium | multipart `image`, `{ object }` |
| `/api/ai/resume-review`             | POST   | ⭐ Premium | multipart `resume` (PDF ≤ 5MB)  |
| `/api/user/get-user-creations`      | GET    | ✅         | Get user’s creations            |
| `/api/user/get-published-creations` | GET    | ✅         | Get community feed              |
| `/api/user/toggle-like-creation`    | POST   | ✅         | `{ id }`                        |

All return:

```json
{ "success": true, ... }
```

---

## 🔒 Auth & Quotas

* Middleware attaches:

  * `req.plan` → `free` or `premium`
  * `req.free_usage` → count of free generations

* ⛔ Free users blocked after **10 text generations**

* ⭐ Premium required for image & resume features

---

## 🗄 Database (Neon / Postgres)

**Table: `creations`** (sample schema)

```sql
creations(
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  prompt TEXT,
  content TEXT,
  type TEXT,              -- 'article' | 'image' | 'resume-review' ...
  publish BOOLEAN DEFAULT false,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🚀 Deployment

* ▲ Vercel configs available for **client** & **server**
* Deploy as **separate projects** or **monorepo**
* Configure environment variables in hosting dashboard
* Use **pooled Neon connection** for serverless Node

---

## 💡 Potential Improvements

* 🗃 Schema management (Drizzle, Prisma, or SQL migrations)
* ⏳ Rate limiting / abuse protection
* 🧪 Unit & integration testing
* ⚠️ Better error handling & logging
* 🌍 Accessibility & SEO improvements

---

## 📜 License

This project is licensed under the **MIT License**.

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
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING  
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS  
IN THE SOFTWARE.
```

---

## ⚠️ Disclaimer

AI outputs may be **inaccurate**. Please review generated content before publishing.

```

Would you like me to also generate a **separate `LICENSE` file** in your repo with the MIT text (so GitHub automatically detects it)?
```
