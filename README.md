# PWA Based Web app 

Full-stack Progressive Web App demonstrating a modern authentication flow with a React (Vite) frontend and a Node.js + Express + MySQL backend.

## Getting Started

### Backend

1. Copy the environment template:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update `.env` with your database and email credentials.

3. Create the required MySQL tables:

   ```sql
   CREATE TABLE IF NOT EXISTS admin (
     id INT AUTO_INCREMENT PRIMARY KEY,
     admin_name VARCHAR(150) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     mobile_number VARCHAR(25) NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS dashboardlinks (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     page VARCHAR(32) NOT NULL,
     link TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT fk_dashboardlinks_user_email FOREIGN KEY (email) REFERENCES users(email)
       ON DELETE CASCADE
   );
   ```

4. Update `.env` with the database credentials, JWT secret, email settings, and an `ADMIN_CREATION_TOKEN` value used to authorise the first admin signup.

5. Install dependencies and start the API server:

   ```bash
   npm install
   npm run dev
   ```

### Frontend

1. Install dependencies and start the development server:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. The app expects the backend to run on `http://localhost:5000` by default. Override with `VITE_API_BASE_URL` if needed (set to the `/api` base path of your server).

3. Admin pages call the same origin by default. If you proxy the API elsewhere, ensure the admin endpoints are reachable at `<API_HOST>/admin/*`.

### Features

- Admin-protected signup/login with token-gated first admin creation.
- Admin console to create users, search accounts, and assign per-page iframe links.
- Dashboard, performance, and revenue pages render admin-managed iframe content per user with graceful fallbacks.
- Login, remember-me, and password reset request flows for end users.
- JWT-protected APIs with role-based middleware and bcrypt password hashing.

### Admin workflow

1. Set a secure `ADMIN_CREATION_TOKEN` in the backend `.env` file before starting the API.
2. Visit `/admin/signup` and supply the admin name, email, password, and the creation token to bootstrap the first admin user.
3. Sign in at `/admin/login` and you will be redirected to `/admin/createuserAccount`.
4. From the admin console, search for existing users, create new user accounts, and assign iframe links for the dashboard, performance, and revenue pages.
5. Regular users sign in at `/login` only; their dashboards load any links configured for their email address.
