# TravelPlanner Frontend

React 19 + Vite SPA for the TravelPlanner microservices application.

## Setup

```bash
npm install --legacy-peer-deps
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8387
```

```bash
npm run dev
```

## Architecture

- **Auth:** `AuthContext` + JWT in `localStorage`
- **Plans:** `TravelPlanContext` with `useReducer`; tab hooks under `src/hooks/plan/`
- **Sharing:** public `/shared/:token` route; `sharedApi` for unauthenticated share endpoints
- **API:** `src/services/` — one module per bounded context

See the root [README.md](../README.md) for full system documentation.
