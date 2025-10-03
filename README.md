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

3. Create the required MySQL table:

   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NULL,
     mobile_number VARCHAR(25) NULL,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. Install dependencies and start the API server:

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

2. The app expects the backend to run on `http://localhost:5000` by default. Override with `VITE_API_BASE_URL` if needed.

### Features

- Responsive split-screen layout with modern styling.
- Signup, login, remember-me, and password reset request flows.
- JWT-protected profile endpoint.
- Password hashing with bcrypt and transactional email via Nodemailer.
