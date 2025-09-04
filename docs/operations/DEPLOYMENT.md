# Deployment Guide - Football Scouting Platform

**Hebrew**: מדריך פריסה - פלטפורמת סקאוטינג כדורגל

This guide covers deployment strategies for the React-based Football Scouting Platform.

## 🎯 Deployment Overview

The platform is built with Next.js and can be deployed to various hosting providers:

### Recommended Hosting Options
1. **Vercel** (Recommended) - Native Next.js support
2. **Firebase Hosting** - Google's hosting with Firebase integration
3. **Netlify** - JAMstack hosting with automatic deployments
4. **AWS** - Enterprise-grade hosting on Amazon Web Services
5. **Digital Ocean** - VPS hosting with Docker containers

## 🚀 Vercel Deployment (Recommended)

### Why Vercel?
- Built by the creators of Next.js
- Zero-configuration deployment
- Automatic optimizations
- Global CDN
- Serverless functions support

### Quick Deployment Steps

#### 1. Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

#### 2. Deploy from GitHub
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js and deploys

#### 3. Deploy from Command Line
```bash
# In your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Link to existing project? No
# - Project name: football-scouts
# - Directory: ./
# - Override settings? No

# Your app will be deployed and you'll get a URL
```

#### 4. Environment Variables
```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# ... add all Firebase config variables

# Or use the Vercel dashboard to add them
```

### Custom Domain
```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS records as instructed
# Vercel handles SSL certificates automatically
```

## 🔥 Firebase Hosting Deployment

### Why Firebase Hosting?
- Integrated with Firebase services
- Fast global CDN
- SSL certificates included
- Easy rollback capabilities

### Setup Steps

#### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### 2. Initialize Firebase Hosting
```bash
# In your project directory
firebase init hosting

# Select options:
# - Use an existing project (your Firebase project)
# - Public directory: out
# - Single-page app: Yes
# - Overwrite index.html: No
```

#### 3. Configure Next.js for Static Export
```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

#### 4. Build and Deploy
```bash
# Build static version
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Your app will be available at:
# https://your-project-id.web.app
```

### Environment Variables for Firebase
```javascript
// src/lib/firebase.ts - already configured
const firebaseConfig = {
  // Your existing config
}
```

## 🌐 Netlify Deployment

### Setup Steps

#### 1. Build Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Deploy Options

**Option A: Git Integration**
1. Push code to GitHub/GitLab
2. Connect repository in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `out`

**Option B: CLI Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=out
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Use Node.js official image
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

### Docker Commands
```bash
# Build image
docker build -t football-scouts .

# Run container
docker run -p 3000:3000 football-scouts

# With environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=your-key \
  football-scouts
```

## ☁️ AWS Deployment

### Using AWS Amplify

#### 1. Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### 2. Initialize Amplify
```bash
amplify init

# Follow prompts:
# - Project name: football-scouts
# - Environment: production
# - Default editor: VS Code
# - App type: javascript
# - Framework: react
# - Source directory: src
# - Build directory: out
# - Build command: npm run build
# - Start command: npm start
```

#### 3. Add Hosting
```bash
amplify add hosting

# Select:
# - Amazon CloudFront and S3
# - DEV (S3 only with HTTP)
# - Hosting bucket name: football-scouts-hosting

amplify publish
```

## 🔧 Environment Configuration

### Environment Variables
Create production environment files:

```bash
# .env.production
NEXT_PUBLIC_FIREBASE_API_KEY=your-production-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NODE_ENV=production
```

### Build Optimization
```javascript
// next.config.ts
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable PWA features
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
      ],
    },
  ],
}
```

## 📊 Performance Monitoring

### Analytics Setup
```javascript
// Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Performance Monitoring
```bash
# Lighthouse CI for automated testing
npm install -g @lhci/cli

# Run Lighthouse audit
lhci autorun
```

## 🔒 Security Considerations

### Production Security Checklist
- [ ] Firebase security rules configured
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (automatic with most hosts)
- [ ] CSP headers configured
- [ ] Firebase authentication properly configured
- [ ] Admin routes protected
- [ ] Input validation on all forms
- [ ] File upload restrictions in place

### Firebase Security Rules
```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can access all data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
  }
}
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] Admin account created

### Post-Deployment
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Admin panel accessible
- [ ] All pages render properly
- [ ] Mobile responsiveness tested
- [ ] Performance audit completed
- [ ] SSL certificate active
- [ ] DNS properly configured

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear caches
rm -rf .next node_modules
npm install
npm run build
```

#### Firebase Connection Issues
```bash
# Check Firebase config
# Verify project ID and API keys
# Test locally first
```

#### Static Export Issues
```bash
# Check for server-side only code
# Review dynamic routes
# Verify image optimization settings
```

### Support Resources
- **Vercel Docs**: https://vercel.com/docs
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Netlify Docs**: https://docs.netlify.com

---

**Successful deployment! 🚀**