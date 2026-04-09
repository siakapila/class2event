# Class2Event – Advanced Campus Event & Attendance Platform

A full-stack, production-grade web application tailored for university ecosystems. It serves as an integrated event management and real-time attendance system featuring a centralized strict Role-Based Access Control (RBAC) architecture for **Clubs, Students, and Teachers**.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Security](https://img.shields.io/badge/Security-Hardened-red)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

---

## 🚀 Key Features

- **Department & Section Hierarchy**: Students are strictly mapped to their Department (e.g., CSE, IT) and Section during signup, allowing highly segmented data structures.
- **Teacher Analytics Dashboard**: Teachers get a minimized 2-click interface to query Department & Section-wise student attendance data with one-click export (CSV/PDF) features to guarantee transparency.
- **Paid Event Integrations**: Built-in support for ticketing/paid registration. Clubs upload a custom payment QR code and set fees, while configuring the gateway to forcefully demand securely uploaded UPI Transaction IDs and digital payment screenshots from students to prevent discrepancies.
- **Organizers & Teams**: Support for solo, group, and organizing committee registrations.
  
## 🔐 Security & Architecture

- **Strict 3-Way Authentication**: Isolated environments for Clubs, Students (`@muj.manipal.edu`), and Teachers (`@jaipur.manipal.edu`).
- **OTP Verification Engine**: Replaced traditional UUID links with a dynamic 6-digit OTP verification flow backed by Nodemailer/Ethereal and an ephemeral in-memory cache system to combat server bloat.
- **Hardened Server Security**: 
  - Complete password hashing via `bcryptjs`.
  - Stateless JWT token authorization enforced dynamically through active Postgres database checking.
  - Bruteforce protection (`express-rate-limit`), Header manipulation defense (`helmet`), and Parameter Pollution protection (`hpp`).
- **Dockerized Infrastructure**: Effortlessly spin up the entire isolated backend and PostgreSQL container network via Docker Compose.

---

## 🛡️ Authentication Flow

1. **Signup**: Users register matching their rigid domain requirements. The system intercepts the request, generates a secure 6-digit OTP via active cache, and holds the commit.
2. **Verification**: Users input the OTP they securely receive. The ephemeral token is validated (timing constraints enforced) and the user safely commits to the database as fully verified.
3. **Login**: Authenticated users receive a JWT access token. 
4. **Protected Access**: Advanced middleware strips incoming requests and cross-references active tokens dynamically to the user base, forcefully blocking unauthorized roles (`403 Forbidden`).

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
npx prisma generate
npx prisma db push
node prisma/seed.js # Required to immediately load the test mock users!
```

### 4. Run Development Servers

From the root directory, start both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Environment**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## 📂 Architecture Structure

```
class2event/
├── backend/
│   ├── prisma/             # Relational Database Schema & Seeder
│   ├── src/
│   │   ├── lib/            # External APIs (Mailer, Database singletons)
│   │   ├── middleware/     # Core RBAC & JWT Authorization rules
│   │   └── routes/         # Express endpoints mapping (auth, events, dashboards)
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Dynamic View Layer (Vite + React + Tailwind)
└── docker-compose.yml      # Container Orchestration
```
