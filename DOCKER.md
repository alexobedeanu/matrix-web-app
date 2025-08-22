# 🐳 Docker Deployment Guide

Acest ghid explică cum să rulezi aplicația Cyberpunk cu Docker pentru development și production.

## 📋 Cerințe

- Docker 20.10+
- Docker Compose 2.0+
- Make (opțional, pentru comenzi simplificate)

## 🚀 Quick Start

### Development

```bash
# Clonează repository-ul
git clone <repository-url>
cd web-app

# Configurează variabilele de mediu
cp .env.example .env
# Editează .env cu valorile tale

# Start development environment
make dev-up
# sau
docker-compose -f docker-compose.dev.yml up -d

# Aplicația va fi disponibilă la http://localhost:3000
```

### Production

```bash
# Configurează variabilele de mediu pentru production
cp .env.example .env.production
# Editează .env.production cu valorile de production

# Start production environment
make prod-up
# sau
docker-compose up -d

# Aplicația va fi disponibilă la http://localhost:3000
```

## 🛠️ Configurare Variabile de Mediu

### Variabile Obligatorii

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="https://your-domain.com"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Variabile Opționale

```env
# Server Configuration
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"

# Database pentru development (dacă folosești container local)
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_DB="cyberpunk_app"
```

## 📝 Comenzi Disponibile

### Comenzi Make (Simplificate)

```bash
# Development
make dev-build     # Build containers pentru development
make dev-up        # Start development environment
make dev-down      # Stop development environment
make dev-logs      # View logs pentru development

# Production
make prod-build    # Build containers pentru production
make prod-up       # Start production environment
make prod-down     # Stop production environment
make prod-logs     # View logs pentru production

# Database
make migrate       # Run database migrations
make seed          # Seed database cu date sample
make db-reset      # Reset database (DESTRUCTIV!)

# Utility
make health        # Check application health
make clean         # Clean Docker resources
make test          # Run tests în Docker
```

### Comenzi Docker Compose Directe

```bash
# Development
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose build
docker-compose up -d
docker-compose down
docker-compose logs -f
```

## 🏗️ Arhitectura Containerelor

### Services

1. **web-app** - Aplicația Next.js principală
2. **postgres** - Baza de date PostgreSQL
3. **redis** - Cache pentru sesiuni și date temporare

### Volumes

- `postgres_data` - Date persistente PostgreSQL
- `redis_data` - Date persistente Redis
- `app_logs` - Logs aplicație

### Networks

- `app-network` - Network intern pentru comunicarea între servicii

## 🔧 Configurare Avansată

### Custom Dockerfile

Dockerfile-ul este optimizat cu multi-stage build:

1. **base** - Setup dependencies
2. **dev** - Development environment
3. **builder** - Build aplicația
4. **production** - Runtime environment

### Health Checks

Toate serviciile au health checks configurate:

- **postgres** - `pg_isready` check
- **redis** - `redis-cli ping` check  
- **web-app** - HTTP check la `/api/health`

### Security

- Aplicația rulează ca user non-root
- Secrets se transmit prin environment variables
- Network izolat între servicii

## 🚀 Deployment în Production

### 1. Configurare Server

```bash
# Install Docker și Docker Compose pe server
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Aplicația

```bash
# Clone repository pe server
git clone <repository-url>
cd web-app

# Configurează environment variables
cp .env.example .env
vim .env  # Editează cu valorile de production

# Deploy
make prod-build
make prod-up

# Verifică health
make health
```

### 3. Setup Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Monitoring și Debugging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web-app
docker-compose logs -f postgres
```

### Exec în Container

```bash
# Access application container
docker-compose exec web-app sh

# Access database
docker-compose exec postgres psql -U postgres -d cyberpunk_app
```

### Health Check

```bash
# Check all services
docker-compose ps

# Check application health endpoint
curl http://localhost:3000/api/health
```

## 🆘 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change ports în docker-compose.yml
   ports:
     - "3001:3000"  # Instead of 3000:3000
   ```

2. **Database connection failed**
   ```bash
   # Verifică DATABASE_URL în .env
   # Asigură-te că postgres service este healthy
   docker-compose logs postgres
   ```

3. **Permission denied**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER .
   ```

4. **Out of disk space**
   ```bash
   # Clean Docker resources
   make clean
   # sau
   docker system prune -a
   ```

### Reset Complete

```bash
# Stop everything
make prod-down

# Clean resources  
make clean

# Remove volumes (DESTRUCTIV - pierde toate datele!)
docker-compose down -v

# Rebuild și restart
make reset-deploy-prod
```

## 🔐 Security Best Practices

1. **Environment Variables**: Nu commit niciodată .env files cu secrets reale
2. **Network Security**: Folosește Docker networks pentru izolare
3. **User Permissions**: Aplicația rulează ca non-root user
4. **HTTPS**: Folosește reverse proxy cu SSL termination
5. **Database Security**: Schimbă password-urile default
6. **Updates**: Ține containerele actualizate regulat

## 📊 Performance Optimization

1. **Multi-stage builds** pentru imagini mai mici
2. **Layer caching** pentru build-uri mai rapide  
3. **Health checks** pentru auto-recovery
4. **Resource limits** pentru control memorie/CPU
5. **Redis caching** pentru performance îmbunătățit

## 🔄 CI/CD Integration

Aplicația include GitHub Actions workflow pentru:

- Automated testing
- Docker image building
- Container registry publishing
- Deployment automation

Vezi `.github/workflows/docker-deploy.yml` pentru detalii.