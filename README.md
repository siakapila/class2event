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
```

---

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
