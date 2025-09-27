# app_developement

This repository contains a Progressive Web App (PWA) authentication example built with a React (Vite) frontend and a Node.js + Express + MySQL backend. The code demonstrates how to implement signup, login, and protected profile routes backed by JSON Web Tokens (JWTs).

## Frontend (React + Vite)

- `frontend/src/components/LoginForm.jsx` – login form that posts credentials to the backend and saves the returned JWT in `localStorage`.
- `frontend/src/components/SignupForm.jsx` – registration form that hashes and stores new users via the backend.
- `frontend/src/context/AuthContext.jsx` – centralizes authentication state, handles token persistence, and exposes helper methods to components.
- `frontend/src/pages/Welcome.jsx` – simple protected page that greets the authenticated user.
- Service worker registration in `frontend/src/main.jsx` and the manifest/service worker files under `frontend/public/` make the frontend installable as a PWA.

## Backend (Node.js + Express + MySQL)

- `backend/src/config/db.js` – MySQL connection pool using environment variables.
- `backend/src/controllers/authController.js` – signup, login, and profile logic using bcrypt for password hashing and JWT for session tokens.
- `backend/src/routes/authRoutes.js` – Express routes `/signup`, `/login`, and `/profile` (protected with middleware).
- `backend/src/middleware/authMiddleware.js` – verifies JWTs and attaches the decoded payload to the request.
- `backend/src/utils/schema.sql` – SQL helper to create the `users` table.

Copy `backend/.env.example` to `backend/.env`, fill in your MySQL credentials, and ensure the `users` table exists (via the included SQL). Then run `npm install` in both `frontend/` and `backend/` and start the servers with `npm run dev`.
