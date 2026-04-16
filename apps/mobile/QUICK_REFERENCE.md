# EVA Flutter App - Quick Reference

## 🚀 Quick Start
```bash
# Set Flutter in PATH (Windows)
$env:Path = "c:\flutter\bin;$env:Path"

# Navigate to project
cd C:\eva_flutter_app

# Configure .env with Supabase credentials

# Run on device
flutter run
```

## 📋 Common Commands

| Command | Purpose |
|---------|---------|
| `flutter run` | Run on connected device |
| `flutter pub get` | Install dependencies |
| `flutter pub run build_runner build` | Generate code |
| `flutter analyze` | Check code quality |
| `flutter test` | Run tests |
| `flutter clean` | Clean build |
| `flutter build apk` | Build Android APK |
| `flutter build windows` | Build Windows app |
| `flutter build ios` | Build iOS (macOS) |
| `flutter build macos` | Build macOS |
| `flutter build linux` | Build Linux |

## 📱 Run on Specific Device
```bash
flutter run -d chrome         # Web browser
flutter run -d emulator       # Android emulator
flutter run -d simulator      # iOS simulator
flutter run -d windows        # Windows
flutter run -d linux          # Linux
flutter run -d macos          # macOS
```

## 🔑 Project Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (Supabase URL & key) |
| `lib/main.dart` | Entry point |
| `lib/app.dart` | App routing & theme |
| `pubspec.yaml` | Dependencies & config |
| `analysis_options.yaml` | Linting rules |

## 🗂️ Folder Structure

| Folder | Contains |
|--------|----------|
| `lib/models/` | Data models (auto-generated `.g.dart` files) |
| `lib/providers/` | Riverpod state managers |
| `lib/services/` | Business logic & API calls |
| `lib/screens/` | UI pages/screens |
| `lib/widgets/` | Reusable components |
| `android/` | Android platform code |
| `ios/` | iOS platform code |
| `windows/` | Windows platform code |
| `assets/` | Images, icons, fonts |

## 🔧 Setup Checklist

- [ ] Flutter SDK installed (v3.10+)
- [ ] `cd C:\eva_flutter_app`
- [ ] `.env` file updated with Supabase credentials
- [ ] `flutter pub get` completed (156 packages)
- [ ] `flutter run` tested on device/emulator

## 📊 Stack Overview

| Layer | Technology |
|-------|-----------|
| **UI** | Flutter (Material 3) |
| **State** | Riverpod + StateNotifier |
| **Navigation** | GoRouter |
| **Data** | JSON Serializable models |
| **API** | Supabase (same as web) |
| **Auth** | Supabase Auth |
| **Storage** | SharedPreferences |
| **Testing** | Flutter Test + Mockito |

## 🎯 Supported Platforms

✅ Android (21+)  
✅ iOS (11.0+)  
✅ Windows (10+)  
✅ macOS (10.11+)  
✅ Linux (GTK 3.0+)  
🔜 Web (optional)

## 📦 Key Dependencies (30+)

- `supabase_flutter` - Backend
- `hooks_riverpod` - State
- `go_router` - Navigation
- `shared_preferences` - Cache
- `flutter_local_notifications` - Notifications
- `json_annotation` - JSON serialization
- ...and 24 more

## ⚡ Development Tips

### Hot Reload
Works for most code changes. Press `R` in terminal.

### Hot Restart
Full rebuild. Press `Shift+R` in terminal.

### Debug Mode
```bash
flutter run -v  # Verbose output
```

### DevTools
```bash
flutter pub global activate devtools
devtools
```

## 🔐 Environment Setup

```env
# .env file location: C:\eva_flutter_app\.env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Flutter not found | `$env:Path = "c:\flutter\bin;$env:Path"` |
| Deps not installing | `flutter clean && flutter pub get` |
| Build fails | `flutter clean && flutter pub get` |
| JSON gen missing | `flutter pub run build_runner build` |

## 📝 Notes

- All business logic ported from web app
- Shares same Supabase backend
- Uses same data models & calculations
- One codebase for all platforms
- Native performance on each platform

## 🔗 Resources

- [Flutter Docs](https://flutter.dev)
- [Riverpod Docs](https://riverpod.dev)
- [Supabase Docs](https://supabase.com/docs)
- [GoRouter Docs](https://pub.dev/packages/go_router)

---

**Status**: ✅ Ready to Run  
**Location**: `C:\eva_flutter_app`  
**Flutter**: 3.41.6  
**Dart**: 3.11.4
