# 🔥 Lakri Chulay Ranna Server (E-Commerce Backend)

[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-v4-3E67B1?logo=zod)](https://zod.dev/)
[![Puppeteer](https://img.shields.io/badge/Puppeteer-PDF--Generation-40B5A4?logo=puppeteer)](https://pptr.dev/)

The backend engine of **Lakri Chulay Ranna (লাকড়ি চুলায় রান্না)** — a traditional Bengali food ordering and restaurant management platform. This server powers user authentication, menu catalog management, real-time discount coupons, dynamic hero slider banners, PDF invoice generation, contact messaging, site configurations, and order lifecycle processing.

---

## 🔗 Repositories

- **Backend Repository**: [lakrichulayranna-backend](https://github.com/sayed725/lakrichulayranna-backend)
- **Frontend Repository**: [lakrichulayranna-frontend](https://github.com/sayed725/lakrichulayranna-frontend)

---

## 📖 Table of Contents

1. [Technical Core](#-technical-core)
2. [Database Architecture](#%EF%B8%8F-database-architecture)
3. [Modular System Design](#%EF%B8%8F-modular-system-design)
4. [Security & Authentication](#-security--authentication)
5. [Invoice & PDF Engine](#-invoice--pdf-engine)
6. [Key API Modules](#-key-api-modules)
7. [Setup & Deployment](#%EF%B8%8F-setup--deployment)

---

## 🚀 Technical Core

- **Runtime**: Node.js 20+ with native ES Modules (`"type": "module"`).
- **Engine**: Express 5 for high-performance routing and native async error propagation.
- **ORM**: Prisma 7 with `@prisma/adapter-pg` driver adapter for PostgreSQL.
- **Authentication**: Custom JWT authentication with bcrypt password hashing and HTTP-only cookie support.
- **Validation**: Zod schema validation for runtime request body parsing.
- **PDF Generation**: Puppeteer headless browser integration for dynamic order invoice generation.
- **Security**: Helmet security headers, CORS origin management, and Express Rate Limiter for request throttling.
- **Logging**: Morgan HTTP logger middleware for monitoring request traffic.
- **Build & Watch**: `tsup` for production bundlings and `tsx` for high-speed dev watch mode.

---

## 🗄️ Database Architecture

The system uses a relational PostgreSQL database schema with Prisma ORM.

### Entities & Relationships

- **User**: System users categorized into `CUSTOMER` and `ADMIN` roles, with `ACTIVE`, `INACTIVE`, and `BANNED` status management.
- **Category**: Food categories supporting featured flags, custom slugs, and category-level banner associations.
- **Item**: Food menu items with dual pricing (original & discount), tags, spicy flags, pack weights, best-seller status, and image gallery arrays.
- **Coupon**: Promotional code engine with fixed and percentage discount types, minimum order rules, maximum discount caps, usage counts, and expiry dates.
- **Order**: Order lifecycle management (`PENDING → CONFIRMED → PREPARING → READY → DELIVERED` or `CANCELLED`), delivery fee calculation (Dhaka inside/outside logic), address payload, and invoice URL storage.
- **OrderItem**: Junction table linking food items to orders with snapshot unit pricing and quantity.
- **Review**: Customer feedback entity with rating scores, comments, admin approval toggles (`isApproved`), and featured flags.
- **Banner**: Hero slider banners linked to categories with order positioning and visibility controls.
- **Setting**: Single-row application configuration store (site branding, contact phone/email, address, opening/closing hours, social links).
- **Contact**: Customer contact inquiry inbox with unread/read state tracking.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER }o--o| COUPON : "applies discount"
    ORDER_ITEM }o--|| ITEM : references
    ITEM }o--|| CATEGORY : "belongs to"
    ITEM ||--o{ REVIEW : "receives feedback"
    BANNER }o--o| CATEGORY : "links to"
```

### Enumerations

| Enum | Values |
|------|--------|
| `Role` | `ADMIN`, `CUSTOMER` |
| `UserStatus` | `ACTIVE`, `INACTIVE`, `BANNED` |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED` |
| `PaymentMethod` | `COD`, `ONLINE` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED` |
| `DiscountType` | `PERCENTAGE`, `FIXED` |

---

## 🛠️ Modular System Design

The project uses a clean **Domain-Driven Modular Architecture**:

```text
src/
├── app.ts              # Express initialization (CORS, Helmet, Rate Limiter, Route Registry)
├── server.ts           # Server entry point & port listening
├── config/             # Environment setup and config variables
├── generated/          # Prisma client build output
├── middlewares/        # Auth guard, error handlers, async handler, logger
├── modules/            # Core Business Modules
│   ├── auth/           # Login, registration, token refresh, password management
│   ├── banner/         # Promotional hero banners
│   ├── category/       # Menu categories
│   ├── contact/        # Customer messages & inquiries
│   ├── coupon/         # Discount code system
│   ├── item/           # Food menu items & product management
│   ├── order/          # Order placement, status tracking & invoice link
│   ├── review/         # Customer reviews & ratings
│   ├── setting/        # Restaurant information & site metadata
│   └── user/           # User accounts & admin status control
├── routes/             # Central API router aggregator
├── types/              # Global TypeScript declarations
└── utils/              # PDF generator, helper utilities
```

---

## 🔐 Security & Authentication

- **JWT Authentication**: Secure JSON Web Token auth using HTTP-only cookies and Bearer headers.
- **Role-Based Protection**: Route guards (`auth("ADMIN")`, `auth("CUSTOMER")`) enforcing strict authorization check before controller execution.
- **Soft Delete**: Core models (`User`, `Item`, `Order`, `Coupon`, `Banner`, `Review`, `Contact`) enforce soft deletes (`isDeleted`, `deletedAt`) for data integrity.
- **Rate Limiting**: Integrated `express-rate-limit` prevents brute-force login attempts and API abuse.
- **CORS Protection**: Restricted cross-origin access configuration mapped to frontend environment endpoints.

---

## 📄 Invoice & PDF Engine

- **Puppeteer Integration**: Automatically compiles HTML templates with order data and renders downloadable PDF invoices upon order confirmation.
- **Vercel Serverless Ready**: Configured for lightweight compilation and build execution on serverless platforms.

---

## 📡 Key API Modules

> Base API route: `/api/v1`

### 🔑 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register a new customer account |
| `POST` | `/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/auth/logout` | Authenticated | Clear authentication token |
| `GET` | `/auth/me` | Authenticated | Get currently logged-in user profile |

### 🍲 Food Items (Menu)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/items` | Public | List food items (supports search, filter, pagination) |
| `GET` | `/items/:id` | Public | Get single food item details |
| `POST` | `/items` | Admin | Create a new food item |
| `PATCH` | `/items/:id` | Admin | Update item attributes, prices, or images |
| `DELETE` | `/items/:id` | Admin | Soft-delete a menu item |

### 📦 Order Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders` | Public / Customer | Place a new food order (guest or registered user) |
| `GET` | `/orders` | Admin | Get all platform orders |
| `GET` | `/orders/my-orders` | Authenticated | Get user's order history |
| `GET` | `/orders/:id` | Authenticated | Get detailed order summary |
| `PATCH` | `/orders/:id/status` | Admin | Update order status (`PENDING` → `DELIVERED`) |
| `DELETE` | `/orders/:id` | Admin | Soft-delete order |

### 🎟️ Coupons

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/coupons/apply` | Public / Customer | Validate coupon code & calculate discount |
| `GET` | `/coupons` | Admin | List all created coupons |
| `POST` | `/coupons` | Admin | Create discount coupon |
| `PATCH` | `/coupons/:id` | Admin | Update coupon details |
| `DELETE` | `/coupons/:id` | Admin | Delete coupon |

### 📁 Categories

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/categories` | Public | Retrieve active menu categories |
| `POST` | `/categories` | Admin | Create food category |
| `PATCH` | `/categories/:id` | Admin | Update category details |
| `DELETE` | `/categories/:id` | Admin | Delete category |

### ⭐ Reviews & Ratings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/reviews` | Public | List approved customer reviews |
| `POST` | `/reviews` | Authenticated | Submit review for ordered items |
| `PATCH` | `/reviews/:id/approve` | Admin | Approve or feature a review |
| `DELETE` | `/reviews/:id` | Admin | Delete review |

### 🖼️ Banners

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/banners` | Public | Retrieve active hero banners |
| `POST` | `/banners` | Admin | Create hero banner |
| `PATCH` | `/banners/:id` | Admin | Update banner |
| `DELETE` | `/banners/:id` | Admin | Remove banner |

### ⚙️ Restaurant Settings & Contact

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/settings` | Public | Fetch site configuration & contact details |
| `PATCH` | `/settings` | Admin | Update restaurant settings |
| `POST` | `/contacts` | Public | Send customer contact query |
| `GET` | `/contacts` | Admin | View inbox messages |

---

## 🛠️ Setup & Deployment

### Prerequisites

- **Node.js** v20+
- **npm** or **pnpm**
- PostgreSQL database (e.g., [Neon](https://neon.tech) or local PostgreSQL)

### Environment Configuration

Create a `.env` file in the root folder:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Client URL
CLIENT_URL="http://localhost:3000"

# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/lakrichulayranna_db?schema=public"

# JWT Authentication
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Admin Credentials Seed
ADMIN_EMAIL="admin@lakrichulayranna.com"
ADMIN_PASSWORD="supersecretpassword"
```

### Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Run seed script
npm run db:seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Deployment (Vercel)

The backend is configured for serverless deployment on Vercel:

- Configured with `api/index.mjs` build entrypoint via `tsup`.
- Automatic Prisma Client generation on build with `postinstall`.
- `vercel.json` rewrite routing to `api/index.mjs`.

---

**Crafted with tradition, passion, and high performance. 🍲**
