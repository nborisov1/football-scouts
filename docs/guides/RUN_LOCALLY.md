# Local Development Setup Guide

**Hebrew**: מדריך הגדרת סביבת פיתוח מקומית

This guide explains how to set up and run the Football Scouting Platform React application locally for development.

## 🎯 Prerequisites

### Required Software
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** (for cloning the repository)
- **Modern web browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Check Your Environment
```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version   # Should be 9+

# Check Git version
git --version
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/football-scouts.git
cd football-scouts
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install

# This will install:
# - React 19 & Next.js 15
# - TypeScript & type definitions
# - Tailwind CSS for styling
# - Firebase SDK v12
# - Testing libraries (Jest, Testing Library)
# - Development tools (ESLint, etc.)
```

## 🚀 Development Server

### Start the Development Server
```bash
# Start the Next.js development server
npm run dev

# The server will start on http://localhost:3000
# Hot reloading is enabled for instant updates
```

### Available Scripts
```bash
# Development server with hot reloading
npm run dev

# Build production version
npm run build

# Start production server (requires build first)
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

## 🏠 Accessing the Application

### Main Application
- **URL**: http://localhost:3000
- **Features**: Full React application with all pages

### Available Pages
- **Homepage**: `/` - Landing page with auth
- **Leaderboards**: `/leaderboards` - Player rankings
- **Training**: `/training` - Training programs
- **Challenges**: `/challenges` - User challenges
- **Profile**: `/profile` - User profile management
- **Discover**: `/discover` - Player discovery
- **Watchlist**: `/watchlist` - Scout watchlist
- **Admin Dashboard**: `/admin` - Admin control panel
- **Video Management**: `/admin/videos` - Video approval

### Demo Accounts
```bash
# Admin Account
Email: admin@example.com
Password: admin123

# Create new accounts through registration
# Choose Player or Scout role
```

## 🔧 Development Tools

### TypeScript Support
- Full TypeScript integration
- Type checking on build and in editor
- Custom types in `src/types/`

### Tailwind CSS
- Utility-first CSS framework
- Responsive design built-in
- RTL support for Hebrew

### Firebase Integration
- Authentication with Firebase Auth v9+
- Firestore database integration
- Real-time data updates

### Testing Environment
```bash
# Run specific test suites
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only

# Test with specific pattern
npm test -- --testNamePattern="auth"

# Generate coverage and open report
npm run test:coverage
open coverage/lcov-report/index.html
```

## 📁 Project Structure

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin pages
│   ├── (other-pages)/     # All other routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── modals/           # Modal components
│   └── *.tsx             # Other components
├── contexts/             # React Context providers
├── lib/                  # Utility libraries
└── types/                # TypeScript definitions
```

### Configuration Files
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `babel.config.js` - Babel configuration (for Jest)

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# If port 3000 is busy, Next.js will automatically use 3001
# Or specify a different port:
npm run dev -- -p 3001
```

#### Node Version Issues
```bash
# If you have Node version conflicts, use nvm:
nvm install 18
nvm use 18
npm install
```

#### Firebase Connection Issues
```bash
# Check if Firebase config is correct in src/lib/firebase.ts
# Verify your internet connection
# Check browser console for error messages
```

#### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in your editor
```

#### Build Issues
```bash
# Clear all caches
npm run clean  # If available
rm -rf .next node_modules
npm install
npm run build
```

### Development Tips

#### Hot Reloading
- Changes to React components update instantly
- TypeScript errors show in browser overlay
- Tailwind classes update in real-time

#### Debugging
```bash
# Enable detailed error messages
NEXT_DEBUG=1 npm run dev

# Check bundle analyzer (if configured)
npm run analyze
```

#### Database Development
- Uses live Firebase project
- Changes persist across sessions
- Admin account created automatically in development

## 🔍 Code Quality

### Linting
```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Lint specific files
npx eslint src/components/Header.tsx
```

### Type Checking
```bash
# TypeScript type checking
npx tsc --noEmit

# Watch mode for continuous checking
npx tsc --noEmit --watch
```

## 📱 Browser Testing

### Supported Browsers
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Testing
```bash
# Access from mobile devices on same network
# Use your computer's IP address:
http://[YOUR-IP]:3000

# Example:
http://192.168.1.100:3000
```

## 🚀 Building for Production

### Production Build
```bash
# Create optimized production build
npm run build

# Verify build output
npm start

# Build will be in .next/ directory
```

### Performance Analysis
```bash
# Analyze bundle size (if configured)
npm run analyze

# Check build performance
npm run build -- --profile
```

## 📞 Getting Help

### Resources
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Firebase Docs**: https://firebase.google.com/docs

### Common Commands Reference
```bash
# Quick start
npm install && npm run dev

# Clean restart
rm -rf node_modules .next && npm install && npm run dev

# Full test run
npm run lint && npm test && npm run build

# Development with specific port
npm run dev -- -p 3001
```

---

**Happy coding! 🚀**