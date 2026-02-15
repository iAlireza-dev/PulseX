🚀 PulseX

A production-style real-time event hub built with Next.js, Express, Socket.IO and Redis — featuring secure auth, route protection and distributed rate limiting.

⸻

🧠 Overview

PulseX is a full-stack real-time application designed to demonstrate:
• Secure authentication with HttpOnly JWT cookies
• Protected frontend routes using Next.js middleware
• WebSocket authentication during handshake
• Room-based real-time messaging
• Redis-backed rate limiting for both HTTP and WebSocket events
• Clean separation between frontend and backend services

The goal of this project is not UI complexity — but production-grade backend architecture and real-time system design.

---

🏗 Architecture

Browser (Next.js App Router)
│
│ HttpOnly Cookie (JWT)
▼
Next.js Middleware (Route Protection)
│
▼
Express API (Auth Layer)
│
├── JWT (jose)
├── bcrypt password validation
├── Cookie-based session
└── Redis rate limiting (login)

        ▼

Socket.IO Server
│
├── JWT verification during handshake
├── Room join/leave
├── Broadcast messaging
└── Redis rate limiting (ping + messages)

⸻

🔐 Authentication Flow 1. User logs in via /auth/login 2. Backend validates credentials using bcrypt 3. JWT is signed using jose 4. JWT is stored as an HttpOnly cookie 5. Next.js middleware protects /playground 6. WebSocket handshake verifies JWT before connection

Logout clears the cookie and invalidates access to protected routes.

⸻

⚡ Features
• JWT-based authentication (HttpOnly cookie)
• Protected routes via Next.js middleware
• Secure WebSocket authentication
• Room-based real-time messaging
• Redis-backed rate limiting:
• Login endpoint
• WebSocket ping
• Room messaging
• Structured separation of concerns
• Environment-based configuration
• Clean git history with feature-scoped commits

⸻

🧩 Tech Stack

Frontend
• Next.js (App Router)
• TypeScript
• TailwindCSS
• Socket.IO Client

Backend
• Express
• Socket.IO
• jose (JWT)
• bcrypt
• Redis
• rate-limiter-flexible
• ioredis

⸻

🛡 Security Considerations
• JWT stored in HttpOnly cookies
• SameSite cookie protection
• WebSocket auth verification before connection
• Rate limiting backed by Redis (distributed-safe)
• Protected routes using Edge Middleware
• No sensitive tokens stored in localStorage

---

📂 Project Structure

PulseX/
│
├── frontend/
│ ├── src/app/
│ ├── src/middleware.ts
│ └── ...
│
├── backend/
│ ├── src/auth/
│ ├── src/config/
│ ├── src/rate-limit/
│ ├── src/server.ts
│ └── ...
│
└── README.md

📈 Why This Project Matters

PulseX focuses on backend architecture and real-time system design rather than UI complexity.

It demonstrates understanding of:
• Auth lifecycle management
• Secure cookie-based sessions
• WebSocket security
• Distributed rate limiting
• Separation of responsibilities
• Production-style structure

⸻

🧠 Future Improvements
• Structured logging (pino)
• Environment validation layer
• Dockerized setup
• Horizontal scaling via Redis adapter
• CI pipeline


## 🧪 Local Development

### Prerequisites

Make sure the following are installed:

- Node.js (v18+ recommended)
- npm
- Redis

---

### 1️⃣ Start Redis

If using Homebrew on macOS:

```bash
brew services start redis

Verify Redis is running:
redis-cli ping

____


2️⃣ Backend Setup
-Navigate to the backend directory:
-cd backend
-npm install
-Create a .env file inside backend/:
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=your_super_secret_key
REDIS_URL=redis://localhost:6379
-Start the backend server:
-npm run dev

____

3️⃣ Frontend Setup
-cd frontend
-npm install
-npm run dev


⸻

4️⃣ Test the Application
	1.	Open http://localhost:3000
	2.	Login with test credentials
	3.	Access /playground
	4.	Join a room and send real-time messages
	5.	Test rate limiting
	6.	Logout and verify route protection
