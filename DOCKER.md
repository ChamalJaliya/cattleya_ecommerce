# 🌺 Cattleya E-commerce Platform - Docker Setup

This document explains how to run the complete Cattleya e-commerce platform using Docker with MongoDB replica set support, which fixes the transaction requirements for user CRUD operations.

## 🎯 What This Docker Setup Solves

- ✅ **MongoDB Transactions**: Runs MongoDB with replica set for transaction support
- ✅ **Service Orchestration**: All services (Frontend, Backend, Database, Nginx) running together
- ✅ **Database Seeding**: Automatic creation of demo users
- ✅ **Reverse Proxy**: Nginx handling routing and load balancing
- ✅ **Development Environment**: Hot reload for both frontend and backend

## 📋 Prerequisites

- Docker Desktop installed and running
- PowerShell (for Windows users)
- At least 4GB RAM available for Docker

## 🚀 Quick Start

### Option 1: Using PowerShell Script (Recommended)
```powershell
# Run the startup script
./start-cattleya.ps1
```

### Option 2: Using Docker Compose Directly
```bash
# Clean start
docker-compose down --volumes --remove-orphans

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Frontend      │    │   Backend API   │
│   Port: 80      │◄───│   Port: 3000    │◄───│   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │   Port: 27017   │
                    │   Replica Set   │
                    └─────────────────┘
```

## 🌐 Service URLs

- **Main Application**: http://localhost (via Nginx)
- **Frontend Direct**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost/health

## 🔑 Demo Credentials

```
Admin User:
  Email: admin@cattleya.com
  Password: password123

Staff User:
  Email: staff@cattleya.com
  Password: password123

Customer User:
  Email: customer@cattleya.com
  Password: password123
```

## 🐳 Docker Services

### 1. MongoDB (cattleya-mongodb)
- **Image**: mongo:7.0
- **Features**: Replica set enabled for transactions
- **Port**: 27017
- **Credentials**: admin/password123

### 2. MongoDB Setup (cattleya-mongodb-setup)
- **Purpose**: Initializes replica set and seeds demo data
- **Runs**: Setup scripts then exits

### 3. Backend API (cattleya-backend)
- **Framework**: NestJS
- **Port**: 3001
- **Features**: JWT auth, Swagger docs, MongoDB with Prisma

### 4. Frontend (cattleya-frontend)
- **Framework**: Next.js
- **Port**: 3000
- **Features**: React 18, TypeScript, Tailwind CSS, Material-UI

### 5. Nginx Proxy (cattleya-nginx)
- **Port**: 80, 443
- **Features**: Load balancing, CORS handling, rate limiting

## 📊 Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Check Service Status
```bash
docker-compose ps
```

### Access Database
```bash
# Connect to MongoDB
docker exec -it cattleya-mongodb mongosh --host localhost:27017 -u admin -p password123

# Check replica set status
rs.status()

# View users collection
use cattleya
db.User.find().pretty()
```

## 🛠️ Development Commands

### Restart Services
```bash
docker-compose restart backend frontend
```

### Rebuild Specific Service
```bash
docker-compose up --build backend
```

### Clean Everything
```bash
docker-compose down --volumes --remove-orphans
docker system prune -f
```

### Database Operations
```bash
# Reset database (removes all data)
docker-compose down -v
docker-compose up -d mongodb mongodb-setup

# Re-seed database
docker exec cattleya-mongodb mongosh --host localhost:27017 --file /seed-database.js
```

## 🔧 Configuration

### Environment Variables
All environment variables are configured in `docker-compose.yml`:

- `DATABASE_URL`: MongoDB connection with replica set
- `JWT_SECRET`: Authentication secret
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Development/production mode

### Custom Configuration
To customize the setup:

1. **MongoDB**: Edit `docker/setup-replica.js`
2. **Nginx**: Edit `docker/nginx.conf`
3. **Environment**: Edit `docker-compose.yml` environment sections

## ❌ Troubleshooting

### Common Issues

**Container won't start:**
```bash
docker-compose logs [service-name]
```

**Port conflicts:**
- Stop other services on ports 80, 3000, 3001, 27017
- Or modify ports in `docker-compose.yml`

**Database connection issues:**
```bash
# Check MongoDB replica set
docker exec -it cattleya-mongodb mongosh --eval "rs.status()"
```

**Frontend/Backend not communicating:**
- Check CORS settings in `docker/nginx.conf`
- Verify API_URL in frontend environment

### Clean Restart
```bash
# Nuclear option - removes everything
docker-compose down --volumes --remove-orphans
docker system prune -a -f
./start-cattleya.ps1
```

## 🎯 Next Steps

1. **User Registration**: Test the sign-up flow with transaction support
2. **API Testing**: Use Swagger docs at http://localhost:3001/api/docs
3. **Role-based Dashboards**: Login with different user roles
4. **Development**: Make changes and see hot reload in action

## 📝 Notes

- First startup takes longer (building images + seeding database)
- MongoDB replica set initialization takes ~15 seconds
- Demo users are created automatically on first run
- All data persists in Docker volumes until explicitly removed 