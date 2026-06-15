# Smart Parking Management System

**Final Year Project:** *Designing and Developing a Model of an Automated Smart Parking System Based on an Arduino Microcontroller*

A production-ready full-stack parking management system with simulated Arduino HC-SR04 ultrasonic sensor integration, JWT authentication, real-time monitoring, and comprehensive analytics.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Axios, Zustand, React Hook Form, Recharts |
| Backend | Node.js, Express.js, TypeScript, Prisma ORM, SQLite, JWT, Zod |
| IoT Simulation | Arduino HC-SR04 ultrasonic sensor simulator (15s interval) |

## Features

- **Dashboard** — Real-time occupancy, revenue, zone utilization, live charts
- **Parking Slots** — Visual grid (green=available, red=occupied), search & filter
- **Vehicle Management** — CRUD, parking history, search
- **Entry & Exit** — Check-in/out with automated fee calculation
- **Reports** — Daily/weekly/monthly analytics, CSV & PDF export
- **Settings** — Facility config, Arduino simulation settings, user profile
- **Admin Panel** — User management, role-based access, system logs
- **Arduino Simulation** — Realistic HC-SR04 sensor events every 15 seconds

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Sample data seeder
│   └── src/
│       ├── config/            # Environment & database config
│       ├── controllers/       # Request handlers
│       ├── middleware/        # Auth, validation, error handling
│       ├── routes/            # API route definitions
│       ├── services/          # Business logic & Arduino simulator
│       ├── validators/        # Zod validation schemas
│       └── utils/             # JWT, helpers
├── frontend/
│   └── src/
│       ├── api/               # Axios API client
│       ├── components/        # Reusable UI components
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Application pages
│       ├── store/             # Zustand state management
│       └── utils/             # CSV/PDF export utilities
├── docs/
│   └── API.md                 # API documentation
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install all dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env

# Initialize database
cd backend
npm run db:push
npm run db:seed
```

### Development

```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 5173)
npm run dev:frontend
```

Open **http://localhost:5173**

### Default Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@parking.com | admin123 |
| Operator | operator@parking.com | operator123 |

## API Documentation

See [docs/API.md](docs/API.md) for complete endpoint reference.

## Arduino Simulation

The backend includes an HC-SR04 ultrasonic sensor simulator that:

- Runs every **15 seconds** (configurable via `ARDUINO_INTERVAL_MS`)
- Distance **< threshold** → slot marked **OCCUPIED**
- Distance **≥ threshold** → slot marked **AVAILABLE**
- Randomly simulates vehicles entering/leaving
- Logs all readings to `SensorLog` table

## Database Schema

- **User** — Authentication & role-based access (ADMIN, OPERATOR, USER)
- **Vehicle** — Registered vehicles with plate number, owner, type
- **ParkingSlot** — Parking spaces with status and sensor data
- **ParkingTransaction** — Entry/exit records with duration and fees
- **SensorLog** — Arduino sensor event history
- **SystemLog** — Admin activity audit trail
- **SystemSettings** — Facility configuration

## License

MIT
