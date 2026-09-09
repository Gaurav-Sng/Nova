# NOVA — Backend API

Production-ready, modular REST API for the **NOVA Team Productivity Platform** built with **Node.js**, **Express**, and **SQL** (SQLite).

---

## Architecture Overview

```
backend/
├── .env.example              # Template environment variables
├── .env                      # Local environment configuration
├── database.sqlite           # SQLite relational database
├── package.json              # Dependencies and scripts
├── src/
│   ├── config/
│   │   ├── db.js             # Promisified SQLite client with WAL & foreign keys
│   │   └── env.js            # Environment validation & configuration
│   ├── db/
│   │   └── schema.sql        # Relational SQL DDL (tables, FKs, indexes)
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication & user context injection
│   │   ├── validate.js       # express-validator result handler
│   │   ├── rateLimiter.js    # DoS and brute-force protection
│   │   └── errorHandler.js   # Centralized error and 404 handler
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, profile
│   │   ├── project.controller.js  # Project CRUD & owner authorization
│   │   └── task.controller.js     # Task creation, status updates & IDOR defense
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth routes
│   │   ├── project.routes.js      # /api/projects routes
│   │   ├── task.routes.js         # /api/tasks routes
│   │   └── index.js               # Route aggregator & health check
│   ├── app.js                # Express app configuration & middleware pipeline
│   └── server.js             # Server listener & graceful shutdown
└── tests/
    └── api.test.js           # Automated integration test suite
```

---

## Security & Best Practices Implemented

1. **SQL Injection Prevention**: 100% of queries use prepared statements and parameterized placeholders (`?`).
2. **Password Hashing**: Cryptographic password hashing using `bcryptjs` with 10 salt rounds.
3. **Stateless JWT Authentication**: Signed JSON Web Tokens with configurable expiration and Bearer token parsing.
4. **Access Control & IDOR Protection**: Strict ownership checks on every project and task operation. Users can only access and modify their own data.
5. **Relational Integrity**: Foreign key constraints with `ON DELETE CASCADE` ensures deleting a project cleanly removes all associated tasks.
6. **HTTP Security Headers**: `helmet` enabled to enforce standard web security headers.
7. **Cross-Origin Resource Sharing (CORS)**: Configured specifically for the React frontend (`http://localhost:5173`).
8. **Rate Limiting**:
   - `authLimiter`: 20 requests per 15 minutes to block brute-force credential stuffing.
   - `apiLimiter`: 300 requests per 15 minutes to mitigate DoS attacks.
9. **Input Validation & Sanitization**: `express-validator` validates email structure, password length, task status enums, and string bounds.
10. **Centralized Error Handling**: Safe JSON error responses (`{ error: "..." }`) preventing sensitive server or database stack trace leakage.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` (already done for development):
```bash
cp .env.example .env
```

### 3. Run Automated Tests
```bash
npm test
```

### 4. Start the Server
- **Development (with hot reload)**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

Server will run on `http://localhost:3000/api`.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Log in and receive JWT token (`email`, `password`)
- `GET /api/auth/me` — Fetch current user profile (requires Bearer token)

### Projects
- `GET /api/projects` — List all projects for authenticated user
- `POST /api/projects` — Create a project (`name`, `description`)
- `GET /api/projects/:id` — Get project details with nested tasks
- `PUT /api/projects/:id` — Update project (`name`, `description`)
- `DELETE /api/projects/:id` — Delete project and cascade delete tasks

### Tasks
- `POST /api/projects/:id/tasks` — Create task (`title`, `description`)
- `PUT /api/tasks/:id` — Update task (`status`: `TODO` | `IN_PROGRESS` | `DONE`, `title`, `description`)
- `GET /api/tasks/:id` — Get task details
- `DELETE /api/tasks/:id` — Delete task
