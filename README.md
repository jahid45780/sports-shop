# ApexKit Sports — Enterprise E-Commerce Platform

A production-ready, full-stack Sports & Athletic Gear E-Commerce platform built with modern TypeScript, React 19, Express, MongoDB, and Tailwind CSS. Features end-to-end shopping cart and checkout flows, real-time match scores & club schedule integration, interactive AI shopping assistant, and an administrative control panel with live analytics, product management, and order fulfillment.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Project Architecture](#4-project-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation Instructions](#7-installation-instructions)
8. [Environment Variables](#8-environment-variables)
9. [MongoDB Setup](#9-mongodb-setup)
10. [Database Connection](#10-database-connection)
11. [Development Commands](#11-development-commands)
12. [Production Build](#12-production-build)
13. [Production Start](#13-production-start)
14. [API Documentation](#14-api-documentation)
15. [Authentication and Authorization](#15-authentication-and-authorization)
16. [Admin Account Setup](#16-admin-account-setup)
17. [Image Upload Configuration](#17-image-upload-configuration)
18. [AI Chatbot Configuration](#18-ai-chatbot-configuration)
19. [Testing](#19-testing)
20. [Deployment](#20-deployment)
21. [Troubleshooting](#21-troubleshooting)
22. [Security Notes](#22-security-notes)

---

## 1. Project Overview

ApexKit Sports is a unified full-stack web application designed for sports merchandise, authentic jerseys, athletic apparel, and professional equipment. The platform combines a consumer storefront with high-performance real-time features (match fixtures, live scores, kit customization) and a back-office administration suite.

The system is architected as an Express backend that natively embeds Vite development middleware during local development and serves optimized, pre-compiled static assets in production, ensuring uniform API proxying and zero CORS issues on port 3000.

---

## 2. Features

### Storefront Experience
- **Interactive Product Catalog**: Dynamic search, multi-facet filtering (sport category, league, brand, price tier, stock availability), and sorting.
- **Product Detail Views**: Multi-angle image carousels, size selection, personalized jersey customization (player name & number prints), real-time stock indicators, and customer reviews.
- **Cart & Slide-over Drawer**: Persistent state management with instant quantity adjustment, voucher codes, free shipping thresholds, and cart totals calculation.
- **Order Placement & Checkout**: Seamless multi-step checkout form collecting delivery details, payment method selection (Cash on Delivery, Cards, Mobile Banking), and instantaneous order confirmation with tracking IDs.
- **Match Center & Fixture Tracker**: Live match countdowns, tournament standings (Premier League, La Liga, Champions League), and club schedule integration.
- **AI Sports Assistant**: Powered by the Google Gemini API to recommend equipment, size guidance, match gear recommendations, and answers to customer inquiries.

### Administrative Control Suite
- **Executive Dashboard**: Revenue metrics, average order value, conversion trends, and daily order volumes.
- **Interactive Sales Overview**: Recharts-powered interactive analytics visualizing daily revenue trends, sales velocity, and product popularity breakdown.
- **Product Lifecycle Management**: Add, update, archive, and delete products, manage stock counts, categories, and image URLs.
- **Order Fulfillment Engine**: Review customer orders, update delivery statuses (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`), and filter by customer contact or status.
- **Google Drive Backup Integration**: Export and sync catalog assets and sales reports directly with Google Drive.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) |
| **Build Tooling & Bundler** | Vite 6, `@vitejs/plugin-react` |
| **Styling & Design System** | Tailwind CSS v4, Lucide React icons |
| **Data Visualization** | Recharts v2 (Area charts, Bar charts, Responsive containers) |
| **Backend Runtime** | Node.js (v18+ or v20+ LTS recommended), TypeScript (`tsx`) |
| **Server Framework** | Express v4 with JSON body-parser and CORS |
| **Database & ODM** | MongoDB Native Driver v7 (`mongodb`) with connection pooling & automated indexers |
| **Authentication & Security**| Bcrypt (`bcryptjs`), JSON Web Tokens (`jsonwebtoken`), Helmet-grade security headers |
| **Artificial Intelligence** | `@google/genai` (Gemini Flash integration) |
| **Language & Tooling** | TypeScript 5.7, ESLint |

---

## 4. Project Architecture

The application runs as a **single unified full-stack Node.js process**:

```
                       ┌────────────────────────┐
                       │  Client (Web Browser)  │
                       └───────────┬────────────┘
                                   │ HTTP :3000
                                   ▼
                       ┌────────────────────────┐
                       │   Express Server Core  │
                       │     (server.ts)        │
                       └─────┬────────────┬─────┘
                             │            │
            ┌────────────────┴──┐      ┌──┴────────────────┐
            ▼                   ▼      ▼                   ▼
    ┌───────────────┐  ┌─────────────┐ ┌───────────────┐ ┌──────────────────┐
    │  CORS & Rate  │  │ API Router  │ │ Vite Dev Mid  │ │ Static File Host │
    │    Limiter    │  │ (/api/*)    │ │ (In Dev Mode) │ │ (In Prod: dist/) │
    └───────────────┘  └──────┬──────┘ └───────────────┘ └──────────────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │ Auth Module │ │ Data Store  │ │ Gemini API  │
        │  (Bcrypt +  │ │ (MongoDB /  │ │  (AI Shop   │
        │    JWT)     │ │ Store.json) │ │  Assistant) │
        └─────────────┘ └──────┬──────┘ └─────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ MongoDB Deployment  │
                    │   (Atlas / Local)   │
                    └─────────────────────┘
```

1. **Development Mode**: `npm run dev` starts `tsx server.ts`. Express mounts Vite's dev middleware, supplying ultra-fast Hot Module Replacement (HMR) and instantaneous TypeScript compilation directly through the same port (3000).
2. **Production Mode**: `npm run build` compiles frontend assets into `/dist`. Running `npm run start` launches Express in production mode, serving optimized static files and handling API requests with zero dev overhead.
3. **Database Layer**: `DatabaseManager` in `src/server/db.ts` attempts to connect to MongoDB using connection pooling. If MongoDB is unreachable or omitted in local prototyping, it smoothly falls back to `/data/store.json` without failing server startup.

---

## 5. Folder Structure

```
sports-ecommerce/
├── .env.example              # Canonical environment template (no secrets)
├── .gitignore                # Git exclusions (env files, dist, node_modules)
├── README.md                 # Complete system documentation (this file)
├── SECURITY.md               # Security model, threat analysis, reporting policy
├── package.json              # Dependencies, scripts, and build tasks
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite build and plugin configuration
├── server.ts                 # Full-stack Express server, API routes, middleware
├── index.html                # Single-page application HTML entrypoint
├── scripts/
│   └── bootstrapAdmin.ts     # CLI tool to hash passwords and generate JWT secrets
├── data/
│   └── store.json            # Persistent JSON dataset (local fallback storage)
├── src/
│   ├── main.tsx              # React client bootstrapping
│   ├── App.tsx               # Storefront application router and UI coordinator
│   ├── types.ts              # TypeScript interfaces (Product, Order, CartItem, User)
│   ├── server/
│   │   ├── db.ts             # MongoDB DatabaseManager (pooling, indexes, health check)
│   │   └── auth.ts           # Bcrypt hashing, JWT issuance, rate limiting, sanitization
│   └── components/
│       ├── Navbar.tsx        # Responsive navigation, cart counter, search trigger
│       ├── Hero.tsx          # Storefront hero banner & CTA
│       ├── ProductCard.tsx   # Product display card with price, tags, and quick-add
│       ├── ProductModal.tsx  # Interactive product view with jersey customization
│       ├── CartDrawer.tsx    # Slide-over shopping bag with coupon validation
│       ├── CheckoutModal.tsx # Multi-step checkout & payment confirmation
│       ├── MatchCenter.tsx   # Live soccer fixtures & club schedules
│       ├── AboutPage.tsx     # Company story, brand ethos, and quality guarantees
│       ├── AiAssistant.tsx   # Floating AI shopping chatbot
│       └── admin/
│           ├── AdminDashboard.tsx # Metrics, tabs, inventory, and order fulfillment
│           ├── SalesOverview.tsx  # Recharts daily sales & product popularity charts
│           └── AdminLogin.tsx     # Rate-limited admin authentication portal
```

---

## 6. Prerequisites

Ensure your environment meets these minimum requirements:
- **Node.js**: v18.18.0 or later (v20.x LTS strongly recommended).
- **Package Manager**: `npm` (v9 or v10) or `pnpm` / `yarn`.
- **Database (Optional for dev, recommended for production)**:
  - Local MongoDB instance running on `localhost:27017`, OR
  - MongoDB Atlas Cloud Database cluster (M0 Free Tier or higher).
- **Modern Browser**: Chrome, Firefox, Safari, or Edge with ES2022+ support.

---

## 7. Installation Instructions

Follow these step-by-step instructions to set up the repository from scratch:

```bash
# 1. Clone the repository
git clone <repository-url>
cd sports-ecommerce

# 2. Install all dependencies (production + development)
npm install

# 3. Create your local environment file from the template
cp .env.example .env

# 4. Generate a cryptographically secure JWT secret (see Section 8 & 16)
npm run seed:admin

# 5. Start the development server
npm run dev
```

The application is immediately available at `http://localhost:3000`.

---

## 8. Environment Variables

Create a `.env` file in the project root. All backend environment variables are private; only variables prefixed with `VITE_` are exposed to client-side bundles.

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | HTTP port on which Express listens. |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` or `production`). |
| `MONGODB_URI` | Recommended | `mongodb://localhost:27017` | MongoDB connection string. Falls back to JSON store if omitted. |
| `MONGODB_DB_NAME` | Optional | `apexkit_sports` | Target database name within MongoDB. |
| `JWT_ACCESS_SECRET`| **Required (Prod)** | *(Generated 64-char hex)* | Cryptographic HMAC-SHA256 signing secret for admin tokens. |
| `JWT_EXPIRES_IN` | Optional | `24h` | Token lifespan (`1h`, `12h`, `24h`, `7d`). |
| `ADMIN_EMAIL` | Optional | `admin@apexkit.com` | Primary admin username for dashboard login. |
| `ADMIN_PASSWORD` | Optional | `AdminSecurePass2026!` | Initial administrator password for bootstrap script. |
| `GEMINI_API_KEY` | Optional | `AIzaSy...` | Google Gemini API key for the AI shopping assistant. |
| `FRONTEND_URL` | Optional | `http://localhost:3000` | Allowed CORS origin for production deployments. |

> **Important**: Never check `.env` into version control. Ensure `.env` is listed in `.gitignore`.

---

## 9. MongoDB Setup

ApexKit natively supports both **Local MongoDB** and **MongoDB Atlas Cloud**.

### Option A: Local MongoDB (Docker or Local Daemon)

If running MongoDB via Docker:
```bash
docker run -d -p 27017:27017 --name apexkit-mongo mongo:7.0
```
Then configure in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=apexkit_sports
```

### Option B: MongoDB Atlas (Cloud Cluster)

Follow these security best practices when deploying to MongoDB Atlas:

1. **Create an Atlas Cluster**:
   - Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a free Shared Cluster (M0) in your preferred AWS/GCP region.
2. **Create a Dedicated Database User**:
   - Go to **Database Access** -> **Add New Database User**.
   - Select **Password Authentication**.
   - Create a username (e.g., `apexkit_app`).
   - Generate a strong 32-character random password.
   - Set Built-in Role to: **Read and write to any database** (or restrict to `apexkit_sports`).
3. **Configure Network Access**:
   - Go to **Network Access** -> **IP Access List**.
   - For cloud platforms with dynamic IPs (e.g., Google Cloud Run, Vercel, Render), add your server's outbound NAT IP, or allow temporary access with strict credential rotations.
4. **Obtain Connection String**:
   - Go to **Database** -> **Connect** -> **Drivers** (Node.js).
   - Copy the SRV URI:
     ```
     mongodb+srv://apexkit_app:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=ApexKitCluster
     ```
5. **Update `.env`**:
   ```env
   MONGODB_URI=mongodb+srv://apexkit_app:YOUR_ACTUAL_PASSWORD@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=apexkit_sports
   ```

---

## 10. Database Connection

The database connection is managed by the `DatabaseManager` singleton in `src/server/db.ts`:

- **Connection Pooling**: Configured with `maxPoolSize: 10`, `minPoolSize: 2`, and `serverSelectionTimeoutMS: 5000`.
- **Automatic Indexing**: On initial connection, the manager automatically ensures high-performance indexes:
  - `products`: Index on `slug` (unique), `category`, `team`, and `salePrice`.
  - `orders`: Index on `orderNumber` (unique), `customer.phone`, and `orderStatus`.
  - `users`: Index on `email` (unique).
- **Credential Masking**: The database manager's `sanitizeUri()` method strips passwords from all console messages, ensuring secrets never leak in logs.
- **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to cleanly drain the connection pool before process termination.

### Health Check Endpoint
Query the live system health at any time:
```bash
curl http://localhost:3000/api/health
```
**Response**:
```json
{
  "status": "ok",
  "uptime": 128.45,
  "timestamp": "2026-10-25T09:30:00.000Z",
  "database": {
    "type": "mongodb",
    "connected": true,
    "uri": "mongodb://localhost:27017"
  }
}
```

---

## 11. Development Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Express server with Vite middleware on `http://localhost:3000` with hot reload. |
| `npm run seed:admin` | Runs the admin bootstrap CLI script to create credentials and secure JWT secrets. |
| `npm run lint` | Runs the TypeScript compiler check (`tsc --noEmit`) to validate type integrity. |
| `npm run build` | Compiles the React 19 frontend into optimized production bundles in `/dist`. |
| `npm run preview` | Runs the Vite preview server against the compiled `/dist` directory. |
| `npm run start` | Launches the production Express server (`node server.ts` or `tsx server.ts`). |

---

## 12. Production Build

To build the client-side single page application:

```bash
npm run build
```

The build output is placed in `/dist/`:
- Minified, tree-shaken JavaScript bundles with chunk hashing.
- Optimized, purge-cleaned Tailwind CSS stylesheets.
- Static assets (SVGs, icons, web fonts).

---

## 13. Production Start

Once built, start the production application:

```bash
# Ensure NODE_ENV is set to production
export NODE_ENV=production

# Start the full-stack server
npm run start
```

The Express server will:
1. Verify database connectivity and build indexes.
2. Serve the compiled `/dist` frontend assets with efficient static file caching.
3. Serve all `/api/*` endpoints with security headers and rate limiting.

---

## 14. API Documentation

All API routes are prefixed with `/api`.

### Public Storefront Routes

#### `GET /api/health`
Returns system uptime and database health.
- **Access**: Public
- **Response**: `200 OK`

#### `GET /api/products`
Retrieves products with optional filtering.
- **Access**: Public
- **Query Params**:
  - `category` (string, e.g. `jerseys`, `boots`, `balls`, `training`)
  - `featured` (boolean, `true` or `false`)
  - `search` (string, case-insensitive keyword)
- **Response**: `200 OK` — Array of product objects.

#### `GET /api/products/:id`
Retrieves a single product by ID or slug.
- **Access**: Public
- **Response**: `200 OK` or `404 Not Found`.

#### `POST /api/orders`
Submits a customer order.
- **Access**: Public
- **Payload**:
  ```json
  {
    "customer": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 (555) 234-5678",
      "address": "123 Athletic Way",
      "city": "Boston",
      "zip": "02108"
    },
    "items": [
      {
        "id": "prod-1",
        "name": "Real Madrid Home Kit 24/25",
        "price": 95,
        "quantity": 1,
        "size": "L",
        "customization": { "name": "BELLINGHAM", "number": "5" }
      }
    ],
    "subtotal": 95,
    "shipping": 0,
    "discount": 0,
    "total": 95,
    "paymentMethod": "card"
  }
  ```
- **Response**: `201 Created` with generated `orderNumber`.

#### `GET /api/matches`
Retrieves upcoming and live sporting fixtures.
- **Access**: Public
- **Response**: `200 OK`.

#### `POST /api/chat`
Interacts with the AI sports shopping assistant.
- **Access**: Public
- **Payload**: `{"message": "What boots should I buy for artificial grass?"}`
- **Response**: `200 OK` with `{"reply": "..."}`.

---

### Protected Admin Routes

All protected routes require an `Authorization: Bearer <jwt-token>` header.

#### `POST /api/auth/admin-login`
Authenticates administrative users with rate limiting.
- **Access**: Public (Subject to 5 failed attempts lockout)
- **Payload**: `{"email": "admin@apexkit.com", "password": "..."}`
- **Response**: `200 OK` with:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin-1",
      "name": "System Administrator",
      "email": "admin@apexkit.com",
      "role": "admin"
    }
  }
  ```

#### `GET /api/admin/stats`
Aggregated sales, revenue, orders, and inventory metrics.
- **Access**: Admin only
- **Response**: `200 OK`.

#### `GET /api/orders`
Retrieves customer orders with delivery details.
- **Access**: Admin only
- **Response**: `200 OK`.

#### `PATCH /api/orders/:id/status`
Updates order fulfillment state.
- **Access**: Admin only
- **Payload**: `{"status": "shipped"}` (Allowed: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`)
- **Response**: `200 OK`.

#### `POST /api/products`
Creates a new catalog item.
- **Access**: Admin only
- **Payload**: Product object
- **Response**: `201 Created`.

#### `PUT /api/products/:id`
Updates an existing catalog item.
- **Access**: Admin only
- **Response**: `200 OK`.

#### `DELETE /api/products/:id`
Removes a catalog item.
- **Access**: Admin only
- **Response**: `200 OK`.

---

## 15. Authentication and Authorization

- **Hashing Algorithm**: `bcryptjs` with 12 salt rounds.
- **Session Tokens**: Cryptographically signed HMAC-SHA256 JWT tokens.
- **Role-Based Access Control (RBAC)**: All administrative endpoints pass through the `requireAdmin` middleware, which verifies the token signature, checks role validity, and attaches the sanitized user object to the Express request (`req.user`).
- **Data Protection Guarantee**: Database entities pass through `sanitizeUser()`, guaranteeing that `password`, `hash`, and `salt` fields are never serialized into responses.

---

## 16. Admin Account Setup

The repository includes a dedicated CLI bootstrap tool to create administrator credentials and generate high-entropy JWT secrets without hardcoding values in code:

```bash
# Run the bootstrap tool
npm run seed:admin
```

The script will:
1. Generate a secure 32-byte (64-character hexadecimal) random string for `JWT_ACCESS_SECRET`.
2. Hash the administrator password using Bcrypt with 12 rounds.
3. Display ready-to-copy entries for your `.env` file:
   ```env
   JWT_ACCESS_SECRET=e7b4a20f9...
   ADMIN_PASSWORD_HASH=$2a$12$N9qo8uLOickgx...
   ```

You can then log into the admin portal (`/admin`) using:
- **Email**: `admin@apexkit.com` (or your configured `ADMIN_EMAIL`)
- **Password**: Your configured `ADMIN_PASSWORD`

---

## 17. Image Upload Configuration

Product images currently accept high-resolution CDN and HTTPS image URLs (Unsplash, Cloudinary, Imgur, or S3-compatible buckets).

To connect an external cloud media service:
1. Store assets in your cloud bucket (e.g. Cloudinary, AWS S3, or Firebase Storage).
2. Use the HTTPS URL when creating or updating products via the Admin Dashboard or `POST /api/products`.
3. Image URLs are validated and rendered via standard responsive `<img>` elements with fallback placeholders.

---

## 18. AI Chatbot Configuration (Apex Kit AI Assistant)

The website features the **Apex Kit AI Assistant**, a full-stack sports shopping assistant with Google Gemini integration and real warehouse inventory grounding.

### Free Tier AI Setup (Google Gemini)
Google provides a free tier for Gemini models (such as `gemini-2.5-flash`), subject to its eligibility and regional availability.

1. **Get an API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com).
   - Sign in with your Google Account and click **"Get API key"**.
   - Create an API key in a Google Cloud project (free tier available with rate limits like 15 requests per minute).

2. **Add Key to Backend Environment**:
   - Add the key to your `.env` file on the server (do NOT commit this file):
     ```env
     GEMINI_API_KEY=your_gemini_api_key_here
     GEMINI_MODEL=gemini-2.5-flash
     ```
   - **Important**: The API key is stored securely on the backend server only. It is never exposed in browser bundles, frontend code, or public responses.

3. **Behavior & Graceful Error Handling**:
   - **When Connected**: The assistant provides dynamic, athletic advice in English and বাংলা, strictly grounded in your real inventory.
   - **When Free Rate Limit is Hit (429 / Quota)**: The assistant informs the user politely without crashing and displays real matching products alongside direct contact options.
   - **When No Key is Configured**: The assistant operates transparently in **Catalog Mode**, helping customers search products, view sizes, check prices, and track orders without pretending an AI model answered.
   - **Direct Contact Support**: Customers can reach customer support at any time:
     - **Phone**: `01763-943446` (`tel:01763943446`)
     - **WhatsApp**: [https://wa.me/8801763943446](https://wa.me/8801763943446)

---

## 19. Testing

Validate codebase integrity and build readiness:

```bash
# 1. Type validation and syntax check
npm run lint

# 2. Production bundling test
npm run build

# 3. Test API health check
curl http://localhost:3000/api/health

# 4. Verify admin authentication
curl -X POST http://localhost:3000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@apexkit.com","password":"AdminSecurePass2026!"}'
```

---

## 20. Deployment

### Deploying to Cloud Run / Docker Container

Create a standard `Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/data ./data
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t apexkit-sports .
docker run -p 3000:3000 --env-file .env apexkit-sports
```

### Deploying to Platform as a Service (Render / Railway / Heroku)
1. Set Build Command: `npm install && npm run build`
2. Set Start Command: `npm run start`
3. Configure environment variables in the host dashboard (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `ADMIN_PASSWORD`, etc.).

---

## 21. Troubleshooting

### Port 3000 Already in Use
If port 3000 is occupied:
```bash
# On Linux/macOS, find and terminate the process:
lsof -i :3000
kill -9 <PID>
# Or specify an alternate port in your .env:
PORT=3001 npm run dev
```

### MongoDB Connection Timeout
- Verify `MONGODB_URI` syntax.
- If using MongoDB Atlas, check that the connecting server's IP address is included in the **IP Access List**.
- Check database user credentials. Note that special characters in passwords must be URL-encoded (e.g. `@` -> `%40`).

### "Too Many Requests" on Admin Login
- The rate limiter prevents brute-force attempts after 5 consecutive failures.
- Wait 15 minutes for the window to reset, or restart the dev server to clear the in-memory rate-limiter table.

---

## 22. Security Notes

Refer to [SECURITY.md](./SECURITY.md) for full security documentation. Key protections include:
- **Zero Plaintext Secrets**: Passwords hashed with Bcrypt (12 rounds).
- **HMAC-SHA256 JWTs**: Strict token verification with expiry enforcement.
- **PII Segregation**: Customer addresses and phone numbers are restricted to authenticated administrators.
- **Brute-Force Lockout**: 5 failed login attempts trigger a 15-minute freeze.
- **Defense in Depth**: Sanitized URI logging, HTTP security headers, CORS origin enforcement, and NoSQL parameter coercion.
