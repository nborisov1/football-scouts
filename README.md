# ⚽ Football Scouting Platform

**Hebrew**: פלטפורמת סקאוטינג כדורגל

A pioneering digital platform that revolutionizes how young football talents are discovered, developed, and connected with professional scouts worldwide.

## 🌟 Features

### For Players
- **Profile Creation & Management** - Comprehensive player profiles with statistics
- **Video Challenges** - Upload videos completing specific football challenges
- **Training Programs** - Structured training plans with progress tracking
- **Leaderboards** - Compete with other players and track rankings
- **Progress Analytics** - Detailed performance metrics and improvement tracking

### For Scouts
- **Player Discovery** - Advanced search and filtering to find talent
- **Video Analysis** - Review player videos with evaluation tools
- **Watchlist Management** - Track interesting players and their progress
- **Communication Tools** - Direct messaging with players and agents
- **Scouting Reports** - Generate comprehensive player evaluations

### For Administrators
- **User Management** - Oversee all platform users and accounts
- **Content Moderation** - Review and approve uploaded videos
- **Analytics Dashboard** - Platform usage statistics and insights
- **Training Management** - Create and update training programs
- **System Configuration** - Platform settings and maintenance

## 🏗️ Project Structure

```
football-scouts/
├── src/                         # React application source
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard & management
│   │   ├── challenges/         # User challenges page
│   │   ├── discover/           # Player discovery page
│   │   ├── leaderboards/       # Rankings and leaderboards
│   │   ├── profile/            # User profile management
│   │   ├── training/           # Training programs page
│   │   ├── watchlist/          # Scout watchlist page
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable React components
│   │   ├── modals/            # Modal components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Site footer
│   │   └── Layout.tsx         # Page layout wrapper
│   ├── contexts/              # React Context providers
│   │   └── AuthContext.tsx    # Authentication state
│   ├── lib/                   # Utility libraries
│   │   └── firebase.ts        # Firebase configuration
│   └── types/                 # TypeScript type definitions
├── tests/                      # Test suites
├── docs/                       # Documentation
├── images/                     # Static assets
└── [config files]             # Next.js, Tailwind, etc.
```

## 🛠️ Technology Stack

### Production-Ready React Application
- **Frontend Framework**: React 19 with Next.js 15
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with responsive design
- **Authentication**: Firebase Auth v9+ with React Context
- **Database**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage (videos, images)
- **State Management**: React Context API
- **Routing**: Next.js App Router (file-based)
- **Build System**: Next.js with Webpack/Babel
- **Testing**: Jest with React Testing Library
- **Languages**: Full RTL support for Hebrew + English

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser
- Firebase project (for production)

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/football-scouts.git
   cd football-scouts
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 👤 Demo Accounts

### Admin Access
- **Email**: admin@example.com
- **Password**: admin123
- **Features**: Full admin panel access

### Test Registration
- Create new accounts through the registration flow
- Choose between Player and Scout roles
- All user types have full functionality

## 📚 Documentation

| Document | Description |
|----------|-------------|
| 📋 [Project Overview](docs/PROJECT_OVERVIEW.md) | Comprehensive project description and features |
| 🗓️ [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) | Development timeline and milestones |
| 🚀 [Local Setup Guide](docs/guides/RUN_LOCALLY.md) | Detailed local development setup |
| 🔐 [Security Guidelines](docs/technical/SECURITY.md) | Security best practices |
| ⚡ [Performance Guide](docs/technical/PERFORMANCE.md) | Optimization recommendations |
| 🌐 [Deployment Guide](docs/operations/DEPLOYMENT.md) | Production deployment steps |
| ♿ [Accessibility Guide](docs/guides/ACCESSIBILITY.md) | WCAG compliance guidelines |
| 👑 [Admin Guide](ADMIN_GUIDE.md) | Admin panel usage instructions |

## 🧪 Development Status

🎉 **Status**: Production-Ready React Application  
🚀 **Framework**: Next.js 15 with React 19  
🔥 **Features**: All functionality implemented and tested  
✅ **Migration**: Complete from HTML/JS to React/TypeScript

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Maor36** - [vvlielvv@gmail.com](mailto:vvlielvv@gmail.com)

---

**Built with ❤️ for the future of football scouting**