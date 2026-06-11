# TravelPlanner

A travel planning web application built on **Microsoft Service Fabric** with a **React** frontend. It follows a microservices architecture with **database-per-service**, JWT authentication, and an API gateway as the single entry point.

---

## Table of contents

1. [System overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technologies](#3-technologies)
4. [Prerequisites](#4-prerequisites)
5. [Database setup](#5-database-setup)
6. [Running the backend](#6-running-the-backend)
7. [Running the frontend](#7-running-the-frontend)
8. [Roles and access](#8-roles-and-access)
9. [API reference](#9-api-reference)
10. [Database structure](#10-database-structure)
11. [Project structure](#11-project-structure)
12. [Features (specification)](#12-features-specification)
13. [Use case diagram](#13-use-case-diagram)
14. [Service Fabric replicas](#14-service-fabric-replicas)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. System overview

TravelPlanner lets users organize trip information in one place: travel plans, destinations, daily activities, expenses and budget, packing checklist, and plan sharing via QR code links (VIEW or EDIT access).

The optional **course project extension** (interactive route map) is **not** included in this repository.

---

## 2. Architecture

The system is a Service Fabric application. Each microservice owns its data store and exposes operations through **Service Fabric Remoting**. The **ApiGateway** is the only HTTP entry point for the React client.

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│              (Vite, Tailwind CSS, Axios)                 │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP / REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  ApiGateway  [Stateless]                 │
│         ASP.NET Core Web API · JWT · CORS               │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │ SF Remoting          │          │
       ▼          ▼           ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐
│   User   │ │ Travel   │ │ Expense  │ │    Checklist     │
│ Service  │ │  Plan    │ │ Service  │ │    Service       │
│Stateless │ │ Service  │ │Stateful  │ │   Stateless      │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘
     │             │             │                │
     ▼             ▼             ▼                ▼
 UserServiceDB  TravelPlanServiceDB  ExpenseServiceDB  ChecklistServiceDB
```

### Services

| Service | SF type | Responsibility | Database |
|---------|---------|----------------|----------|
| **ApiGateway** | Stateless | HTTP API, JWT validation, CORS, authorization, orchestration on delete | — |
| **UserService** | Stateless | Registration, login, JWT issuance, BCrypt passwords, roles | `UserServiceDB` |
| **TravelPlanService** | Stateful | Plans, destinations, activities, share tokens | `TravelPlanServiceDB` |
| **ExpenseService** | Stateful | Expenses, categories, budget summary | `ExpenseServiceDB` |
| **ChecklistService** | Stateless | Packing list CRUD and toggle | `ChecklistServiceDB` |

Cross-service references use logical IDs (e.g. `TravelPlanId` on expenses). The gateway deletes related expenses and checklist items when a plan or user is removed.

---

## 3. Technologies

### Backend
- .NET 8
- Microsoft Service Fabric 10.x
- ASP.NET Core Web API
- Entity Framework Core + SQL Server
- BCrypt.Net, JWT Bearer, QRCoder
- SF Remoting

### Frontend
- React 19, Vite, Tailwind CSS 3
- Axios, React Router DOM 7
- Context API + `useReducer` for plan state
- Feature hooks per plan tab (`usePlanActivities`, etc.)

---

## 4. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Windows | 10/11 | Service Fabric requires Windows |
| .NET SDK | 8.0+ | |
| Visual Studio | 2022 | ASP.NET + Azure workloads |
| Service Fabric SDK | 10.x | |
| SQL Server | 2019+ | Express is sufficient |
| Node.js | 20+ | |
| npm | 10+ | |

---

## 5. Database setup

Each microservice uses its **own SQL Server database**. Run the script in `database/setup-databases.sql` in SSMS (or equivalent):

```sql
-- Creates login + UserServiceDB, TravelPlanServiceDB, ExpenseServiceDB, ChecklistServiceDB
```

Connection strings are configured per service in `appsettings.json`:

| Service | Database |
|---------|----------|
| UserService | `UserServiceDB` |
| TravelPlanService | `TravelPlanServiceDB` |
| ExpenseService | `ExpenseServiceDB` |
| ChecklistService | `ChecklistServiceDB` |

Migrations run automatically on service startup (`db.Database.Migrate()` in each service `Program.cs`).

### What about the old `TravelPlannerDB`?

The previous setup used a single shared database `TravelPlannerDB`. **The application no longer connects to it.** That database is not deleted automatically—it remains on SQL Server until you drop it manually. All new data goes into the four service databases above. For a clean start, run `database/setup-databases.sql` and let services migrate; you may drop `TravelPlannerDB` in SSMS if you no longer need it.

### Default admin user

On first startup, **UserService** seeds an admin account if it does not exist:

| Email | Password | Role |
|-------|----------|------|
| `admin@admin.com` | `Admin123!` | Admin |

You can also promote any registered user:

```sql
USE UserServiceDB;
UPDATE Users SET Role = 'Admin' WHERE Email = 'your@email.com';
```

---

## 6. Running the backend

1. Start **Service Fabric Local Cluster** (use **5-node** to demonstrate 3 replicas on stateful services, or 1-node for faster local dev).
2. Open `TravelPlannerApp/TravelPlannerApp.sln` in Visual Studio.
3. Set startup project to **`TravelPlannerApp`** (SF application). For 5-node deploy, use publish profile **`Local.5Node`**; for 1-node use **`Local.1Node`**.
4. Publish the application to the cluster (or **F5**).
5. Verify in Service Fabric Explorer (`http://localhost:19080`) that all services are **OK**.
6. API base URL: **`http://localhost:8387`** (from ApiGateway manifest).

---

## 7. Running the frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` (or create manually):

```env
VITE_API_URL=http://localhost:8387
```

```bash
npm run dev
```

App URL: **http://localhost:5173**

---

## 8. Roles and access

| Role | Capabilities |
|------|----------------|
| **User** | Full CRUD on own travel plans and related data; create/revoke share links |
| **Admin** | User management panel: list users, delete users (cascade), change roles |

### Security (production-oriented)

- JWT on protected routes; share links use token-based public endpoints
- **Plan ownership** enforced on destinations, activities, expenses, checklist, and sharing
- Destination/activity dates validated against plan period
- Expense categories validated on create and update
- Shared EDIT links: add/delete destinations and activities only via `/api/sharing/{token}/...`

---

## 9. API reference

Base URL: `http://localhost:8387`. Protected routes require `Authorization: Bearer <token>`.

### Auth & users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login (returns JWT) |
| GET | `/api/users/{id}` | ✓ | Get user |
| GET | `/api/users` | Admin | List users |
| DELETE | `/api/users/{id}` | Admin | Delete user + cascade |
| PATCH | `/api/users/{id}/role` | Admin | Change role |

### Travel plans

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/travel-plans/{id}` | ✓ |
| GET | `/api/travel-plans/user/{userId}` | ✓ |
| POST | `/api/travel-plans` | ✓ |
| PUT | `/api/travel-plans/{id}` | ✓ |
| DELETE | `/api/travel-plans/{id}` | ✓ |

### Destinations / Activities / Expenses / Checklist

Standard CRUD under `/api/destinations`, `/api/activities`, `/api/expenses`, `/api/checklist` (all require JWT + plan ownership).

**Expense categories:** `Transport`, `Accommodation`, `Food`, `Tickets`, `Shopping`, `Other`

**Activity statuses:** `Planned`, `Reserved`, `Completed`, `Cancelled`

### Sharing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/sharing` | ✓ | Create share token (VIEW/EDIT, default 7 days) |
| GET | `/api/sharing/plan/{travelPlanId}` | ✓ | Active tokens for plan |
| DELETE | `/api/sharing/{id}` | ✓ | Revoke token |
| GET | `/api/sharing/{token}/plan` | — | Plan + checklist (public) |
| GET | `/api/sharing/{token}/qr-code` | — | QR PNG |
| POST/DELETE | `/api/sharing/{token}/destinations` | — | EDIT: add/delete destination |
| POST/DELETE | `/api/sharing/{token}/activities` | — | EDIT: add/delete activity |

---

## 10. Database structure

Each service owns its tables in its database. `TravelPlanId` on expenses and checklist items is a logical foreign key (enforced in the API layer).

See EF migrations in each service project for exact schemas.

---

## 11. Project structure

```
TravelPlannerApp/
├── database/setup-databases.sql
├── TravelPlannerApp/          # SF application package
├── ApiGateway/                # Controllers, JWT, PlanAccessHelper
├── UserService/
├── TravelPlanService/
├── ExpenseService/
├── ChecklistService/
├── TravelPlanner.Shared/      # DTOs, interfaces, DomainConstants
└── frontend/                  # React SPA
```

---

## 12. Features (specification)

| Feature | Status |
|---------|--------|
| User registration & login (JWT) | ✓ |
| Travel plan CRUD with validation | ✓ |
| Destinations CRUD (dates within trip) | ✓ |
| Activities CRUD, list + calendar views | ✓ |
| Expenses & budget summary by category | ✓ |
| Packing checklist with toggle | ✓ |
| Share plan (VIEW/EDIT), QR code, revoke links | ✓ |
| Shared page: view plan; EDIT add/delete dest/activities | ✓ |
| PDF export from overview | ✓ |
| Admin panel | ✓ |
| Interactive route map (course extension) | ✗ removed |

---

## 13. Use case diagram

See [docs/use-case-diagram.md](docs/use-case-diagram.md) for a simple use case diagram (User, Admin, Guest; specification scope without the route-map extension).

---

## 14. Service Fabric replicas

| Profile | Stateful services (TravelPlan, Expense) | Stateless services |
|---------|----------------------------------------|--------------------|
| `Local.5Node.xml` | Min **3**, Target **3** replicas | 1 instance each |
| `Local.1Node.xml` | **1** replica each (cluster limit) | 1 instance each |

Configuration: `TravelPlannerApp/StartupServices.xml` and `StartupServiceParameters/Local.*.xml`. Switching cluster size alone does not change replicas—you must **redeploy** with the matching publish profile.

---

## 15. Troubleshooting

**Service won't start** — Check SQL Server, connection strings, and that all four databases exist.

**CORS errors** — Ensure your frontend origin is listed in `ApiGateway/ApiGateway.cs` (`WithOrigins`).

**401 on API** — Token expired (8h). Log in again. Match `JwtSettings:Secret` in ApiGateway and UserService.

**401 on shared link while logged in** — Expired JWT no longer redirects away from `/shared/`; clear storage or use a fresh link.

**QR wrong URL** — Set `AppSettings:FrontendUrl` in ApiGateway and TravelPlanService `appsettings.json`.

**Fresh databases after enum change** — If you had old Serbian category/status values, recreate databases or update rows to English constants.

**npm ERESOLVE (React 19 / lucide-react)** — Use `npm install` in `frontend/`; `legacy-peer-deps=true` is set in `frontend/.npmrc`.

---

## Before committing to GitHub

- Do **not** commit `frontend/.env` (secrets/URLs)—use `.env.example`.
- Do **not** commit `node_modules/`, `bin/`, `obj/`, `pkg/`.
- Optional: exclude local-only `.pptx` lecture files from the repo if the repository should contain only the application.
- Fix Git “dubious ownership” if needed:  
  `git config --global --add safe.directory C:/Users/pc/Desktop/TravelPlannerApp`
