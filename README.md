# Aviro Auth Server

A production-ready authentication server built with Express, TypeScript, Prisma, and PostgreSQL. Provides JWT-based authentication with cookie support, email verification, and a structured modular architecture.

---

## Table of Contents

- [Tech Stack & Packages](#tech-stack--packages)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Email Setup](#email-setup)
- [Authentication Flow](#authentication-flow)
- [API Routes](#api-routes)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Development & Build](#development--build)

---

## Tech Stack & Packages

### Core Framework
- **express** — Web framework for handling HTTP requests and routing
- **cors** — Cross-Origin Resource Sharing configuration
- **cookie-parser** — Cookie parsing middleware for reading JWT tokens from cookies
- **http-status** — Standardized HTTP status code constants

### Database & ORM
- **prisma** — Database ORM and schema management
- **@prisma/client** — Auto-generated database client
- **@prisma/adapter-pg** — Prisma adapter for PostgreSQL
- **pg** — PostgreSQL Node.js driver

### Authentication & Security
- **bcryptjs** — Password hashing and comparison
- **jsonwebtoken** — JWT token generation, verification, and decoding
- **zod** — Runtime schema validation for request bodies and query parameters

### Email
- **nodemailer** — SMTP email sending
- **ejs** — Templating engine for HTML email templates
- **@types/nodemailer**, **@types/ejs** — TypeScript type definitions

### Development Tools
- **typescript** — TypeScript compiler
- **tsx** — TypeScript execution and watch mode for development
- **dotenv** — Environment variable loading

---

## Project Structure

```
aviro-auth-server/
├── prisma/
│   ├── migrations/                  # Database migration files
│   │   ├── 20260606120306_make_verification_user_optional/
│   │   └── 20260606132501_remove_email_unique_constraint/
│   └── schema/                      # Prisma schema definitions
│       ├── schema.prisma            # Generator and datasource config
│       ├── auth.prisma              # User, Session, Verification models
│       └── enums.prisma             # UserStatus enum definition
│
├── src/
│   ├── app.ts                       # Express app initialization and middleware setup
│   ├── server.ts                    # Server bootstrap, port binding, graceful shutdown
│   │
│   ├── app/
│   │   ├── config/
│   │   │   └── env.ts               # Environment variable loader and validator
│   │   │
│   │   ├── errorHelpers/
│   │   │   ├── AppError.ts          # Custom application error class
│   │   │   ├── handlePrismaErrors.ts # Prisma-specific error mapping
│   │   │   └── handleZodError.ts    # Zod validation error formatter
│   │   │
│   │   ├── interfaces/
│   │   │   ├── error.interface.ts   # Error-related TypeScript interfaces
│   │   │   ├── index.d.ts           # Express Request type augmentation (req.user)
│   │   │   └── requestUser.interface.ts # User payload interface for requests
│   │   │
│   │   ├── lib/
│   │   │   └── prisma.ts            # PrismaClient singleton with PostgreSQL adapter
│   │   │
│   │   ├── middleware/
│   │   │   ├── checkAuth.ts         # JWT authentication middleware
│   │   │   ├── globalErrorHandler.ts # Centralized error handling middleware
│   │   │   ├── notFound.ts          # 404 handler for undefined routes
│   │   │   └── validateRequest.ts   # Zod schema validation middleware
│   │   │
│   │   ├── module/
│   │   │   └── auth/
│   │   │       ├── auth.controller.ts   # Auth route handlers (controllers)
│   │   │       ├── auth.interface.ts    # Auth-related TypeScript interfaces
│   │   │       ├── auth.route.ts        # Auth route definitions
│   │   │       ├── auth.service.ts      # Auth business logic layer
│   │   │       └── auth.validation.ts   # Zod schemas for auth requests
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts             # Route aggregator (mounts all module routes)
│   │   │
│   │   ├── shared/
│   │   │   ├── catchAsync.ts        # Wrapper for async route handlers
│   │   │   └── sendResponse.ts      # Standardized JSON response helper
│   │   │
│   │   ├── templates/
│   │   │   └── verification-email.ejs # HTML email template for verification
│   │   │
│   │   └── utils/
│   │       ├── bcrypt.ts            # Password hash and compare utilities
│   │       ├── cookie.ts            # Cookie configuration helpers
│   │       ├── email.ts             # Nodemailer setup and email sending
│   │       ├── jwt.ts               # JWT create, verify, and decode functions
│   │       └── token.ts             # Access/refresh token generation and cookie setting
│   │
│   └── generated/prisma/            # Auto-generated Prisma client files
│
├── .env                             # Environment variables (not committed)
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts                 # Prisma configuration (schema path, migrations path)
└── tsconfig.json                    # TypeScript compiler configuration
```

### Key Directories Explained

- **prisma/schema/** — Split schema files: `schema.prisma` handles the generator and datasource, `auth.prisma` contains the data models, and `enums.prisma` holds enum definitions.
- **src/app/module/** — Feature-based module organization. Each module contains its own controller, service, routes, validation, and interfaces.
- **src/app/middleware/** — Reusable Express middleware for auth, validation, and error handling.
- **src/app/utils/** — Shared utility functions for cross-cutting concerns (JWT, email, cookies, bcrypt).
- **src/app/shared/** — Common helpers used across multiple modules.
- **src/generated/prisma/** — Auto-generated by Prisma. Do not edit manually.

---

## Environment Variables

All configuration is loaded from a `.env` file and validated at startup in `src/app/config/env.ts`.

### Server Configuration
- `NODE_ENV` — Environment mode (development, production)
- `PORT` — Server port number

### Database
- `DATABASE_URL` — PostgreSQL connection string

### JWT Secrets
- `ACCESS_TOKEN_SECRET` — Secret key for signing access tokens
- `REFRESH_TOKEN_SECRET` — Secret key for signing refresh tokens
- `ACCESS_TOKEN_EXPIRES_IN` — Access token expiry duration (e.g., "15m")
- `REFRESH_TOKEN_EXPIRES_IN` — Refresh token expiry duration (e.g., "7d")

### Frontend
- `FRONTEND_URL` — Frontend application URL for CORS and email links

### Admin Credentials
- `ADMIN_EMAIL` — Default admin email
- `ADMIN_PASSWORD` — Default admin password

### SMTP / Email
- `EMAIL_SENDER_SMTP_HOST` — SMTP server hostname
- `EMAIL_SENDER_SMTP_PORT` — SMTP server port
- `EMAIL_SENDER_SMTP_USER` — SMTP authentication username
- `EMAIL_SENDER_SMTP_PASS` — SMTP authentication password

---

## Database Setup

### Database
PostgreSQL is used as the primary database, connected via the `pg` driver and Prisma's PostgreSQL adapter.

### Schema Files
The Prisma schema is split across multiple files for maintainability:

- **prisma/schema/schema.prisma** — Defines the Prisma generator (outputting to `src/generated/prisma`) and the PostgreSQL datasource.
- **prisma/schema/enums.prisma** — Contains the `UserStatus` enum with values: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED`.
- **prisma/schema/auth.prisma** — Contains three data models:

#### User Model
Stores user account information. Fields include UUID primary key, username (unique), first and last name, email (non-unique), email verification status, account status, password change requirement flag, optional profile picture and phone, password hash, soft delete flag with timestamp, and automatic creation/update timestamps.

#### Session Model
Stores refresh session data. Fields include UUID primary key, expiry timestamp, unique refresh token string, optional IP address and user agent, and a foreign key reference to the User model with cascade deletion.

#### Verification Model
Stores email verification tokens. Fields include UUID primary key, optional foreign key to User (cascade delete), optional email address, hashed verification token, expiry timestamp, and automatic creation/update timestamps.

### Migrations
Two migrations exist:
1. Initial schema creation with optional user relation on Verification
2. Removal of the unique constraint on the User email field (only username remains unique)

### Prisma Client
The Prisma client is instantiated as a singleton in `src/app/lib/prisma.ts` with the PostgreSQL adapter and exported for use across the application.

---

## Email Setup

### Configuration
Email sending is configured in `src/app/utils/email.ts` using Nodemailer with an SMTP transport. The transport is configured using the SMTP environment variables (host, port, user, password) with TLS enabled and `rejectUnauthorized` set to false.

### Templates
Email templates use EJS and are stored in `src/app/templates/`. Currently there is one template:
- **verification-email.ejs** — HTML email for account verification containing a branded verification button and a plain text fallback URL.

### How Emails Are Sent
The email utility exports a function that accepts recipient, subject, HTML content, and optional plain text. It renders EJS templates if needed and sends via the configured SMTP transport.

---

## Authentication Flow

### Overview
The authentication system uses JWT tokens stored in HTTP-only cookies. It supports access token refresh, email verification before signup, password change for authenticated users, and logout.

### Signup Flow
1. User requests a verification email by calling the send verification endpoint with their email.
2. The server generates a cryptographically secure random token, hashes it with SHA-256, and stores the hash in the Verification table with a one-hour expiry.
3. The server sends an email containing a verification link with the raw (unhashed) token.
4. User clicks the link or submits the token to the verify email endpoint, which hashes the submitted token and compares it against the stored hash.
5. User calls the signup endpoint with their details including the verification token.
6. The server validates the verification token again, creates the User record, and deletes the verification record.

### Login Flow
1. User submits username and password to the login endpoint.
2. Server validates credentials using bcrypt password comparison.
3. Server generates an access token (short-lived, default 15 minutes) and a refresh token (long-lived, default 7 days).
4. Both tokens are set as HTTP-only, secure, SameSite-none cookies in the response.
5. User is authenticated for subsequent requests.

### Protected Route Access
1. Client makes a request to a protected endpoint.
2. The authentication middleware reads the access token from the cookie or the Authorization Bearer header.
3. The token is verified using the access token secret.
4. If valid, the decoded user payload (userId, username, email, status, etc.) is attached to the request object as `req.user`.
5. The route handler executes with access to the authenticated user's data.

### Token Refresh Flow
1. When the access token expires, the client calls the refresh token endpoint.
2. The middleware reads the refresh token from the cookie.
3. The refresh token is verified using the refresh token secret.
4. If valid, new access and refresh tokens are generated and the cookies are updated.

### Logout Flow
1. User calls the logout endpoint.
2. The server clears both the access token and refresh token cookies by setting them to empty values with immediate expiry.
3. The logout is stateless; no session record is deleted from the database.

### Password Change Flow
1. Authenticated user calls the change password endpoint with current and new passwords.
2. The authentication middleware ensures the user is logged in.
3. The server verifies the current password with bcrypt.
4. If valid, the new password is hashed and the user's password is updated.

### Token Payload
JWT tokens contain: userId, username, firstName, lastName, email, status, needPasswordChange flag, and emailVerified flag.

---

## API Routes

All routes are prefixed with `/api/v1`.

### Auth Routes (`/api/v1/auth`)

| Method | Endpoint | Authentication | Validation | Description |
|--------|----------|----------------|------------|-------------|
| POST | `/signup` | No | Yes | Register a new user with verification token |
| POST | `/send-verification-email` | No | Yes | Send verification email with token |
| POST | `/verify-email` | No | No | Verify email using token |
| POST | `/login` | No | Yes | Authenticate and receive tokens |
| GET | `/me` | Yes | No | Get current authenticated user profile |
| POST | `/refresh-token` | Yes | No | Refresh access and refresh tokens |
| POST | `/logout` | No | No | Clear authentication cookies |
| POST | `/change-password` | Yes | Yes | Change password for logged-in user |

### Route Aggregation
All module routes are aggregated in `src/app/routes/index.ts` and mounted under the `/api/v1` prefix in the main Express app.

---

## Middleware

### checkAuth
JWT authentication middleware. Extracts the access token from cookies or the Authorization header, verifies it, and attaches the decoded user to `req.user`. Returns 401 if the token is missing or invalid.

### validateRequest
Zod schema validation middleware. Validates request body (or other parts) against a provided Zod schema. Returns a 400 response with formatted validation errors if the input is invalid.

### globalErrorHandler
Centralized error handling middleware. Catches all errors and returns appropriate responses:
- Prisma errors are mapped to meaningful HTTP status codes and messages
- Zod validation errors return structured field-level error details
- Custom AppError instances use their defined status code and message
- Generic errors return a standard message, with stack traces included only in development

### notFound
Handles requests to undefined routes by returning a 404 response.

### catchAsync
Wrapper utility for async route handlers that automatically forwards errors to the global error handler, eliminating the need for try-catch blocks in controllers.

---

## Error Handling

### AppError
Custom error class extending the native Error. Accepts a message and HTTP status code. Used throughout the application to throw predictable, catchable errors.

### Prisma Error Handling
Prisma errors (unique constraint violations, foreign key failures, record not found, etc.) are intercepted and mapped to appropriate HTTP status codes and user-friendly messages in `handlePrismaErrors.ts`.

### Zod Error Handling
Zod validation failures are formatted into a structured response with field-level error messages in `handleZodError.ts`.

### Response Format
Successful responses use a standardized format via `sendResponse.ts`, including success flag, status code, message, and data payload.

---

## Development & Build

### Available Scripts
- `npm run dev` — Start the server in development mode with tsx watch (auto-restart on file changes)
- `npm run build` — Generate Prisma client and compile TypeScript to the `dist` directory
- `npm start` — Run the compiled application from the `dist` directory
- `npm run migrate` — Run Prisma migrations
- `npm run studio` — Open Prisma Studio for database inspection
- `npm run generate` — Regenerate Prisma client
- `npm run db:push` — Push schema changes directly to the database (development)

### TypeScript Configuration
- Target: ES2023
- Module resolution: bundler
- Root directory: `./`
- Output directory: `./dist`
- Strict type checking enabled

### CORS Configuration
CORS is configured to allow requests from the `FRONTEND_URL` environment variable and `http://localhost:3000`, with credentials support enabled for cookie-based authentication.
