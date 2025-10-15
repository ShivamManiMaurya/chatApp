# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack chat application called "BaakBaak" with authentication and email functionality. The project is a monorepo containing both backend (Node.js/Express) and frontend (React/TypeScript/Vite) applications.

**Current Status:** Early development stage. Authentication system (signup/login/logout) is implemented with JWT tokens and email welcome messages. The chat messaging functionality is stubbed but not yet implemented.

## Architecture

### Backend (Node.js + Express + MongoDB)
- **Framework:** Express.js 5.x with ES modules (`type: "module"`)
- **Database:** MongoDB via Mongoose ODM
- **Authentication:** JWT tokens stored in HTTP-only cookies with bcryptjs for password hashing
- **Email:** Nodemailer with Gmail SMTP for transactional emails (welcome emails on signup)
- **Structure:**
  - `src/app.js` - Main application entry point, sets up Express server and middleware
  - `src/routes/` - API route handlers (auth, message)
  - `src/controllers/` - Business logic for routes
  - `src/models/` - Mongoose schemas (User model)
  - `src/lib/` - Utility functions and services (database connection, token generation, email)
  - `src/helpers.js` - Validation utilities (email regex, password validation)

### Frontend (React + TypeScript + Vite)
- **Framework:** React 19.x with TypeScript
- **Build Tool:** Vite 7.x
- **Linting:** ESLint with TypeScript support
- **Structure:**
  - Currently has default Vite template structure
  - Chat UI not yet implemented

### Key Technical Details

1. **Environment Variables:** Backend requires `PORT`, `MONGO_URI`, `NODE_ENV`, `JWT_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` in `.env`

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

## Development Commands

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

2. **Git Branch:** Currently on `email` branch. Main branch is not explicitly set but likely `main` or `master`.

3. **Code Style:**
   - Backend uses ES6 module syntax (`import`/`export`)
   - Frontend uses TypeScript with React functional components
   - Console.error/console.log used throughout for debugging

4. **Message Routes:** The message routing (`src/routes/message.route.js`) exists but has no implementation yet - this is the next major feature area to develop.

5. **Frontend-Backend Connection:** No API integration setup yet in the frontend. The frontend still shows the default Vite template.

6. **Password Validation:** Uses both regex patterns and a detailed validation function in `backend/src/helpers.js` that provides specific error messages for each password requirement.

7. **Cookie Configuration:** JWT cookie name is `jwt`, expires in 7 days, with security flags dependent on `NODE_ENV`.
