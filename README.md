# Class2Event – Club Event Management Platform

A production-grade, full-stack web application designed for organizing and managing university events with a strict 3-way Role-Based Access Control (RBAC) system for Clubs, Students, and Teachers.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Security](https://img.shields.io/badge/Security-Hardened-red)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

---

## 🚀 Key Features & Security Upgrades

- **Strict 3-Way Authentication**: Separate login/signup flows for Clubs, Students (`@muj.manipal.edu`), and Teachers (`@jaipur.manipal.edu`).
- **Email Verification**: Single-use, expiring UUID tokens sent via email (Nodemailer/Ethereal) to verify accounts before granting access to protected routes.
- **Hardened Security**: 
  - Password hashing via `bcryptjs`.
  - Stateless JWT authentication validated against the live database on every request to prevent replay attacks.
  - Rate Limiting (`express-rate-limit`) to prevent brute-force and credential stuffing.
  - HTTP Security Headers (`helmet`) and Parameter Pollution protection (`hpp`).
- **Event Management**: Create, view, and manage events and team participations securely.
- **Dockerized Infrastructure**: Effortlessly spin up the entire backend and PostgreSQL database using Docker Compose.

---

## 🛡️ Authentication Flow

1. **Signup**: Users register matching their specific domain requirement. The system hashes the password, creates an `unverified` account, and dispatches an email containing a secure token.
2. **Verification**: Users click the emailed link (`/api/auth/verify-email?token=...`). The token is validated (checked for reuse/expiration), the user is marked as verified, and the token is burned.
3. **Login**: Users log in to receive a JWT access token. 
4. **Protected Access**: The backend middleware intercepts requests, extracts the JWT, and queries the database to ensure the user still exists, has the correct role, and is fully verified. If not, access is strictly denied (`403 Forbidden`).

---

## 🐳 Docker Deployment (Recommended)

You can spin up the entire backend environment (Node.js API + PostgreSQL database) using Docker.

```bash
docker-compose up -d --build
```

The API will be available at `http://localhost:3001` and connected to the isolated Postgres container automatically.

---

## 🛠️ Manual Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/siakapila/class2event.git
cd class2event
npm run install:all
```

### 2. Configure Environment

Copy the example environment file in the backend:
```bash
cp backend/.env.example backend/.env
```
Fill in the `DATABASE_URL` and `JWT_SECRET`. By default, the email system will use Ethereal (a safe, fake SMTP generator) if you don't provide SendGrid/AWS keys.

In the frontend, create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Database Setup

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4. Run Development Servers

From the root directory, start both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 📂 Project Structure

```
class2event/
├── backend/
│   ├── prisma/             # Database Schema (ORM)
│   ├── src/
│   │   ├── lib/            # Email and Prisma singletons
│   │   ├── middleware/     # Strict RBAC & Auth middleware
│   │   └── routes/         # Auth, Event, Student, Teacher routes
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Vite + React + Tailwind
└── docker-compose.yml      # Container Orchestration
```
