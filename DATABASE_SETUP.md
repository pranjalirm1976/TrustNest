# TrustNest Database Setup Guide

This document provides instructions for setting up the TrustNest PG Management ERP database using Prisma.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Environment variables configured

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/trustnest_db"
NEXTAUTH_SECRET="your-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Database Migrations

```bash
npm run db:migrate
```

### 5. Seed the Database

```bash
npm run db:seed
```

## 📊 Database Schema

### Models Overview

- **User**: Tenants, Owners, and Inspectors
- **Property**: PG properties owned by users
- **Floor**: Floors within a property
- **Room**: Rooms on each floor
- **Bed**: Individual beds in rooms

### Relationships

```
User (1) ──→ (N) Property
Property (1) ──→ (N) Floor
Floor (1) ──→ (N) Room
Room (1) ──→ (N) Bed
```

## 🏢 Sample Data

The seed script creates "Emerald Elite PG" with:

- **Ground Floor**: Reception + 5 rooms (G01-G05)
- **First Floor**: 6 rooms (101-106) with varying capacities
- **Second Floor**: 5 rooms (201-205) with different amenities

### Sample Users

| Role | Email | Password |
|------|--------|----------|
| Inspector | admin@trustnest.com | admin123 |
| Owner | rajesh@emeraldelite.com | owner123 |
| Tenant | priya.sharma@gmail.com | tenant123 |

## 🛠️ Available Scripts

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (Database GUI)
npm run db:studio

# Push schema changes without migration
npm run db:push

# Reset database (⚠️ Destructive)
npm run db:reset
```

## 🔧 Database Management

### Viewing Data

Use Prisma Studio for a visual interface:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` to browse and edit data.

### Making Schema Changes

1. Edit `prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Generate client: `npm run db:generate`

### Adding New Seed Data

Edit `prisma/seed.ts` and run:

```bash
npm run db:seed
```

## 🏗️ Architecture Notes

### Prisma Client Singleton

The app uses a singleton pattern for Prisma Client (`src/lib/prisma.ts`) to prevent connection exhaustion during Next.js hot reloads in development.

### Type Safety

TypeScript types are automatically generated from the Prisma schema and extended in `src/lib/types.ts` for application-specific needs.

### Cascade Deletes

The schema includes `onDelete: Cascade` for proper hierarchical data cleanup:
- Deleting a Property removes all Floors, Rooms, and Beds
- Deleting a Floor removes all Rooms and Beds
- Deleting a Room removes all Beds

## 🎨 Brand Integration

The database is designed to support the TrustNest brand with:
- **Primary Color**: Emerald Green (#059669)
- **Accent Color**: Warm Amber (#F59E0B)
- **Typography**: Inter font family
- **Glass morphism effects** for modern UI

## 🔐 Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 12
- User roles control access levels (TENANT, OWNER, INSPECTOR)
- Environment variables protect sensitive configuration

## 📝 Next Steps

1. Set up authentication with NextAuth.js
2. Create API routes for CRUD operations
3. Build the frontend dashboard components
4. Implement role-based access control
5. Add real-time updates for bed availability