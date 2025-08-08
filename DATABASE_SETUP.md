# Database Setup Guide

## Overview
This guide will help you set up the PostgreSQL database for the PhysioCheck application.

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Environment Variables
Create a `.env` file in the root directory with the following content:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/physioapp?schema=public"

# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Replace the DATABASE_URL with your actual PostgreSQL connection string.**

## Step 3: Database Setup Options

### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE physioapp;
   ```
3. Update the DATABASE_URL in your `.env` file

### Option B: Cloud Database (Recommended for Production)
- **Supabase** (Free tier available): https://supabase.com
- **Neon** (Free tier available): https://neon.tech
- **Railway** (Free tier available): https://railway.app

## Step 4: Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

## Step 5: Seed Database (Optional)
```bash
# Run the setup script to add sample data
node scripts/setup-db.js
```

## Step 6: Verify Setup
```bash
# Start the development server
npm run dev

# Open Prisma Studio to view your database
npm run db:studio
```

## Database Schema

### Tables Created:
1. **assessments** - Stores assessment data and results
2. **analytics** - Tracks user behavior and events
3. **configurations** - Application configuration settings
4. **assessment_templates** - Assessment templates and presets
5. **risk_rules** - Risk assessment rules and scoring

### Key Features:
- **JSON fields** for flexible data storage
- **Relationships** between assessments and analytics
- **Timestamps** for tracking creation and updates
- **Soft deletes** with isActive flags

## API Endpoints

### Assessment Management:
- `POST /api/assessment/create` - Create new assessment
- `PUT /api/assessment/:id` - Update assessment
- `POST /api/assessment/:id/submit` - Submit completed assessment
- `GET /api/assessment/:id` - Get assessment by ID
- `GET /api/assessment` - Get all assessments (admin)

### Analytics:
- `POST /api/assessment/:id/analytics` - Track analytics event
- `GET /api/assessment/analytics/summary` - Get analytics summary

## Troubleshooting

### Common Issues:

1. **Connection Error**:
   - Verify DATABASE_URL is correct
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **Schema Push Failed**:
   - Drop and recreate database
   - Check for conflicting tables

3. **Prisma Client Error**:
   - Run `npm run db:generate`
   - Restart the development server

### Useful Commands:
```bash
# Reset database
npm run db:push --force-reset

# View database in browser
npm run db:studio

# Generate new migration
npx prisma migrate dev --name migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## Production Deployment

### Environment Variables for Production:
```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public&sslmode=require"
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Security Considerations:
- Use strong passwords
- Enable SSL for database connections
- Set up proper CORS origins
- Implement rate limiting
- Use environment variables for sensitive data

## Next Steps
After setting up the database, you can:
1. Start the React frontend migration
2. Add authentication
3. Implement real-time analytics
4. Set up monitoring and logging 