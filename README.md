# EVA - Personal Finance Companion

EVA is a comprehensive personal finance application providing real-time spending tracking, budget management, financial goal tracking, and AI-powered advice. The project includes both web and mobile implementations sharing a unified Supabase backend.

## Project Structure

```
eva/
├── apps/
│   ├── web/                    # React + TypeScript web application
│   │   ├── src/               # React components and pages
│   │   ├── public/            # Static assets
│   │   ├── package.json       # Web app dependencies
│   │   ├── vite.config.ts     # Vite configuration
│   │   └── README.md          # Web app documentation
│   │
│   └── mobile/                 # Flutter mobile application
│       ├── lib/               # Flutter Dart code
│       ├── android/           # Android-specific code
│       ├── ios/               # iOS-specific code
│       ├── web/               # Flutter web (experimental)
│       ├── pubspec.yaml       # Flutter dependencies
│       └── MOBILE_README.md   # Mobile app documentation
│
├── supabase/                   # Supabase backend (shared)
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge Functions
│   └── config.toml            # Supabase configuration
│
├── docker/                     # Docker configuration for deployments
├── scripts/                    # Build and deployment scripts
├── .github/workflows/          # CI/CD pipelines for both apps
│   ├── ci.yml                 # Web app CI
│   └── flutter-ci.yml         # Mobile app CI
│
└── README.md                   # This file
```

## Quick Start

### Prerequisites
- **For Web**: Node.js 22+, npm
- **For Mobile**: Flutter SDK 3.11.4+, Dart
- **Shared**: Supabase project credentials

### Environment Variables

Create a `.env` file in the root directory (web) or `apps/mobile/.env` for mobile:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
GROQ_API_KEY=your-groq-api-key (optional)
TAVILY_API_KEY=your-tavily-api-key (optional)
```

## Web Application

Located in `apps/web/` - A Vite + React + TypeScript application with:
- Real-time dashboard with spending summary
- Budget tracking and management
- Financial goals tracking
- Subscription monitoring
- AI-powered financial advice
- Chat-based interface
- Multi-device support

### Setup & Run

```bash
# Install dependencies
cd apps/web
npm ci

# Development
npm run dev

# Production build
npm run build

# Quality checks
npm run lint
npm run test

# Docker
npm run docker:build
npm run docker:run
```

See [apps/web/README.md](apps/web/README.md) for detailed web app documentation.

## Mobile Application

Located in `apps/mobile/` - A Flutter application supporting iOS, Android, and Web with:
- Native performance on iOS and Android
- Riverpod state management
- Supabase integration for real-time sync
- Onboarding flow
- Dashboard and financial tracking
- Budget and goal management
- Web platform support (experimental)

### Setup & Run

```bash
# Install dependencies
cd apps/mobile
flutter pub get

# Development (runs on default device)
flutter run

# Release builds
flutter build apk --release        # Android APK
flutter build appbundle --release  # Android App Bundle
flutter build ios --release        # iOS (requires Xcode)
flutter build web --release        # Web platform

# Testing
flutter test
```

See [apps/mobile/MOBILE_README.md](apps/mobile/MOBILE_README.md) for detailed mobile app documentation.

## Backend - Supabase

Both applications connect to a shared Supabase backend providing:

### Authentication
- Email/password authentication
- Session management
- User verification

### Database (Postgres)
- User profiles and workspace data
- Financial entries and transactions
- Budget limits and goals
- Subscriptions and recurring expenses
- Advice cards and insights

### Edge Functions
- **finance-core**: Main API for workspace state, goals, budgets, subscriptions, financial entries
- **chat**: AI-powered financial advisor
- **insights**: Financial analysis and recommendations
- **statements**: Financial statements generation

### Real-time Capabilities
- Real-time database updates via Supabase client libraries
- Automatic sync across devices

## Architecture

### Frontend
- **Web**: Vite + React 18 + TypeScript + Tailwind CSS
- **Mobile**: Flutter with Riverpod state management
- Both share authentication and communicate with same Supabase backend

### Backend
- Supabase Auth for user management
- Supabase Postgres for canonical finance data
- Supabase Edge Functions for business logic
- Gemini for AI orchestration

### Data Flow
```
User Input → App → Supabase Edge Functions → Postgres Database
Database → Real-time Updates → App State → UI
```

## CI/CD Pipeline

### Web App CI (`.github/workflows/ci.yml`)
Triggers on: Push to main/develop, PRs, manual dispatch
Steps:
1. Checkout code
2. Setup Node.js v22
3. Install dependencies
4. Validate environment
5. Build
6. Lint
7. Test

### Mobile App CI (`.github/workflows/flutter-ci.yml`)
Triggers on: Changes to `mobile/` or `supabase/`
Steps:
1. Flutter analysis and linting
2. Run tests
3. Build Android APK
4. Build Flutter Web
5. Build iOS (on macOS)
6. Upload artifacts

### Deployment
- **Web**: Deployed to Vercel (automatic from main branch)
- **Mobile**: Artifacts available from GitHub Actions (APK, App Bundle)

## Development

### Running Both Apps Locally

```bash
# Terminal 1: Run web app
cd apps/web
npm run dev

# Terminal 2: Run mobile app (on connected device/emulator)
cd apps/mobile
flutter run
```

### Database Access

```bash
# Using Supabase CLI
supabase start

# View logs
supabase functions list
supabase functions logs finance-core
```

### Code Quality

```bash
# Web app
cd apps/web
npm run lint
npm run test

# Mobile app
cd apps/mobile
flutter analyze
flutter test
```

## Testing

### Web App
```bash
npm run test           # Run tests
npm run test:ui        # Test UI
```

### Mobile App
```bash
flutter test           # Run unit tests
```

### Integration Testing
Use the provided Playwright configuration for end-to-end testing of the web app:
```bash
cd apps/web
npm run test:e2e
```

## Deployment

### Web App
Automatically deployed to Vercel on push to main branch.
Manual deployment:
```bash
cd apps/web
npm run build
```

### Mobile App
Build release artifacts:
```bash
cd apps/mobile

# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

## Monitoring & Logs

- **Sentry**: Error tracking for web app
- **Supabase Logs**: Function execution logs
- **GitHub Actions**: CI/CD pipeline logs

## Contributing

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Make changes in `apps/web` or `apps/mobile`
3. Run tests and lint checks
4. Commit with clear messages
5. Push and create a Pull Request

## Product Principles

- **Personal Finance First**: Focus on user's financial health
- **Grounded Advice**: Data-driven over generic AI
- **Trust Before Power**: Security and privacy paramount
- **Chat First, Structured Views Second**: Conversational interface primary
- **Managed Infrastructure**: Leverage managed services (Supabase, Vercel)

## License

See [LICENSE](LICENSE) file for details.

## Disclaimer

EVA provides informational guidance and financial coaching. It does not provide legal, tax, or professional investment advice. Always consult with qualified professionals before making financial decisions.

## Support

For issues, feature requests, or questions:
- **Web App**: See [apps/web/README.md](apps/web/README.md)
- **Mobile App**: See [apps/mobile/MOBILE_README.md](apps/mobile/MOBILE_README.md)
- **GitHub Issues**: [Report an issue](https://github.com/useaima/your-financial-compass-793803af/issues)

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Flutter Docs](https://flutter.dev/docs)
- [Vite Docs](https://vitejs.dev)
- [Riverpod Docs](https://riverpod.dev)

---

**EVA** - Your Personal Finance Compass 🧭💰
