# Codebase Overview

This document summarizes the architecture and major components of the PWA-based authentication application located in this repository.

## High-Level Architecture

The project is split into two main workspaces:

- **`backend/`** — Node.js (ESM) + Express API for authentication, JWT issuance, and password reset emails.
- **`frontend/`** — React (Vite) single-page application providing login, signup, and password reset flows.

The backend can optionally serve the built frontend from `frontend/dist` for production deployments. During development, the frontend and backend can run independently with the frontend targeting the backend REST API.

A shared MySQL database stores user accounts. Environment configuration is handled via `.env` files (copy from provided templates) and is required for both database connectivity and email delivery.

## Backend Details

### Entry Points

| File | Responsibility |
| ---- | -------------- |
| `src/server.js` | Loads environment variables, verifies the database connection, and starts the Express server. |
| `src/app.js` | Configures middleware, static hosting of the built frontend, and registers API routes under `/api`. |

### Configuration & Utilities

- `src/config/db.js` creates a MySQL connection pool using `mysql2/promise` and exposes a `testConnection` helper invoked on startup.
- `src/utils/email.js` configures a Nodemailer transporter with SMTP credentials and exports `sendResetEmail` used by the password reset flow.

### Middleware

- `src/middleware/authMiddleware.js` reads the `Authorization: Bearer <token>` header, verifies the JWT using `JWT_SECRET`, and attaches the decoded payload as `req.user` for downstream handlers.

### Controllers & Routes

`src/routes/authRoutes.js` maps REST endpoints to controller functions in `src/controllers/authController.js`:

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/signup` | `POST` | Validates user input, checks for duplicate email or mobile number, hashes the password with bcrypt, and inserts the user record. |
| `/api/login` | `POST` | Authenticates by email or mobile, verifies password, issues a JWT token, and returns user metadata. |
| `/api/profile` | `GET` | Protected route returning the authenticated user's profile data. |
| `/api/reset-password-request` | `POST` | If the email exists, generates a short-lived JWT and emails a reset link; always responds with a neutral success message to prevent enumeration. |
| `/api/reset-password` | `POST` | Validates a password reset token, enforces password constraints, and updates the stored hash. Handles expired/invalid token scenarios gracefully. |

The controller layer relies on shared helpers for token creation (`jwt.sign`), bcrypt hashing and verification, and error handling with consistent JSON responses.

### Environment Variables

Key variables expected in `backend/.env` include:

- `PORT` — API port (defaults to `5000`).
- `CLIENT_URL` — Used for CORS configuration and password reset links.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connectivity.
- `JWT_SECRET` — Secret for signing JWT access and reset tokens.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — SMTP credentials for Nodemailer.

## Frontend Details

### Application Shell

- `src/main.jsx` boots the React application inside a `BrowserRouter` and imports global styling from `App.css`.
- `src/App.jsx` defines the routing table with dedicated routes for login, signup, and password reset, and redirects unknown routes to `/login`.

### Shared Layout

- `src/components/AuthLayout.jsx` renders the shared split-screen layout with branding, illustration, header text, and customizable footer. It accepts the primary form content via `children`.

### Pages

Each page builds on `AuthLayout` and implements its respective form logic:

- `src/pages/Login.jsx`
  - Handles identifier/password submission, optional "remember me" persistence of the JWT (switching between `localStorage` and `sessionStorage`), and inline error/success messaging.
  - Toggles password visibility with icons from `react-icons`.
  - Provides navigation to the signup screen and password reset flow.

- `src/pages/Signup.jsx`
  - Collects optional email and mobile number along with password/confirmation, submits to `/api/signup`, and redirects to login on success.
  - Displays validation feedback returned by the backend.

- `src/pages/ResetPassword.jsx`
  - Supports two modes based on the presence of a `token` query parameter: requesting a reset email or finalizing a new password.
  - Normalizes API responses (even when non-JSON) and provides nuanced status messaging for success and error cases.

All three pages currently derive their API base URL from `import.meta.env.VITE_API_BASE_URL` with a fallback of `/api`, enabling same-origin deployments behind a reverse proxy. During local development they can be pointed at `http://localhost:5000/api` via environment configuration.

### Styling & Assets

- `src/App.css` defines responsive split-screen styling, typography, form controls, and interactive states for buttons and inputs.
- SVG assets (logo, illustrations) live under `src/assets/` and are imported by layout components.

### Build & PWA Configuration

- `vite.config.js` sets up the React plugin and development server. (`manifest.json` and `index.html` provide the PWA metadata for icons, theme colors, etc.)

## Data Model

A single `users` table (schema provided in the root `README.md`) persists authentication state. The backend stores hashed passwords only and timestamps account creation via `created_at`.

## Development Workflow

1. **Backend**: `npm install` & `npm run dev` in `backend/`. Ensure `.env` is populated and MySQL is reachable.
2. **Frontend**: `npm install` & `npm run dev` in `frontend/`. Optionally set `VITE_API_BASE_URL` in `frontend/.env` to point at the backend.
3. **Production**: Build the frontend (`npm run build`) and serve the generated `frontend/dist` directory from the Express server (`app.use(express.static(...))`).

## Notable Implementation Details

- JWTs are reused both for session authentication and for reset links with shorter expiration windows.
- Password reset requests always respond with the same success message to avoid leaking account existence.
- Remember-me toggles whether the JWT token is persisted to `localStorage` (long-lived) versus `sessionStorage` (cleared on tab close).
- Error handling in the backend centralizes `500` responses with logging via the Express error handler in `app.js`.

This overview should provide enough context to navigate and extend the codebase effectively.
