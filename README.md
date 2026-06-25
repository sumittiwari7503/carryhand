# 🛍️ CarryHand — On-Demand Shopping Assistance Platform

> Hire verified assistants who carry your bags while you shop. Available at malls, markets, airports, and more.

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Sample Login Credentials](#sample-login-credentials)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)

---

## 🎯 Project Overview

**CarryHand** solves a real problem: people buy many items while shopping in malls, local markets, airports, and tourist places. Carrying heavy bags becomes tiring and inconvenient.

**Solution:** Users instantly book a verified shopping assistant for a specific duration. The assistant stays with the user, carries their bags, and accompanies them to their vehicle or drop-off point.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## ✨ Features

### 👤 Customer
- Register / Login with JWT auth
- Book an assistant with location, duration & payment selection
- 3-step booking flow (Location → Duration → Payment)
- View booking history with status tracking
- Live tracking page with mock map & assistant position
- Emergency SOS button during active booking
- Dashboard with stats (total, active, completed, spent)

### 🧑‍💼 Shopping Assistant
- Register / Login as assistant role
- Profile with bio, languages, experience, city
- Toggle Online / Offline availability
- View & Accept / Reject pending booking requests
- Start and Complete active jobs
- Earnings dashboard (total earnings, jobs done, rating)
- Pending approval workflow

### 🔐 Admin
- Dashboard with platform-wide stats
- Approve / Reject pending assistant applications
- View all bookings with status filters
- User management overview
- Revenue analytics

---

## 📁 Folder Structure

```
carryhand/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── bookingController.js   # CRUD + status updates
│   │   ├── assistantController.js # Assistant profiles & availability
│   │   ├── adminController.js     # Admin dashboard & approvals
│   │   └── reviewController.js    # Ratings & reviews
│   ├── middleware/
│   │   └── auth.js                # JWT protect + role authorization
│   ├── models/
│   │   ├── User.js                # Customer / Assistant / Admin
│   │   ├── Assistant.js           # Assistant profile & stats
│   │   ├── Booking.js             # Booking lifecycle
│   │   └── Review.js              # Ratings after completed jobs
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── assistants.js
│   │   ├── admin.js
│   │   ├── users.js
│   │   └── reviews.js
│   ├── utils/
│   │   └── seed.js                # Sample data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── UI.tsx          # Spinner, Alert, Badge, etc.
│   │   │       └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Global auth state
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Hero, How it works, FAQ, CTA
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ContactPage.tsx
│   │   │   ├── CustomerDashboard.tsx
│   │   │   ├── AssistantDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BookingPage.tsx     # 3-step booking wizard
│   │   │   ├── TrackingPage.tsx    # Live tracking + SOS
│   │   │   ├── ProfilePage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── api.ts              # Axios instance + interceptors
│   │   ├── App.tsx                 # Routes + layout
│   │   ├── main.tsx
│   │   └── index.css               # Tailwind + custom classes
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                    # Root scripts
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1 — Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourname/carryhand.git
cd carryhand

# Install all dependencies
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/carryhand
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> For MongoDB Atlas: replace MONGODB_URI with your Atlas connection string.

### Step 3 — Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 1 admin account
- 3 customer accounts
- 4 assistant accounts (3 approved, 1 pending)
- 4 sample bookings
- 1 sample review

### Step 4 — Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## 🔑 Sample Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@carryhand.com | admin123 |
| **Customer** | priya@example.com | password123 |
| **Customer** | rahul@example.com | password123 |
| **Assistant** | ramesh@example.com | password123 |
| **Assistant** | sunita@example.com | password123 |

> Demo credentials are also shown on the Login page for convenience.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Bookings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/bookings` | Create booking | Customer |
| GET | `/api/bookings` | Get my bookings | All |
| GET | `/api/bookings/pending` | Get pending bookings | Assistant |
| GET | `/api/bookings/:id` | Get booking by ID | All |
| PUT | `/api/bookings/:id/status` | Update status | All |
| POST | `/api/bookings/:id/sos` | Trigger SOS | All |

### Assistants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assistants` | List approved assistants |
| GET | `/api/assistants/me` | My assistant profile |
| PUT | `/api/assistants/me` | Update assistant profile |
| PUT | `/api/assistants/toggle-availability` | Go online/offline |
| GET | `/api/assistants/:userId` | Get assistant by user ID |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats + recent bookings |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/assistants/pending` | Pending approvals |
| PUT | `/api/admin/assistants/:id/approve` | Approve/reject assistant |
| GET | `/api/admin/bookings` | All bookings |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Submit review | Customer |
| GET | `/api/reviews/assistant/:id` | Get assistant reviews |

---

## 🎨 Design System

- **Primary Color:** Orange (#f97316) — brand identity
- **Font:** Inter (body) + Plus Jakarta Sans (headings)
- **Border Radius:** xl (12px) for inputs, 2xl (16px) for cards
- **Shadows:** Minimal, flat design with subtle elevation on hover
- **Animations:** fade-in, slide-up on page load; pulse on live elements

---

## 🔒 Security

- Passwords hashed with bcryptjs (12 salt rounds)
- JWT tokens with configurable expiry
- Role-based access control on all protected routes
- Input validation on backend controllers
- CORS configured for frontend origin only

---

## 📱 Responsive Design

Fully responsive across:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1280px+)

---

## 🚢 Deployment Notes

**Backend (e.g., Railway, Render, Heroku):**
```bash
npm start
```
Set all environment variables in the dashboard.

**Frontend (e.g., Vercel, Netlify):**
```bash
npm run build
# Dist folder: frontend/dist
```
Set `VITE_API_URL` if not using Vite proxy.

---

## 📄 License

MIT © 2026 CarryHand
