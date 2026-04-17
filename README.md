Here is a clean, structured **README.md** version of your instructions:

---

# Hybrid Angular + Next.js Application Setup

This guide explains how to run the application locally.

## 1. Prerequisites

Ensure the following are installed on your system:

* **Node.js** (v18 or higher)
* **npm** (comes with Node.js)
* **Database** (used via Prisma):

  * PostgreSQL / MySQL **or**
  * SQLite (local file)

---

## 2. Setup Instructions

### Step 1: Install Dependencies

Navigate to the project root directory and run:

```bash
npm install
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory.

You can copy from `.env.example` and update values:

```env
# Example .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
```

---

### Step 3: Initialize Database

Generate Prisma client and sync schema:

```bash
npx prisma generate
npx prisma db push
```

---

## 3. Running the Application

### Option A: Production Mode (Recommended)

Build and start the unified server:

```bash
npm run build
npm start
```

Access the app at:

```
http://localhost:3000
```

---

### Option B: Development Mode

For active development:

```bash
npm run dev
```

This runs:

* Angular build in watch mode
* Next.js development server

---

## 4. Troubleshooting

### Port Already in Use

* Ensure port `3000` is free
* Stop other running applications if needed

### Windows Execution Policy Issues

* Run Command Prompt or PowerShell as **Administrator**

### SQLite Database

* If using:

  ```
  DATABASE_URL="file:./dev.db"
  ```
* Prisma will automatically create the database file during:

```bash
npx prisma db push
```

---
