# 🚀 Deployment Guide

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup development database (SQLite):**
   ```bash
   npm run setup:dev
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Production Deployment on Vercel

### 1. Database Setup

Create a PostgreSQL database on one of these platforms:
- **Supabase** (recommended): https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com

### 2. Environment Variables

Set these variables in Vercel dashboard:

#### Required Variables:
```bash
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NEXTAUTH_SECRET="your-super-secret-key-here-change-in-production"
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

#### Optional (for Google OAuth):
```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Deploy to Vercel

#### Option A: Via GitHub (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Database Migration

After first deployment, the database will be automatically set up via the `vercel-build` script.

## 🏗️ Build Process

The `vercel-build` script automatically:
1. ✅ Generates Prisma client
2. ✅ Pushes database schema to PostgreSQL
3. ✅ Runs all unit tests (38 tests)
4. ✅ Builds Next.js application with Turbopack

## 🧪 Testing

Run tests locally:
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
npm run test:ci          # CI mode (used in build)
```

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify `DATABASE_URL` is correctly formatted
2. Ensure database allows connections from Vercel IPs
3. Check if SSL is required (`?sslmode=require`)

### Build Failures
1. Check that all environment variables are set
2. Verify PostgreSQL connection is working
3. Run tests locally first: `npm run test:ci`

### Migration Issues
```bash
# Reset and recreate migrations (if needed)
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 📊 Performance Features

- ✅ **Next.js 15** with Turbopack for fast builds
- ✅ **PostgreSQL** for production scalability  
- ✅ **Prisma ORM** with optimized queries
- ✅ **Automated testing** before deployment
- ✅ **SSR and API routes** optimized for Vercel

## 🎮 Features Included

- 🧩 **Puzzle System** with categories and difficulty levels
- 👥 **User Management** with authentication
- 🏆 **Gamification** (XP, coins, achievements, missions)
- 📱 **Responsive Design** with hamburger menu
- ⌨️ **Keyboard Navigation** (Alt+←/→, Backspace)
- 🔙 **Smart Back/Forward** navigation with history
- ✅ **38 Unit Tests** for all functionality

---

Ready for production! 🎉