# 🚀 Getting Started with Cattleya E-commerce

## Quick Start Guide

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd cattleya-frontend
npm install

# Install backend dependencies  
cd ../cattleya-backend
npm install

# Return to root
cd ..
```

### 2. Set up Environment Variables

#### Frontend Environment (cattleya-frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

#### Backend Environment (cattleya-backend/.env)
```env
DATABASE_URL="mongodb://localhost:27017/cattleya"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
cd cattleya-backend

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# (Optional) View your database
npx prisma studio
```

### 4. Run the Application

```bash
# From root directory
npm run dev

# This will start:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api
```

## 📦 What's Included

### ✅ Frontend Setup Complete
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS with custom orchid theme
- Material-UI integration
- Global styles and animations
- Project structure for components

### ✅ Backend Setup Complete  
- NestJS application structure
- Prisma schema for e-commerce
- Complete database models
- Package.json with all dependencies

### 🚧 Next Steps Needed

1. **Create Components** - Build the referenced components in the frontend
2. **Backend Modules** - Implement the NestJS modules (auth, products, orders, etc.)
3. **Authentication** - Set up JWT auth flow
4. **Stripe Integration** - Complete payment processing
5. **Admin Dashboard** - Build management interface

## 🛠️ Development Workflow

### Frontend Development
```bash
cd cattleya-frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run type-check # Check TypeScript
```

### Backend Development
```bash
cd cattleya-backend
npm run start:dev    # Start with watch mode
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Database Operations
```bash
cd cattleya-backend
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema changes
npm run prisma:studio    # Open database browser
npm run prisma:seed      # Seed database (when created)
```

## 🎯 First Development Tasks

1. **Create Theme Provider Component** (`components/providers/ThemeProvider.tsx`)
2. **Create Layout Components** (`components/layout/Header.tsx`, `Footer.tsx`)
3. **Create Section Components** (`components/sections/Hero.tsx`, etc.)
4. **Set up Zustand Stores** (`store/authStore.ts`, `cartStore.ts`, etc.)
5. **Create Backend Main Module** (`src/main.ts`)
6. **Create Auth Module** (`src/auth/`)

## 📱 Features to Build

### Core E-commerce Features
- [ ] Product catalog with categories
- [ ] Shopping cart functionality
- [ ] User authentication & registration
- [ ] Order management
- [ ] Payment processing with Stripe
- [ ] User profiles and addresses
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Email notifications

### Advanced Features
- [ ] Product search and filtering
- [ ] Inventory management
- [ ] Order tracking
- [ ] Point of Sale (POS) system
- [ ] Analytics dashboard
- [ ] SEO optimization
- [ ] Mobile app (optional)

## 🔧 Troubleshooting

### Common Issues

**TypeScript Errors in Frontend:**
- Run `npm install` in cattleya-frontend
- Check that all components are created before importing

**Database Connection Issues:**
- Ensure MongoDB is running
- Check DATABASE_URL in .env file
- Run `npx prisma db push` to sync schema

**Port Conflicts:**
- Frontend: Change port in `package.json` scripts
- Backend: Change PORT in `.env` file

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Material-UI](https://mui.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

Ready to build something amazing! 🌺 