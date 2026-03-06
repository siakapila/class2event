<<<<<<< HEAD
# class2event — Club Event Management System

A modern full-stack web app for managing club events, teams, and members.

---

## Tech Stack

**Frontend:** React 18 · Vite 5 · Tailwind CSS 3 · React Router DOM 6  
**Backend:** Node.js · Express 4 · Prisma 5 ORM  
**Database:** PostgreSQL (NeonDB)

---

## Project Structure

```
class2event/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Auth - login with remember me
│   │   │   ├── Signup.jsx         # Auth - signup with pw strength
│   │   │   ├── Dashboard.jsx      # Event list with search & stats
│   │   │   ├── CreateEvent.jsx    # Create/edit event + teams
│   │   │   └── EventDetails.jsx   # View event details + teams
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance with auth interceptor
│   │   ├── App.jsx                # Routes (protected + guest)
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env
│
└── backend/
    ├── prisma/
    │   └── schema.prisma          # clubs, events, team_members tables
    ├── src/
    │   ├── routes/
    │   │   ├── auth.js            # POST /signup, /login, GET /me
    │   │   └── events.js          # CRUD /api/events
    │   ├── middleware/
    │   │   └── auth.js            # JWT authentication middleware
    │   ├── lib/
    │   │   └── prisma.js          # Prisma client singleton
    │   └── index.js               # Express app entry
    └── .env
=======
# Class2Event – Club Event Management Platform

A full-stack web application that helps college clubs organize and manage events efficiently. The platform allows clubs to create events, manage participating teams, and track event schedules through a modern dashboard.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---
## Preview

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/520f2fd5-d7b8-4e35-b866-d8dc43519ada" />


---

##  Key Features

- Secure authentication system  
- Event creation and tracking  
- Team participation management  
- Modern dashboard UI  
- Responsive design  

---

##  Authentication

- Login page with email and password  
- Signup page for club registration  
- Form validation and error handling  

---

##  Event Management

- Create and manage events  
- Add venue, date, and time  
- Track event duration  
- Add detailed descriptions  

---

##  Team Management

- Add multiple teams to events  
- Add or remove members  
- Organized team structure  

---

##  Design Features

- Modern UI with Tailwind CSS  
- Gradient backgrounds  
- Responsive design  
- Smooth animations  

---

##  Tech Stack

**Frontend**
- React
- Tailwind CSS
- React Router
- Vite

**Backend**
- Node.js
- Express.js

**Database**
- PostgreSQL (NeonDB)

**ORM**
- Prisma

---

##  Getting Started

### Installation

Clone the repository

```bash
git clone https://github.com/shrutayyy07/class2event.git
cd class2event
npm install
npm run dev

```
## Open in browser: http://localhost:5173

---

---

## 📂 Project Structure

```
class2event/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
>>>>>>> 754b0967f3cb28f6dec598e3fee723505aa9cf65
```

---

<<<<<<< HEAD
## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd class2event
npm run install:all
```

### 2. Configure Environment

**Backend** — edit `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@ep-xxxx.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Get your NeonDB URL from: https://console.neon.tech

**Frontend** — edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

### 3. Set Up Database

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:push       # Push schema to NeonDB
npm run prisma:studio     # (optional) Open Prisma Studio
```

### 4. Run Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- Backend: http://localhost:3001  
- Health check: http://localhost:3001/health

---

## Database Schema

### `clubs`
| Field     | Type     | Notes          |
|-----------|----------|----------------|
| id        | cuid     | Primary key    |
| name      | String   | Unique         |
| email     | String   | Unique         |
| password  | String   | bcrypt hashed  |
| createdAt | DateTime |                |

### `events`
| Field       | Type     | Notes                  |
|-------------|----------|------------------------|
| id          | cuid     | Primary key            |
| name        | String   |                        |
| venue       | String   |                        |
| date        | DateTime |                        |
| duration    | Int      | Minutes                |
| description | String?  | Optional               |
| clubId      | String   | FK → clubs             |

### `team_members`
| Field      | Type   | Notes                     |
|------------|--------|---------------------------|
| id         | cuid   | Primary key               |
| teamName   | String | Groups members into teams |
| memberName | String |                           |
| role       | String | `member` or `organizer`   |
| eventId    | String | FK → events               |

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register club `{ clubName, email, password }`
- `POST /api/auth/login` — Login `{ email, password, rememberMe }`
- `GET /api/auth/me` — Get current club (Bearer token)

### Events (all require `Authorization: Bearer <token>`)
- `GET /api/events` — List all events
- `GET /api/events/:id` — Get single event with teams
- `POST /api/events` — Create event
- `PUT /api/events/:id` — Update event
- `DELETE /api/events/:id` — Delete event

---

## Features

- ✅ Authentication (signup/login/logout + remember me)
- ✅ Password strength indicator
- ✅ Protected & guest routes
- ✅ Create/edit/delete events
- ✅ Date, time & duration pickers
- ✅ Dynamic team & member management
- ✅ Organizer role per member
- ✅ Event search & filtering
- ✅ Upcoming vs past event grouping
- ✅ Delete confirmation modals
- ✅ Mobile-responsive UI
- ✅ JWT auth with auto-logout on expiry
- ✅ Error handling & validation (client + server)
=======
## How It Works

1. Users create an account or log in through the authentication system.
2. Authenticated users can create and manage events.
3. Each event stores details like venue, date, duration, and description.
4. Teams and members can be added to events dynamically.
5. The dashboard displays upcoming and past events for easy tracking.

---

## Future Enhancements

- Email notifications for events
- Advanced analytics dashboard
- Event reminders
- Export event data
- Role-based admin controls

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```
git checkout -b feature-name
```

3. Commit your changes

```
git commit -m "Add new feature"
```

4. Push to your branch

```
git push origin feature-name
```

5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**.

---

## Author

**Shruti**

GitHub:  
https://github.com/shrutayyy07
>>>>>>> 754b0967f3cb28f6dec598e3fee723505aa9cf65
