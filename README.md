# FactoryOps Dashboard

A comprehensive factory operations dashboard for managing machines, shifts, users, and roles. Built with Angular, Next.js (Express), and Prisma.

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- npm OR yarn

## Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/factoryops"
JWT_SECRET="your-super-secret-key"
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Migration

Run the Prisma migration to set up your database schema:

```bash
npx prisma migrate dev --name init
```

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Runs the Angular frontend and Next.js backend concurrently.
- `npm run build`: Builds the application for production.
- `npm start`: Starts the production server.
- `npx prisma studio`: Opens the database manager UI.

## Features

- **Dashboard:** Real-time stats and recent activity logging.
- **User Management:** Role-based access control, security profiles, and process assignment.
- **Machine Tracking:** Monitor equipment status and specifications.
- **Shift Scheduling:** Detailed shift patterns with integrated break management and 24-hour cycle enforcement.
