# Paw Premier House Backend

RESTful API backend for **Paw Premier House** — an e-commerce and pet care service platform. This service powers product shopping, service booking, payments, media management, and AI-assisted chatbot features for the React/Firebase frontend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
   - [System Flow Diagrams](#system-flow-diagrams)
2. [Main Features](#2-main-features)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Installation Guide](#6-installation-guide)
7. [Environment Variables](#7-environment-variables)
8. [Database Setup](#8-database-setup)
9. [Sequelize Migration and Seeder Commands](#9-sequelize-migration-and-seeder-commands)
10. [How to Run the Project Locally](#10-how-to-run-the-project-locally)
11. [API Overview](#11-api-overview)
12. [Deployment Notes for Render / Railway](#12-deployment-notes-for-render--railway)
13. [Notes about Bilingual Fields (`vi` / `en`)](#13-notes-about-bilingual-fields-vi--en)
14. [Common Errors and Troubleshooting](#14-common-errors-and-troubleshooting)
15. [Contributors](#15-contributors)

---

## 1. Project Overview

**Paw Premier House Backend** is a Node.js/Express.js application that provides the server-side logic for a pet-focused digital platform. It supports:

- Online product sales (categories, variants, orders)
- Pet service booking (grooming, boarding, spa, etc.)
- User authentication (JWT + Firebase)
- MoMo payment integration
- AI chatbot with optional Python retrieval service
- Bilingual content (Vietnamese and English)

The frontend is built with **React.js** and hosted on **Firebase**. The MySQL database is typically hosted on **Railway**, while the backend API can be deployed on **Render**.

### System Flow Diagrams

The diagrams below provide a visual overview of how the platform components interact. They render automatically on GitHub using [Mermaid](https://mermaid.js.org/).

#### High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        FE["React Frontend<br/>(Firebase Hosting)"]
    end

    subgraph Backend["Backend Layer — Render"]
        API["Express.js REST API<br/>Port 5059"]
        CRON["Cron Jobs<br/>(order/booking timeout)"]
        STATIC["Static Media<br/>/uploadImage*"]
    end

    subgraph Data["Data Layer — Railway"]
        MYSQL[("MySQL Database<br/>Sequelize ORM")]
    end

    subgraph External["External Services"]
        FIREBASE["Firebase Auth"]
        MOMO["MoMo Payment Gateway"]
        PYTHON["Python AI Service<br/>(chatbot / retrieval)"]
        OPENAI["OpenAI API<br/>(embeddings / LLM)"]
        SUPA["Supabase<br/>(vector storage)"]
        SMTP["Email SMTP"]
    end

    FE -->|"HTTPS + JWT"| API
    FE -->|"Firebase Login"| FIREBASE
    FIREBASE -->|"ID Token"| API
    API --> MYSQL
    CRON --> MYSQL
    API --> STATIC
    API --> MOMO
    MOMO -->|"Return / IPN callback"| API
    API --> PYTHON
    API --> OPENAI
    API --> SUPA
    API --> SMTP
    FE -->|"Redirect after payment"| FE
```

#### Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant BE as Express Backend
    participant FB as Firebase Admin
    participant DB as MySQL

    alt Email / Password Login
        User->>FE: Enter email & password
        FE->>BE: POST /api/login
        BE->>DB: Validate user + bcrypt password
        DB-->>BE: User record
        BE-->>FE: JWT token + user info
    else Firebase Login
        User->>FE: Sign in with Firebase
        FE->>BE: POST /api/auth/firebase-login (Firebase ID token)
        BE->>FB: Verify ID token
        FB-->>BE: Decoded user
        BE->>DB: Find or create user
        BE-->>FE: JWT token + user info
    end

    FE->>FE: Store JWT (localStorage / cookie)
    FE->>BE: Protected requests<br/>Authorization: Bearer JWT
    BE->>BE: authMiddleware verifies JWT
    BE-->>FE: Protected resource response
```

#### Product Order & MoMo Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MySQL
    participant MOMO as MoMo Gateway

    User->>FE: Add items to cart (client-side state)
    User->>FE: Proceed to checkout
    FE->>BE: POST /api/orders/create
    BE->>DB: Create order + order items
    DB-->>BE: Order created (pending)
    BE-->>FE: orderId + verify token

    FE->>BE: POST /api/payment/create
    BE->>MOMO: Create payment request (signed)
    MOMO-->>BE: payUrl
    BE-->>FE: MoMo payment URL

    User->>MOMO: Complete payment on MoMo app/web
    MOMO->>BE: GET /api/payment/momo/return (redirect)
    BE->>DB: Update order payment status
    BE->>FE: Redirect to /confirm-order?orderId=...

    Note over BE,DB: Cron job cancels unpaid orders after timeout

    FE->>BE: POST /api/orders/verify (token + orderId)
    BE->>DB: Confirm order status
    BE-->>FE: Order confirmed
    BE->>User: Send order confirmation email
```

#### Service Booking Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MySQL
    participant MOMO as MoMo Gateway

    User->>FE: Select service, pet, date & time
    FE->>BE: POST /api/booking/verify
    BE->>DB: Validate schedule, service, pet
    BE-->>FE: Validation result + pricing

    FE->>BE: POST /api/booking/create
    BE->>DB: Create booking + booking items
    BE-->>FE: bookingId

    alt Paid service
        FE->>BE: POST /api/booking/:id/payment/create
        BE->>MOMO: Create MoMo payment (resourceType: booking)
        MOMO-->>FE: payUrl
        User->>MOMO: Pay
        MOMO->>BE: Payment callback
        BE->>DB: Update booking payment status
        BE->>FE: Redirect to /confirm-booking
    end

    Note over BE,DB: Cron sends booking reminders<br/>and cancels expired unpaid bookings
```

#### AI Chatbot Flow

```mermaid
flowchart LR
    subgraph UserSide["User"]
        MSG["Chat message"]
    end

    subgraph Backend["Express Backend"]
        CHAT["POST /api/chat/stream"]
        INTENT["Intent detection<br/>& query analysis"]
        REPO["Chat repositories<br/>(product / service / booking)"]
        SAVE["Save ChatSession<br/>& ChatMessage to MySQL"]
    end

    subgraph AI["AI Services"]
        PY["Python AI Service<br/>AI_SERVICE_URL"]
        OAI["OpenAI<br/>(fallback LLM)"]
        VEC["Supabase vectors<br/>(semantic search)"]
    end

    subgraph Response["Response"]
        STREAM["SSE stream to frontend"]
        ACTION["nextAction e.g.<br/>ADD_TO_CART"]
    end

    MSG --> CHAT
    CHAT --> INTENT
    INTENT --> PY
    INTENT --> REPO
    REPO --> VEC
    PY --> OAI
    INTENT --> SAVE
    PY --> STREAM
    STREAM --> ACTION
    ACTION --> MSG
```

#### Deployment Architecture

```mermaid
flowchart LR
    subgraph Users
        BROWSER["Browser / Mobile"]
    end

    subgraph Firebase
        HOST["Firebase Hosting<br/>React SPA"]
    end

    subgraph Render
        NODE["Node.js Web Service<br/>Paw Premier House BE"]
    end

    subgraph Railway
        DB[("MySQL")]
    end

    subgraph Cloud
        AI["Python AI Service"]
        MOMO["MoMo API"]
    end

    BROWSER --> HOST
    HOST -->|"REST API"| NODE
    NODE --> DB
    NODE --> AI
    NODE --> MOMO
    BROWSER -->|"Payment redirect"| MOMO
    MOMO --> NODE
```

#### Bilingual Content Flow

```mermaid
flowchart TD
    ADMIN["Admin / Manager<br/>creates content via API"]
    API["POST / PUT endpoints<br/>products · services · features"]
    DB[("MySQL<br/>name_vi · name_en<br/>description_vi · description_en")]
    FE["React Frontend"]
    LOCALE{"User locale?"}
    VI["Display *_vi fields"]
    EN["Display *_en fields"]

    ADMIN --> API --> DB
    DB --> FE --> LOCALE
    LOCALE -->|vi| VI
    LOCALE -->|en| EN
```

> **Tip:** To preview these diagrams locally, use the [Mermaid Live Editor](https://mermaid.live/) or view the README on GitHub.

---

## 2. Main Features

| Module | Description |
|--------|-------------|
| **Authentication** | Register, login, logout, Firebase login, password management, JWT sessions |
| **Products** | CRUD, soft/hard delete, image upload, product variants, bilingual fields |
| **Product Categories** | Category management with multilingual support |
| **Cart & Orders** | Cart handled on the frontend; backend validates and creates orders, supports MoMo payment |
| **Service Booking** | Create, verify, pay, and manage pet service appointments |
| **Service Categories** | Organize services by category |
| **Service Features** | Feature definitions and service–feature mapping |
| **Media** | Upload and serve images for users, products, services, pets, and general media |
| **Chatbot** | Streaming chat API with intent detection and Python AI service integration |
| **MoMo Payment** | Create payment requests and handle return callbacks |
| **RBAC** | Role-based access control with permissions |
| **Notifications** | In-app notification APIs |
| **Vouchers** | Discount voucher validation and management |
| **Revenue & Reports** | Admin revenue tracking and reporting |
| **Cron Jobs** | Order timeout, booking timeout, and booking reminder jobs |

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| ORM | Sequelize |
| Database | MySQL (Railway) |
| Auth | JWT, bcrypt, Firebase Admin SDK |
| Real-time | Socket.io |
| File Upload | Multer |
| AI / Chat | OpenAI, Supabase (embeddings), Python AI microservice |
| Payment | MoMo Payment Gateway |
| Email | Nodemailer |
| Transpiler | Babel (`@babel/node`) |
| Dev Server | Nodemon |

---

## 4. Project Structure

```
paw-premeier-house-BE/
├── .babelrc                 # Babel configuration
├── .sequelizerc             # Sequelize CLI paths
├── package.json
├── README.md
└── src/
    ├── server.js            # Application entry point
    ├── config/              # DB, Firebase, OpenAI, view engine
    ├── controllers/         # Route handlers
    ├── cron/                # Scheduled jobs (order/booking timeout, reminders)
    ├── helper/              # Shared helpers
    ├── middleware/          # Auth, RBAC, file upload middleware
    ├── migrations/          # Sequelize database migrations
    ├── models/              # Sequelize models (User, Product, Order, Booking, etc.)
    ├── public/              # Static upload folders
    ├── routes/              # Express route definitions
    ├── scripts/             # Utility scripts (embeddings, migrations)
    ├── seeders/             # Database seed data
    ├── services/            # Business logic layer
    │   └── AI/              # Chatbot, intent detection, search, formatters
    ├── templates/           # Email HTML templates
    ├── utils/               # JWT, slug, money, email URL helpers
    └── views/               # EJS views (admin/testing)
```

---

## 5. Prerequisites

Before running the project, make sure you have:

- **Node.js** v16 or later (v18+ recommended)
- **npm** v8 or later
- **MySQL** 8.x (local instance or Railway-hosted database)
- **Git**
- (Optional) **Python AI service** running separately for advanced chatbot/retrieval
- (Optional) **MoMo sandbox credentials** for payment testing
- (Optional) **Firebase service account JSON** for Firebase login
- (Optional) **OpenAI API key** and **Supabase** credentials for AI embeddings

---

## 6. Installation Guide

### Step 1 — Clone the repository

```bash
git clone https://github.com/<your-org>/paw-premeier-house-BE.git
cd paw-premeier-house-BE
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

Create a `.env` file in the project root (see [Environment Variables](#7-environment-variables)).

### Step 4 — Set up the database

Run migrations and seeders (see [Database Setup](#8-database-setup)).

### Step 5 — Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5059` by default (or the port defined in `PORT`).

---

## 7. Environment Variables

Create a `.env` file in the root directory. **Do not commit real secrets to Git.**

```env
# Server
PORT=5059
NODE_ENV=development

# Database (Railway / local MySQL)
# Option A: individual fields (used by Sequelize config)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=paw_premier_house
DB_DIALECT=mysql

# Option B: Railway-style connection string (map to DB_* vars in deployment)
DATABASE_URL=mysql://user:password@host:3306/database_name

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Frontend / CORS
CLIENT_URL=http://localhost:5173
URL_REACT=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5059

# MoMo Payment Gateway
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/payment/return
MOMO_NOTIFY_URL=https://your-backend.onrender.com/api/payment/momo/ipn

# AI / Chatbot
AI_SERVICE_URL=http://127.0.0.1:8001
AI_BASE_URL=http://127.0.0.1:8001
PYTHON_AI_URL=http://127.0.0.1:8001
USE_PYTHON_AI=true
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Vector search (optional, for product/service embeddings)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Admin (JSON string or file path)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Email (optional)
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

> **Note:** The application reads `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME` directly. If Railway provides only `DATABASE_URL`, parse it in your deployment platform or map it to the individual variables above.

---

## 8. Database Setup

### Local MySQL

1. Create a MySQL database:

```sql
CREATE DATABASE paw_premier_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Update your `.env` with the correct credentials.

3. Run migrations and seeders:

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Railway MySQL

1. Create a **MySQL** service on [Railway](https://railway.app/).
2. Copy the connection credentials (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`) into your `.env` as `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`.
3. Run migrations against the Railway database from your local machine or CI pipeline.

### Reset database (development only)

To drop, recreate, migrate, and seed in one step:

```bash
npm run db:fresh
```

> **Warning:** This destroys all existing data. Use only in development.

---

## 9. Sequelize Migration and Seeder Commands

All Sequelize CLI commands should be run from the project root.

### Run all migrations

```bash
npx sequelize-cli db:migrate
```

### Run all seeders

```bash
npx sequelize-cli db:seed:all
```

### Roll back all migrations

```bash
npx sequelize-cli db:migrate:undo:all
```

### Roll back all seeders

```bash
npx sequelize-cli db:seed:undo:all
```

### Other useful commands

```bash
# Create a new migration
npx sequelize-cli migration:generate --name create-example-table

# Create a new seeder
npx sequelize-cli seed:generate --name demo-data

# Undo the most recent migration
npx sequelize-cli db:migrate:undo
```

Migration and seeder files are located in:

- `src/migrations/`
- `src/seeders/`

---

## 10. How to Run the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure .env (see section 7)

# 3. Migrate and seed the database
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

# 4. Start the development server (with hot reload via nodemon)
npm run dev
```

Alternative start command:

```bash
npm start
```

### Optional: AI embedding scripts

After seeding products/services, generate vector embeddings for the chatbot:

```bash
npm run embed          # Embed products
npm run embed:services # Embed services
npm run embed:all      # Embed both
```

### Verify the server

- Default URL: `http://localhost:5059`
- Payment health check: `GET /api/payment/health`

---

## 11. API Overview

All routes are prefixed from the server root. Most protected routes require a JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Authentication & Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login with email/password |
| POST | `/api/auth/firebase-login` | Login via Firebase token |
| POST | `/api/logout` | Logout (authenticated) |
| GET | `/api/me` | Get current user profile |
| POST | `/api/change-password` | Change own password |
| GET | `/api/get-all-users` | List users (admin/manager) |

### Products & Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/get-all` | List products |
| GET | `/api/products/get-by-id` | Get product by ID (includes variants) |
| POST | `/api/products/create` | Create product (admin/manager) |
| PUT | `/api/products/update` | Update product |
| GET | `/api/product-categories/get-all` | List product categories |
| POST | `/api/product-categories/create` | Create category |

Product variants are managed as part of product create/update payloads (`has_variants`, `variants`).

### Orders (Cart → Checkout)

The shopping cart is stored on the **React frontend**. The backend handles checkout:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders/verify` | Validate order before payment |
| POST | `/api/orders/create` | Create order (guest or authenticated) |
| GET | `/api/orders/get-by-user` | Get orders for current user |
| POST | `/api/orders/confirm` | Confirm order (staff/admin) |
| POST | `/api/orders/cancel` | Cancel order |

### Services & Booking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service/get-all` | List services |
| GET | `/api/service/get-by-slug` | Get service by slug |
| GET | `/api/service-categories/get-all` | List service categories |
| POST | `/api/booking/verify` | Validate booking |
| POST | `/api/booking/create` | Create service booking |
| GET | `/api/booking/my-bookings` | Get current user's bookings |

### Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/features/get-all` | List all features |
| GET | `/api/features/for-service` | Features available for a service |
| POST | `/api/service-features/add` | Link feature to service |

### Media (Static Files)

Uploaded files are served from:

| Path | Content |
|------|---------|
| `/uploadImageUsers` | User avatars |
| `/uploadImageProducts` | Product images |
| `/uploadImageServices` | Service images |
| `/uploadImagePets` | Pet photos |
| `/uploadMedia` | General media |

### Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/stream` | Stream chatbot response (guest or authenticated) |
| GET | `/api/chat/:sessionId/messages` | Get chat history for a session |

### Payment (MoMo)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create` | Create MoMo payment request |
| GET | `/api/payment/momo/return` | MoMo redirect callback |
| GET | `/api/payment/health` | Payment service health check |

### Other Modules

- **Pets:** `/api/pet/*`
- **Schedules & Shifts:** `/api/schedule/*`, `/api/shift/*`
- **Vouchers:** `/api/voucher/*`
- **RBAC:** `/api/rbac/*`
- **Notifications:** `/api/notification/*`
- **Revenue:** `/api/revenue/*`
- **Reports:** `/api/report/*`

---

## 12. Deployment Notes for Render / Railway

### Railway (Database)

1. Create a **MySQL** service on Railway.
2. Copy connection variables into your backend `.env` or Render environment settings.
3. Ensure the database allows connections from your backend host IP.
4. Run migrations before or immediately after the first deploy:

```bash
npx sequelize-cli db:migrate
```

### Render (Backend API)

1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a **Web Service** with:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** Node
3. Add all required environment variables from [section 7](#7-environment-variables).
4. Set `NODE_ENV=production`.
5. Set `URL_REACT`, `CLIENT_URL`, and `FRONTEND_URL` to your Firebase/React frontend URL.
6. Update `MOMO_RETURN_URL` and `MOMO_NOTIFY_URL` to your production backend URLs.
7. Set `AI_SERVICE_URL` to your deployed Python AI service URL.

### Deployment checklist

- [ ] MySQL running on Railway with migrations applied
- [ ] All secrets configured in Render (never in source code)
- [ ] CORS origins include the production frontend URL
- [ ] MoMo callback URLs point to production endpoints
- [ ] Firebase service account configured for production auth
- [ ] Python AI service reachable from Render backend

### Frontend (Firebase)

The React frontend is deployed separately on Firebase Hosting. Point its API base URL to your Render backend URL.

---

## 13. Notes about Bilingual Fields (`vi` / `en`)

The platform supports **Vietnamese** and **English** content through dedicated database columns instead of a single localized field.

### Products

| Field | Description |
|-------|-------------|
| `name_vi` / `name_en` | Product name |
| `summary_vi` / `summary_en` | Short summary |
| `description_vi` / `description_en` | Full description (supports Markdown) |

### Services

| Field | Description |
|-------|-------------|
| `name_vi` / `name_en` | Service name |
| `description_vi` / `description_en` | Service description |

### Features

| Field | Description |
|-------|-------------|
| `name_vi` / `name_en` | Feature name |
| `description_vi` / `description_en` | Feature description |

### Usage guidelines

- Always populate **both** language fields when creating or updating content for production.
- The frontend selects the appropriate field based on the user's locale (`vi` or `en`).
- Legacy single-language columns were migrated to multilingual columns via Sequelize migrations (`38`, `39`, `40`).
- A utility script exists at `src/scripts/migrateToMultilingual.js` for one-time data migration if needed.

---

## 14. Common Errors and Troubleshooting

### Database connection failed

**Symptoms:** `SequelizeConnectionError`, `ECONNREFUSED`

**Fix:**
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env`.
- Ensure MySQL is running locally or Railway credentials are correct.
- Check that your IP is allowed to connect to Railway MySQL.

### CORS error from frontend

**Symptoms:** Browser blocks requests with CORS policy error

**Fix:**
- Set `URL_REACT` in `.env` to match your frontend URL exactly (e.g. `http://localhost:5173`).
- Include your production Firebase URL in allowed origins if deploying.

### JWT / Unauthorized (401)

**Symptoms:** `401 Unauthorized` on protected routes

**Fix:**
- Ensure the client sends `Authorization: Bearer <token>`.
- Verify `JWT_SECRET` matches between environments.
- Check token expiration.

### Sequelize migration errors

**Symptoms:** Migration fails mid-run

**Fix:**
```bash
# Check migration status, then undo last migration if needed
npx sequelize-cli db:migrate:undo
npx sequelize-cli db:migrate
```

- Avoid running `db:migrate:undo:all` on production unless you intend to wipe schema history.

### MoMo payment fails

**Symptoms:** Payment creation returns error or invalid signature

**Fix:**
- Confirm `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, and `MOMO_SECRET_KEY` are correct sandbox/production credentials.
- Ensure `MOMO_RETURN_URL` and `MOMO_NOTIFY_URL` are publicly accessible HTTPS URLs in production.
- Use MoMo sandbox endpoint for testing.

### Chatbot / AI service not responding

**Symptoms:** Chat stream hangs or returns fallback message

**Fix:**
- Ensure the Python AI service is running at `AI_SERVICE_URL` / `AI_BASE_URL`.
- Set `USE_PYTHON_AI=true` if using the external Python service.
- Verify `OPENAI_API_KEY` is valid for LLM features.
- Run `npm run embed:all` after seeding to populate vector embeddings.

### Port already in use

**Symptoms:** `EADDRINUSE` on startup

**Fix:**
- Change `PORT` in `.env`, or stop the process using the current port.

---

## 15. Contributors

| Name | Role | Contact |
|------|------|---------|
| *[Team Member 1]* | Backend Developer | *[email / GitHub]* |
| *[Team Member 2]* | Full-stack Developer | *[email / GitHub]* |
| *[Team Member 3]* | AI Integration | *[email / GitHub]* |

> **Capstone Project** — Eastern International University (EIU)  
> Replace placeholder names with your actual team members before submission.

---

## License

This project was developed as part of an academic capstone project. Contact the project maintainers for usage permissions.
