# EVA Mobile App

Flutter-based mobile version of the EVA personal finance companion. Uses the same Supabase backend as the web app for seamless data synchronization.

## Architecture

- **Frontend**: Flutter with Riverpod for state management
- **Backend**: Shared Supabase backend (Auth, Postgres, Edge Functions)
- **Platforms**: iOS, Android, Web

## Prerequisites

- Flutter SDK 3.11.4 or higher
- Dart SDK
- Android Studio (for Android development)
- Xcode (for iOS development)
- Supabase project credentials

## Setup

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Run the App

```bash
# Development
flutter run

# Release
flutter run --release

# Web
flutter run -d web

# iOS
flutter run -d ios

# Android
flutter run -d android
```

## Project Structure

```
lib/
  ├── main.dart              # App entry point
  ├── app.dart               # App widget with routing
  ├── models/                # Data models (BootstrapData, etc.)
  ├── providers/             # Riverpod providers and state management
  ├── services/              # API and backend services
  ├── screens/               # App screens and pages
  ├── widgets/               # Reusable UI components
  └── theme/                 # Theming and styling

android/                      # Android-specific code
ios/                         # iOS-specific code
web/                         # Web-specific code
```

## Key Features

- **Authentication**: Supabase Auth with email/password
- **Workspace Management**: Bootstrap data with user profile, goals, budgets
- **Financial Tracking**: Transactions, budget limits, subscriptions
- **Advice Cards**: AI-powered financial insights
- **Real-time Sync**: Riverpod-based state management with Supabase integration

## Services

### EdgeFunctionsService
Communicates with Supabase Edge Functions for the `finance-core` API:
- Bootstrap data fetching
- Financial operations (goals, budgets, subscriptions, entries)

### WorkspaceService
High-level API for workspace operations:
- `fetchBootstrap()` - Get canonical workspace state
- `completeOnboarding()` - Complete user onboarding
- `saveGoal()` / `deleteGoal()` - Manage financial goals
- `saveBudgetLimit()` / `deleteBudgetLimit()` - Manage budgets
- `saveSubscription()` / `deleteSubscription()` - Manage subscriptions
- `saveFinancialEntry()` / `deleteFinancialEntry()` - Track transactions

### AuthService
Authentication operations:
- Password-based sign up and sign in
- Password setup requirements
- Session management

## State Management

The app uses Riverpod with `hooks_riverpod` for reactive state management:

```dart
// PublicUserProvider exposes authenticated user state
final publicUser = ref.watch(publicUserProvider);

// Access workspace data
final bootstrap = publicUser.bootstrap;

// Perform mutations
await ref.read(publicUserProvider.notifier).saveGoal(goalData);
```

## Building for Production

### Android

```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
# Generate IPA using Xcode
```

### Web

```bash
flutter build web --release
```

## Testing

```bash
flutter test
```

## Troubleshooting

### Session Not Ready
If you get "Your session was not ready" errors, wait a moment and retry.

### Build Issues
```bash
flutter clean
flutter pub get
flutter pub run build_runner build
```

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
flutter clean && flutter pub get
```

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable API key
- `GROQ_API_KEY`: (Optional) For enhanced AI features
- `TAVILY_API_KEY`: (Optional) For research and news features

## Contributing

Follow Flutter best practices and ensure all errors/warnings are resolved before committing.

## License

Part of the EVA project. See main LICENSE file for details.
