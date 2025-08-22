# 🚀 Docker Deployment Platforms

Aplicația este containerizată cu Docker și poate fi deployată pe multiple platforme. Iată ghidurile pentru fiecare platformă:

## 🔥 Railway.app (Recomandat - Free $5 credit)

### Deploy Steps:
1. **Mergi la [Railway.app](https://railway.app)**
2. **Sign up** cu GitHub
3. **"Deploy from GitHub repo"**
4. **Selectează repository:** `alexobedeanu/matrix-web-app`
5. **Configurează Environment Variables:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_VJo7QR6ByOgX@ep-restless-river-a2ljs8qe-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   NEXTAUTH_URL=https://your-railway-app.up.railway.app
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```
6. **Deploy!** - Railway va detecta automat Dockerfile-ul

### Features:
- ✅ Detectare automată Docker
- ✅ $5 credit gratuit
- ✅ Scaling automat
- ✅ Health checks
- ✅ Logs în timp real

---

## 🎨 Render.com (Free Tier cu limitări)

### Deploy Steps:
1. **Mergi la [Render.com](https://render.com)**
2. **Connect GitHub repository**
3. **New Web Service**
4. **Configurează:**
   - **Runtime:** Docker
   - **Plan:** Free
   - **Build Command:** (leave empty)
   - **Start Command:** `sh -c 'npx prisma migrate deploy && node server.js'`
   - **Health Check:** `/api/health`

### Features:
- ✅ Free tier
- ❌ Sleep after inactivitate (50s wake time)
- ✅ Automatic SSL
- ✅ GitHub integration

---

## 🪂 Fly.io (Cel mai bun pentru production)

### Deploy Steps:
1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login și create app:**
   ```bash
   flyctl auth login
   flyctl launch --no-deploy
   ```

3. **Set secrets:**
   ```bash
   flyctl secrets set DATABASE_URL="..." --app your-app-name
   flyctl secrets set NEXTAUTH_SECRET="..." --app your-app-name
   flyctl secrets set NEXTAUTH_URL="https://your-app.fly.dev" --app your-app-name
   flyctl secrets set GOOGLE_CLIENT_ID="..." --app your-app-name
   flyctl secrets set GOOGLE_CLIENT_SECRET="..." --app your-app-name
   ```

4. **Deploy:**
   ```bash
   flyctl deploy
   ```

### Features:
- ✅ Global edge deployment
- ✅ Static IPs
- ✅ Excelent pentru production
- ❌ Necesită card de credit

---

## 🔧 DigitalOcean App Platform

### Deploy Steps:
1. **Mergi la [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)**
2. **Create App from GitHub**
3. **Configurează:**
   - **Source Type:** Docker Hub sau GitHub
   - **Plan:** Basic ($5/month sau free tier limitat)
   - **Environment Variables:** (same as above)

### Features:
- ✅ Scalare automată
- ✅ Managed database options
- ✅ CDN integration
- ❌ Nu are free tier generos

---

## 🎯 Zeet (Kubernetes-based)

### Deploy Steps:
1. **Mergi la [Zeet.co](https://zeet.co)**
2. **Connect GitHub**
3. **Select repository**
4. **Configure:**
   - **Build:** Dockerfile
   - **Environment:** Production
   - **Resources:** Free tier (256MB RAM)

### Features:
- ✅ Kubernetes-based
- ✅ Free tier
- ✅ Auto-scaling
- ✅ Great pentru microservices

---

## 📋 Environment Variables Required

Pentru toate platformele, ai nevoie de aceste environment variables:

```env
# Database (Required)
DATABASE_URL=postgresql://neondb_owner:npg_VJo7QR6ByOgX@ep-restless-river-a2ljs8qe-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth (Required)
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=https://your-app-url.com

# Google OAuth (Required)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
```

---

## 🎯 Recomandări

### Pentru Development/Testing:
- **Railway** - Cel mai simplu, credit gratuit
- **Render** - Free tier cu limitări

### Pentru Production:
- **Fly.io** - Global performance, edge deployment
- **DigitalOcean** - Predictable pricing, managed services

### Pentru Experimentation:
- **Zeet** - Kubernetes experience
- **Railway** - Rapid prototyping

---

## 🔗 Repository Setup

Repository-ul include configurații pentru toate platformele:

- `Dockerfile` - Multi-stage Docker build
- `docker-compose.yml` - Local development
- `fly.toml` - Fly.io configuration
- `render.yaml` - Render configuration  
- `railway.toml` - Railway configuration
- `zeet.yml` - Zeet configuration

---

## 🛠️ Troubleshooting

### Database Connection Issues:
- Verifică DATABASE_URL format
- Asigură-te că Neon database allows connections

### Build Issues:
- Verifică Dockerfile syntax
- Check available memory pe free tiers

### Environment Variables:
- NEXTAUTH_URL trebuie să fie exact URL-ul aplicației
- Secrets nu trebuie să conțină quotes suplimentare

### Health Checks:
- `/api/health` endpoint trebuie să returneze 200 OK
- Verifică că aplicația pornește pe PORT env variable