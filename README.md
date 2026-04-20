---

# FactoryOps Dashboard

A factory operations dashboard for managing machines, shifts, users, and roles. Built with Angular (UI), Next.js API routes (backend), and Prisma ORM.

---

## Prerequisites

* Node.js (v18 or later)
* PostgreSQL database
* npm or yarn

---

## Environment Setup

Create a `.env` file in the root directory and update the values accordingly:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:5432/<database_name>"
JWT_SECRET="your-secret-key"
```

**Notes:**

* Replace `DATABASE_URL` with your actual PostgreSQL connection string.
* Set `JWT_SECRET` to any secure random string.
* Ensure the database exists before running migrations.

---

## Setup & Execution Flow

Follow this sequence strictly.

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Fix Vulnerabilities (Important)

After installation, you will typically see ~20 vulnerabilities.

Run:

```bash
npm audit fix
```

This should reduce them (e.g., ~16 remaining).

**Do NOT run:**

```bash
npm audit fix --force
```

Using `--force` may break dependencies and the project.

---

### 3. Database Setup

Before running the project, verify the schema:

* Check:

```
prisma/schema.prisma
```

This defines:

* Tables
* Relationships
* Data types

Then run migration:

```bash
npx prisma migrate dev --name init
```

If working in a team setup:

* Pull latest changes
* Ensure schema is in sync
* Then migrate

---

### 4. Run the Application

```bash
npm run dev
```

---

## Expected Behavior (Important)

When you run the project:

* First, backend starts → runs on:

```
http://localhost:3001
```

* Then frontend starts → runs on:

```
http://localhost:3000
```

Always open:

```
http://localhost:3000
```

This is the main dashboard UI.

---

## Scripts

* `npm run dev` → Runs Angular frontend + Next.js backend concurrently
* `npm run build` → Builds for production
* `npm start` → Starts production server
* `npx prisma studio` → Opens DB UI

---

## Features

* Dashboard with real-time stats and activity logs
* User management with role-based access
* Machine tracking and monitoring
* Shift scheduling with break handling and 24-hour cycles

---

## Summary of Critical Points

* Run `npm install` first
* Run `npm audit fix` (never use `--force`)
* Update `.env` correctly
* Verify `schema.prisma` before migration
* Run migrations before starting
* Backend starts on **3001**, frontend on **3000**
* Always use **3000** to access the app

---

If you want, I can also add a troubleshooting section (common Angular + Prisma + Next.js errors like the one you hit earlier).
