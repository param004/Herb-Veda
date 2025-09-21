# Herb & Veda Ayurvedic Company — MERN Starter

This repository contains a minimal MERN stack setup with a polished, branded Login page for Herb & Veda Ayurvedic Company.

## What’s included

- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- Frontend: React (Vite), React Router, Axios
- Branded Login UI with validation, loading, and error states
- Seed script to create a demo user

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## Setup

1) Backend

```zsh
cd server
cp .env.example .env
# Edit .env if needed (MONGO_URI, JWT_SECRET, CLIENT_URL)
npm install
# optional: seed demo user
npm run seed:user
npm run dev
```

The API should start on http://localhost:5050

2) Frontend

```zsh
cd ../client
cp .env.example .env
# Ensure VITE_API_URL points to your backend (http://localhost:5050)
npm install
npm run dev
```

The app will run on http://localhost:5173 by default, but if that port is busy Vite will auto-pick the next one (e.g. 5174/5175). Check your terminal for the exact URL it prints, like:

```
Local:   http://localhost:5175/
```

A dev proxy sends `/api/*` to the backend on http://localhost:5050.

## Demo credentials (if seeded)

- Email: `demo@herbveda.com`
- Password: `Passw0rd!`

## Notes

- Protected route stub is at `/` (Dashboard). It requires a valid JWT stored in `localStorage`.
- Update styles/colors in `client/src/styles.css` and `client/src/assets/logo.svg` as desired.

## Troubleshooting: not showing on localhost

Common causes and quick fixes:

- Backend port mismatch: server runs on 5050, but client/env/README pointed to 5000. Fix by setting `VITE_API_URL=http://localhost:5050` in `client/.env` and restarting Vite.
- Frontend port confusion: Vite may switch to 5174/5175 if 5173 is used. Use the exact URL printed in the terminal.
- Port already in use (EADDRINUSE): kill stale processes.

```zsh
# Stop anything using these ports
lsof -ti tcp:5050 | xargs kill -9 2>/dev/null
lsof -ti tcp:5173 5174 5175 | xargs kill -9 2>/dev/null

# Restart backend
cd server
npm run dev

# In a new terminal, restart frontend
cd ../client
npm run dev
```

Optional sanity checks:

```zsh
curl -i http://localhost:5050/api/health || curl -i http://localhost:5050
```
