# PWA Authentication Starter

This repository contains a minimal Progressive Web App authentication example built with **React (Vite)** on the frontend and **Node.js + Express + MySQL** on the backend. It demonstrates how to create a signup/login flow that stores a JWT in `localStorage` and guards protected routes on both the client and the server.

## Project structure

```
app_developement/
├── frontend/   # React + Vite client
└── backend/    # Express + MySQL API
```

## Getting started

### Prerequisites

* Node.js 18+
* pnpm / npm / yarn
* MySQL 8 (phpMyAdmin optional but recommended)

### Backend setup

1. Copy the environment template and update the variables with your MySQL credentials and desired JWT secret:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env as needed
   ```

2. Install dependencies and start the API server:

   ```bash
   npm install
   npm run dev
   ```

   The server automatically ensures the `users` table exists before listening on the configured `PORT` (default `4000`).

### Frontend setup

1. Install dependencies and start the Vite dev server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Create a `VITE_API_URL` environment variable (for example in `frontend/.env`) that points to the backend base URL. By default the frontend falls back to `http://localhost:4000/api`.

3. Open the printed URL (default `http://localhost:5173`) in your browser. You can register a new account, log in, and you will be redirected to the protected welcome page. The JWT is stored in `localStorage` to persist the session.

### Database schema

The backend automatically creates the required table when it starts, but you can also run the SQL manually in phpMyAdmin or the MySQL CLI:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## API overview

| Method | Endpoint   | Description                       |
|--------|------------|-----------------------------------|
| POST   | `/api/signup`  | Creates a new user account.        |
| POST   | `/api/login`   | Authenticates a user and returns a JWT. |
| GET    | `/api/profile` | Returns the authenticated user profile. |

All protected requests require an `Authorization: Bearer <token>` header that contains the JWT returned from the login endpoint.

## Security considerations

* Passwords are hashed using `bcrypt` before being stored in the database.
* JWTs expire after 24 hours; adjust the `TOKEN_TTL_SECONDS` constant if needed.
* Remember to use HTTPS in production so that tokens are transmitted securely.

## Progressive Web App considerations

You can extend this starter by adding a service worker and manifest to turn the React app into a full PWA. The current setup focuses on authentication and provides a solid base for further enhancements.
