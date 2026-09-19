# FieldOps Management System

> A full-stack field operations management platform built with Next.js, NestJS, PostgreSQL and Prisma.

[![FieldOps CI Pipeline](https://github.com/Aashishrishu02/Fieldops-Nest/actions/workflows/ci.yml/badge.svg)](https://github.com/Aashishrishu02/Fieldops-Nest/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)](LICENSE)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Authentication](#6-authentication)
7. [Authorization / RBAC](#7-authorization--rbac)
8. [User Creation Flows](#8-user-creation-flows)
9. [Dashboard](#9-dashboard)
10. [User Management](#10-user-management)
11. [Attendance](#11-attendance)
12. [Field Visits](#12-field-visits)
13. [Database](#13-database)
14. [Local Development Setup](#14-local-development-setup)
15. [Environment Variables](#15-environment-variables)
16. [Running the Application](#16-running-the-application)
17. [Prisma Commands](#17-prisma-commands)
18. [API Documentation](#18-api-documentation)
19. [CI/CD](#19-cicd)
20. [Deployment](#20-deployment)
21. [Security](#21-security)
22. [Troubleshooting](#22-troubleshooting)
23. [Git Workflow](#23-git-workflow)
24. [Future Improvements](#24-future-improvements)
25. [License](#25-license)

---

## 1. Overview

**FieldOps** is an enterprise-grade field service and operations management platform designed for modern, distributed field teams. It delivers centralized coordination for:
- User provisioning and identity administration
- Granular, module-based Roles & Permissions (RBAC)
- Real-time technician attendance tracking and telemetry
- Scheduled on-site client visits lifecycle management
- Role-tailored operational intelligence dashboards

The system is architected as two decoupled applications within a single mono-repository: a high-performance **NestJS REST API** backend and a responsive, server-accelerated **Next.js 15 App Router** frontend.

---

## 2. Features

- **Dual-Mode User Provisioning**:
  - **System-Generated Accounts**: Single-click identity and password generation with complete user-side password lockdown.
  - **Invited Users**: Email invitations with cryptographically secure temporary passwords and mandatory first-login password rotation.
- **Enterprise RBAC Authorization**: Strict NestJS decorators and guards enforcing role and permission levels across all REST controllers.
- **Bi-Directional Attendance Telemetry**: Live digital shift clock, one-click check-in/out, automatic late/punctual calculation, and historical logs.
- **Field Visit CRM**: Complete dispatch workflow tracking visits through `PLANNED`, `IN_PROGRESS`, `COMPLETED`, and `CANCELLED` statuses.
- **Role-Tailored Intelligence Dashboards**: Real-time KPI summaries, punch logs, and schedule dispatching customized per role (`SUPERADMIN`, `MANAGER`, `FIELD_EMPLOYEE`).
- **Interactive OpenAPI / Swagger Documentation**: Fully documented REST endpoints accessible at `/api/docs`.
- **Production CI/CD Automation**: Automated GitHub Actions pipeline verifying Prisma schema generation, backend compilation, test suites, and frontend production builds.

---

## 3. Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router with Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (clean, minimal enterprise SaaS theme)
- **Icons**: Lucide React
- **Authentication Client**: Custom JWT bearer context with persistent local storage and automatic header attachment

### Backend
- **Framework**: NestJS 11 (Express platform)
- **Language**: TypeScript
- **Database Access**: Prisma ORM 6
- **Database Engine**: PostgreSQL
- **Security & Hashing**: Passport.js, Passport-JWT, Passport-Google-OAuth20, Bcrypt
- **Validation**: Class-Validator, Class-Transformer
- **Mailing**: Nodemailer (SMTP with fallback console logger)
- **Documentation**: Swagger / OpenAPI 3

---

## 4. Architecture

FieldOps enforces a strict, layered client-server architecture:

```
+-------------------------------------------------------------+
|                 Next.js 15 (TypeScript)                     |
|                 Frontend Web Application                    |
|                 (Port 3000 / localhost)                     |
+-------------------------------------------------------------+
                               |
                               | HTTPS / JSON REST API
                               | Bearer JWT Authentication
                               v
+-------------------------------------------------------------+
|                  NestJS 11 (TypeScript)                     |
|                   REST API Application                      |
|                 (Port 4000 / localhost)                     |
|                                                             |
|  [ Guards: JwtAuthGuard | RolesGuard | PermissionsGuard ]   |
|  [ Interceptors: TransformInterceptor | HttpExceptionFilter]|
+-------------------------------------------------------------+
                               |
                               | Prisma Client (v6)
                               v
+-------------------------------------------------------------+
|                   PostgreSQL Database                       |
|           Relational Tables & Foreign Keys                  |
+-------------------------------------------------------------+
```

### Authentication & Authorization Layers
- **Authentication**: JWT Bearer Tokens (7-day default duration) + Google OAuth 2.0.
- **Authorization**: Role-Based Access Control (RBAC) coupled with fine-grained Permission Guards (`@Permissions(...)`, `@Roles(...)`).

---

## 5. Project Structure

```text
fieldops-nest/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI pipeline
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma relational schema
│   │   └── seed.ts                # Database seed script
│   ├── src/
│   │   ├── attendance/            # Attendance module (check-in, check-out, logs)
│   │   ├── auth/                  # Auth module (JWT, Google OAuth, password reset)
│   │   ├── common/                # Shared guards, decorators, filters, interceptors
│   │   ├── dashboard/             # Role-tailored metrics & statistics
│   │   ├── health/                # System health check endpoint (/health)
│   │   ├── mail/                  # Nodemailer email integration & console fallbacks
│   │   ├── permissions/           # Fine-grained capability catalogue
│   │   ├── prisma/                # Prisma service wrapper
│   │   ├── roles/                 # Role entity management & permission assignments
│   │   ├── users/                 # User entity & provisioning logic
│   │   ├── visits/                # Field visits scheduling & state transitions
│   │   ├── app.module.ts          # Root backend module
│   │   └── main.ts                # Application bootstrap & Swagger configuration
│   ├── test/
│   │   └── health.spec.js         # Backend health check unit test
│   ├── .env.example               # Backend environment variables template
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── attendance/            # Attendance dashboard & timesheet page
│   │   ├── auth/callback/         # Google OAuth callback handler
│   │   ├── dashboard/             # Overview dashboard
│   │   ├── login/                 # Clean, minimal two-column login interface
│   │   ├── permissions/           # System permissions catalogue
│   │   ├── profile/               # User profile & account security policy
│   │   ├── reset-password/        # Password reset & mandatory first-login reset
│   │   ├── roles/                 # Roles management & permissions assignment
│   │   ├── users/                 # User directory, profile inspect, & provisioning
│   │   ├── visits/                # Field visits management & tracking
│   │   ├── layout.tsx             # Root application shell
│   │   └── page.tsx               # Entry point redirect
│   ├── components/                # Reusable UI components (Button, Card, Input, Modal, etc.)
│   ├── lib/                       # API clients, auth provider, & helper utilities
│   ├── .env.example               # Frontend environment variables template
│   ├── package.json
│   └── tailwind.config.ts
├── .gitignore                     # Root gitignore excluding secrets & build output
├── package.json                   # Root monorepo orchestration scripts
└── README.md                      # Project documentation
```

---

## 6. Authentication

FieldOps supports dual authentication mechanisms:

1. **Email and Password with JWT**:
   - Passwords hashed with `bcrypt` (10 salt rounds).
   - Validated against active accounts (`isActive = true`).
   - Generates a signed JWT payload containing user ID, email, and role.
2. **Google OAuth 2.0**:
   - Integrated via `passport-google-oauth20`.
   - Mounts at `GET /auth/google` and redirects via `GET /auth/google/callback`.
   - Auto-provisions Google users under the least-privilege `FIELD_EMPLOYEE` role.
3. **Session Termination**:
   - Client-side token disposal, redirecting to `/login`.

---

## 7. Authorization / RBAC

Access control operates on two coupled levels:
1. **Roles**:
   - `SUPERADMIN`: Full administrative clearance over users, roles, visits, and system configurations.
   - `MANAGER`: Management of operational team members, shift supervision, and visit scheduling.
   - `FIELD_EMPLOYEE`: Self-service attendance punching, viewing assigned site visits, and status advancement.
2. **Permissions**:
   - Fine-grained permission strings mapped to database roles via the `RolePermission` pivot table.
   - Examples: `USER_VIEW`, `USER_CREATE`, `ATTENDANCE_VIEW`, `VISIT_UPDATE`, `DASHBOARD_VIEW`.
   - Enforced in controllers via:
     ```typescript
     @UseGuards(JwtAuthGuard, PermissionsGuard)
     @Permissions(PermissionName.USER_CREATE)
     @Post()
     ```

---

## 8. User Creation Flows

FieldOps handles user creation via two purpose-built architectural workflows:

```
                            [ SuperAdmin Console ]
                                      |
             +------------------------+------------------------+
             |                                                 |
             v                                                 v
    [ CASE 1: SYSTEM GENERATED ]                      [ CASE 2: INVITED USER ]
  • SuperAdmin selects Role only.                   • SuperAdmin enters email & Role.
  • System creates unique email & password.         • System creates account & temp password.
  • Credentials displayed in copy modal.            • Credentials dispatched via email.
  • User can log in immediately.                    • First login forces mandatory reset.
  • mustChangePassword = false.                     • mustChangePassword = true.
  • Password changes strictly disabled.             • After reset -> mustChangePassword = false.
```

### Case 1: System-Generated User (Managed Account)
1. SuperAdmin navigates to **User Management** &rarr; **Create New User** &rarr; **System Generated**.
2. SuperAdmin selects the desired Role (e.g., `FIELD_EMPLOYEE`).
3. The system generates:
   - A unique managed username (e.g. `field_employee_4B91@fieldops.local`)
   - A cryptographically random, high-entropy password
4. Credentials are presented in an on-screen modal for copying or printing.
5. The account is marked with:
   - `creationType = SYSTEM_GENERATED`
   - `mustChangePassword = false`
6. **Security Lock**: Password modification, self-reset, and forgotten password endpoints reject system-generated accounts with `403 Forbidden`. Only a SuperAdmin can rotate credentials for these accounts.

### Case 2: Invited User (Self-Managed Account)
1. SuperAdmin navigates to **User Management** &rarr; **Create New User** &rarr; **Invite User**.
2. SuperAdmin inputs the user's corporate email address and assigns a Role.
3. The system generates a temporary password and sends an invitation email.
4. The account is created with:
   - `creationType = INVITED`
   - `mustChangePassword = true`
5. Upon the user's first login with the temporary password, the system detects `mustChangePassword = true` and forces an immediate redirect to `/reset-password?mandatory=true`.
6. Once the user submits their permanent password, `mustChangePassword` is toggled to `false`, and dashboard access is unlocked.

---

## 9. Dashboard

The dashboard (`/dashboard`) dynamically reconfigures its views and analytics depending on the authenticated role:
- **SuperAdmin**: System-wide headcount, present/late ratios, visit lifecycle breakdown, and recent registrations.
- **Manager**: Subordinate employee attendance roster, live shift tracker, and team visit progress.
- **Field Employee**: Personal telemetry shift clock (one-click Clock-In/Clock-Out), today's assigned visits, and completed milestone counters.

---

## 10. User Management

The User Management module (`/users`) allows administrators to:
- Filter users by Role, Account Type (`SYSTEM_GENERATED` vs `INVITED`), and Status (`Active` / `Inactive`).
- View comprehensive profile details and activity history.
- Regenerate credentials on-demand for system-generated accounts.
- Update profile metadata and toggle account activation status.

---

## 11. Attendance

The Attendance module (`/attendance`) captures workforce telemetry:
- **Check-In**: Records timestamp, geolocation data, and optional employee notes.
- **Automatic Status Evaluation**:
  - `PRESENT`: Clocked in on or before 09:30 AM.
  - `LATE`: Clocked in after 09:30 AM.
  - `HALF_DAY`: Completed partial shift.
- **Check-Out**: Calculates total elapsed shift duration and closes the session.
- **Reporting**: Managers and administrators can filter logs by employee, status, and date ranges.

---

## 12. Field Visits

The Field Visits module (`/visits`) tracks client site appointments:
- **Scheduling**: Assigns technician, client/customer name, site address, date/time, and mission purpose.
- **Lifecycle Transition**:
  ```
  [ PLANNED ]  ----->  [ IN_PROGRESS ]  ----->  [ COMPLETED ]
       |                                              ^
       +----------------> [ CANCELLED ] --------------+
  ```
- **Technician Execution**: Field technicians can view their assigned route and advance visit statuses directly from the field.

---

## 13. Database

FieldOps uses **PostgreSQL** paired with **Prisma ORM**. The data model consists of the following core entities:

- `User`: Accounts with role reference, creation type, password hash, and OAuth identities.
- `Role`: Security roles (`SUPERADMIN`, `MANAGER`, `FIELD_EMPLOYEE`, custom).
- `Permission`: Atomic granular capability permissions.
- `RolePermission`: Many-to-many join table mapping permissions to roles.
- `Attendance`: Shift records with check-in, check-out, duration, and status.
- `Visit`: Client visit appointments linked to an assigned technician.
- `PasswordResetToken`: Expiring cryptographic tokens for password reset workflows.

---

## 14. Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher (running locally or accessible remotely)
- **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone https://github.com/Aashishrishu02/Fieldops-Nest.git
cd fieldops-nest
```

### 2. Install Dependencies
You can install dependencies across both applications using the root orchestration script:
```bash
npm run install:all
```
*Or manually:*
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Backend Environment
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` with your PostgreSQL credentials:
```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fieldops_db?schema=public
JWT_SECRET=super_secure_development_jwt_secret_key_32chars
JWT_EXPIRES_IN=7d
SUPERADMIN_EMAIL=admin@fieldops.local
SUPERADMIN_PASSWORD=AdminPassword@123!
```

### 4. Initialize the Database
```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma db push

# Seed initial roles, permissions, and SuperAdmin
npm run prisma:seed
```

### 5. Configure Frontend Environment
```bash
cd ../frontend
cp .env.example .env.local
```
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 15. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Backend HTTP server port | `4000` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `FRONTEND_URL` | Frontend origin for CORS and OAuth redirects | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string for Prisma | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Cryptographic secret for signing JWTs | *(random 32+ char string)* |
| `JWT_EXPIRES_IN` | Duration before JWT expiration | `7d` |
| `SUPERADMIN_EMAIL` | Email used when seeding the SuperAdmin account | `admin@fieldops.local` |
| `SUPERADMIN_PASSWORD` | Password used when seeding the SuperAdmin account | `AdminPassword@123!` |
| `SUPERADMIN_NAME` | Display name for seed SuperAdmin | `System SuperAdmin` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | *(optional)* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | *(optional)* |
| `GOOGLE_CALLBACK_URL` | OAuth redirect endpoint on the backend | `http://localhost:4000/auth/google/callback` |
| `SMTP_HOST` | Outgoing SMTP email server host | `smtp.example.com` *(optional)* |
| `SMTP_PORT` | SMTP port (e.g., 587 or 465) | `587` *(optional)* |
| `SMTP_SECURE` | Use TLS (`true` for 465, `false` for 587) | `false` *(optional)* |
| `SMTP_USER` | SMTP username | `mailer@example.com` *(optional)* |
| `SMTP_PASSWORD` | SMTP password / App Password | *(optional)* |
| `SMTP_FROM` | Outgoing email sender header | `"FieldOps <no-reply@fieldops.local>"` |

> **Note**: If SMTP credentials are not specified, the backend automatically prints outgoing email content (including invited user credentials) directly to the console for development convenience.

### Frontend (`frontend/.env.local`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the NestJS backend API | `http://localhost:4000` |

---

## 16. Running the Application

### Option A: From the Root Directory
```bash
# Start backend in dev mode (Terminal 1)
npm run dev:backend

# Start frontend in dev mode (Terminal 2)
npm run dev:frontend
```

### Option B: From Individual Subdirectories
```bash
# In backend/
cd backend
npm run start:dev

# In frontend/
cd frontend
npm run dev
```

### Application Endpoints

| Service | URL | Purpose |
| :--- | :--- | :--- |
| **Frontend Portal** | `http://localhost:3000` | Web application interface |
| **Backend REST API** | `http://localhost:4000` | Core API server |
| **Swagger Documentation** | `http://localhost:4000/api/docs` | Interactive OpenAPI documentation |
| **Health Check** | `http://localhost:4000/health` | Service uptime and status probe |

---

## 17. Prisma Commands

All Prisma commands are run from the `backend/` directory or through root scripts:

```bash
# Generate the Prisma client code after schema modifications
npm run prisma:generate

# Push schema changes directly to the database (prototyping/development)
npx prisma db push

# Create and apply migrations in development
npx prisma migrate dev --name <migration_name>

# Apply pending migrations to production
npx prisma migrate deploy

# Open interactive web GUI to view/edit database records
npx prisma studio

# Seed or re-seed the database
npm run prisma:seed
```

---

## 18. API Documentation

Interactive API documentation is generated via Swagger / OpenAPI 3:

- **Local URL**: `http://localhost:4000/api/docs`
- **Features**:
  - Direct endpoint testing with Bearer JWT token injection (`Authorize` button).
  - Request/response schemas, DTO validation rules, and status codes.
  - Dedicated tags for `Auth`, `Users`, `Roles`, `Permissions`, `Attendance`, `Visits`, `Dashboard Analytics`, and `System Health`.

---

## 19. CI/CD

FieldOps includes an automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`) that executes on:
- Every `push` to `main`
- Every `pull_request` targeting `main`

### Pipeline Validation Steps:
1. **Backend Pipeline**:
   - Checks out repository and provisions Node.js 20.x with npm dependency caching.
   - Installs backend dependencies via `npm ci`.
   - Generates Prisma client with a safe CI connection string.
   - Validates TypeScript types and compiles backend (`npm run build`).
   - Runs backend test suites (`npm test`).
2. **Frontend Pipeline**:
   - Provisions Node.js 20.x with npm dependency caching.
   - Installs frontend dependencies via `npm ci`.
   - Validates Next.js build compilation across all static and dynamic routes (`npm run build`).

> **Security Note**: The CI workflow does not connect to the live production database or require production secrets.

---

## 20. Deployment

### Frontend Deployment (e.g., Vercel)
1. Import the repository in your hosting platform.
2. Set the **Root Directory** to `frontend`.
3. Set the **Framework Preset** to `Next.js`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The publicly accessible URL of your deployed backend (e.g., `https://api.yourdomain.com`).
5. Deploy.

### Backend Deployment (e.g., Render, Railway, Fly.io, AWS)
1. Set the **Root Directory** to `backend`.
2. **Build Command**: `npm ci && npx prisma generate && npm run build`
3. **Start Command**: `npm run start:prod`
4. Configure Environment Variables:
   - Set all variables listed in [Backend Environment Variables](#backend-backendenv).
   - Ensure `NODE_ENV=production`.
   - Update `FRONTEND_URL` to match your deployed frontend origin.
5. Apply database migrations during release: `npx prisma migrate deploy`.

### Managed Database
- Provision a managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS, Render Postgres).
- Ensure SSL is enabled if required by appending `?sslmode=require` to `DATABASE_URL`.

---

## 21. Security

- **Zero Secrets in Version Control**: All credentials, tokens, and database passwords are restricted to local `.env` and `.env.local` files, strictly ignored by `.gitignore`.
- **System-Generated Password Protection**: System-generated user accounts cannot execute self-service password modifications, preventing unauthorized credential alterations.
- **Mandatory Password Reset**: Invited users cannot bypass the password change screen on their initial login.
- **CORS Protection**: Restricted to designated frontend origins in both development and production.
- **Input Sanitization**: Global NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strips out unauthorized payload parameters.

---

## 22. Troubleshooting

### Issue: Port 3000 or 4000 already in use
```bash
# Find and terminate process using port 3000
lsof -ti:3000 | xargs kill -9

# Find and terminate process using port 4000
lsof -ti:4000 | xargs kill -9
```

### Issue: Prisma Client out of sync with Schema
```bash
cd backend
npx prisma generate
```

### Issue: Database connection refused
- Ensure PostgreSQL service is running locally (`brew services start postgresql` on macOS or `sudo systemctl start postgresql` on Linux).
- Verify database credentials in `backend/.env`.

---

## 23. Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Implement your changes, following linting and formatting standards.
3. Test builds locally:
   ```bash
   npm run build
   npm test
   ```
4. Commit using conventional commit format:
   ```bash
   git commit -m "feat: implement feature description"
   ```
5. Push your branch and open a Pull Request against `main`.

---

## 24. Future Improvements

- [ ] Multi-factor authentication (MFA / 2FA) via TOTP authenticator apps.
- [ ] Mobile GPS geofencing verification for field visit check-ins.
- [ ] Push notifications for visit dispatching and schedule adjustments.
- [ ] Automated export of attendance timesheets to CSV/Excel.
- [ ] Client signature capture on visit completion.

---

## 25. License

This project is proprietary and confidential. All rights reserved.
