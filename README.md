# 🚀 Matrix Web App

A futuristic web application built with Next.js 15, featuring a Matrix-inspired cyber theme with secure authentication.

## ✨ Features

- **🎨 Matrix/Cyber Theme**: Dark UI with neon colors (green, cyan, purple)
- **🔐 Secure Authentication**: NextAuth.js with Google OAuth integration
- **⚡ High Performance**: Next.js 15 with Turbopack and App Router
- **🗄️ Database**: Prisma ORM with PostgreSQL
- **📱 Responsive**: Mobile-first design with Tailwind CSS
- **🔧 TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Prisma + PostgreSQL
- **UI Theme**: Custom Matrix/Cyberpunk design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use Neon/Supabase)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/alexobedeanu/matrix-web-app.git
cd matrix-web-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Fill in your database URL, NextAuth secret, and Google OAuth credentials.

4. **Set up the database**
```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🎨 Theme

The application features a custom Matrix/cyberpunk theme with:

- **Dark backgrounds** with subtle gradients
- **Neon colors**: Green (#22c55e), Cyan (#06b6d4), Purple (#a855f7)
- **Monospace fonts** for that terminal feel
- **Animated elements** with CSS transitions
- **Grid patterns** and blur effects

## 📱 Pages

- **Homepage** (`/`): Welcome screen with cyber aesthetics
- **Login** (`/login`): User authentication terminal
- **Register** (`/register`): User registration matrix
- **Protected routes**: Automatic authentication handling

## 🔐 Authentication

- **Google OAuth**: One-click authentication
- **Email/Password**: Traditional credentials
- **Session management**: Secure server-side sessions
- **Protected routes**: Automatic redirects

## 🗄️ Database Schema

- **Users**: Authentication and profile data
- **Accounts**: OAuth provider linking
- **Sessions**: Secure session management
- **Verification**: Email verification tokens

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).