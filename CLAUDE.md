# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack chat application called "BaakBaak" with authentication and email functionality. The project is a monorepo containing both backend (Node.js/Express) and frontend (React/TypeScript/Vite) applications.

**Current Status:** Active development. Authentication system (signup/login/logout) is implemented with JWT tokens and email welcome messages. Rate limiting with Redis (sliding window counter algorithm) is implemented. Cloudinary integration for profile pictures is configured. The chat messaging functionality is stubbed but not yet implemented.

## Architecture

### Backend (Node.js + Express + MongoDB + Redis)
- **Framework:** Express.js 5.x with ES modules (`type: "module"`)
- **Database:** MongoDB via Mongoose ODM
- **Cache/Rate Limiting:** Redis (v5.9.0) for rate limiting with sliding window counter algorithm
- **Authentication:** JWT tokens stored in HTTP-only cookies with bcryptjs for password hashing
- **Email:** Nodemailer with Gmail SMTP for transactional emails (welcome emails on signup)
- **File Storage:** Cloudinary for profile picture uploads
- **Structure:**
  - `src/app.js` - Main application entry point, sets up Express server, Redis client, and middleware
  - `src/routes/` - API route handlers (auth, message)
  - `src/controllers/` - Business logic for routes
  - `src/models/` - Mongoose schemas (User model)
  - `src/middlewares/` - Auth middleware (`protectedRoute`) and rate limiter middleware
  - `src/lib/` - Utility functions and services:
    - `db.js` - MongoDB connection
    - `generateToken.js` - JWT token generation
    - `email/` - Email service and templates
    - `cloudinary.js` - Cloudinary configuration
    - `rate-limiters/sliding-window-counter/` - Rate limiter implementation
  - `src/helpers.js` - Validation utilities (email regex, password validation)

### Frontend (React + TypeScript + Vite)
- **Framework:** React 19.x with TypeScript
- **Build Tool:** Vite 7.x
- **Linting:** ESLint with TypeScript support
- **Structure:**
  - Currently has default Vite template structure
  - Chat UI not yet implemented

### Key Technical Details

1. **Environment Variables:** Backend requires in `.env`:
   - `PORT` - Server port (default: 3000)
   - `MONGO_URI` - MongoDB connection string
   - `NODE_ENV` - Environment mode (development/production)
   - `JWT_SECRET` - Secret key for JWT signing
   - `GMAIL_USER` - Gmail address for sending emails
   - `GMAIL_APP_PASSWORD` - Gmail app password
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - Redis runs on default localhost:6379 (configurable via Redis client options)

2. **Authentication Flow:**
   - Passwords must contain: 6+ chars, lowercase, uppercase, number, special character
   - Emails are normalized to lowercase before storage
   - JWT tokens expire after 7 days
   - Tokens stored in HTTP-only cookies with `sameSite: "strict"` for CSRF protection
   - Token generation happens in `src/lib/generateToken.js` backend/src/lib/generateToken.js:3

3. **Email System:**
   - Welcome emails sent on successful signup via `src/lib/email/mailer.js`
   - Email templates defined in `src/lib/email/template.js`
   - Uses Gmail SMTP transport via nodemailer

4. **Database:**
   - MongoDB connection managed in `src/lib/db.js` backend/src/lib/db.js:3
   - User model has fields: email (unique), name (min 3 chars), password (hashed), profilePic (optional)
   - Timestamps enabled for createdAt/updatedAt

5. **API Endpoints:**
   - `POST /api/auth/signup` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/logout` - Clear auth cookie
   - `GET /api/message/send` - (Stubbed, not implemented)

6. **Rate Limiting:**
   - Uses sliding window counter algorithm with Redis for precise rate limiting
   - Implementation in `src/lib/rate-limiters/sliding-window-counter/ratelimiter.swc.js`
   - Middleware factory in `src/middlewares/rateLimiter.slidingWindowCounter.js`
   - Currently applied to `/api/message` routes
   - Returns standard rate limit headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
   - On limit exceeded: HTTP 429 with `Retry-After` header
   - Uses Redis sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) for atomic operations
   - Fallback: If Redis fails, requests are allowed to pass through (fail-open behavior)

7. **Middleware Execution Order:**
   - `express.json()` - Parse JSON request bodies (5mb limit)
   - `cookieParser()` - Parse cookies for JWT extraction
   - Rate limiter - Applied per-route (currently on `/api/message`)
   - `protectedRoute` - JWT verification middleware (applied to specific routes requiring auth)

## Development Commands

### Prerequisites
Ensure Redis is running locally on port 6379 before starting the backend:
```bash
# On Windows (if installed via WSL or native)
redis-server

# Check if Redis is running
redis-cli ping  # Should return "PONG"
```

### Backend
```bash
cd backend

# Install dependencies
npm install

# Start development server with auto-reload (runs on port 3000 by default)
npm run dev

# Start production server
npm start
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server (typically runs on port 5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Important Notes

1. **Sensitive Data:** The `.env` file contains sensitive credentials (MongoDB URI, Gmail app password, JWT secret). Never commit this file or expose these values.

2. **Git Branches:**
   - `main` - Main/default branch
   - `email` - Email feature implementation (merged)
   - `rate-limiter` - Current active branch with rate limiting implementation

3. **Code Style:**
   - Backend uses ES6 module syntax (`import`/`export`)
   - Frontend uses TypeScript with React functional components
   - Console.error/console.log used throughout for debugging

4. **Message Routes:** The message routing (`src/routes/message.route.js`) exists but has no implementation yet - this is the next major feature area to develop.

5. **Frontend-Backend Connection:** No API integration setup yet in the frontend. The frontend still shows the default Vite template.

6. **Password Validation:** Uses both regex patterns and a detailed validation function in `backend/src/helpers.js` that provides specific error messages for each password requirement.

7. **Cookie Configuration:** JWT cookie name is `jwt`, expires in 7 days, with security flags dependent on `NODE_ENV`.

8. **Redis Integration:**
   - Redis client initialized in `src/app.js` and passed to rate limiter middleware
   - Connection error handling with console logging
   - Rate limiter uses Redis sorted sets for storing request timestamps
   - Each rate-limited key gets a unique Redis key: `rate_limit:{userId|IP}`
   - Automatic cleanup of expired entries using TTL (Time To Live)

9. **Authentication Middleware:**
   - `protectedRoute` in `src/middlewares/auth.middleware.js`
   - Accepts JWT from either cookies (`req.cookies.jwt`) or Authorization header (`Bearer <token>`)
   - Verifies token and attaches `req.userId` to request object
   - Returns specific error messages for expired tokens, invalid tokens, and missing tokens
