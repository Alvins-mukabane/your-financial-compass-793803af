# Deployment Guide

## Overview
This document provides comprehensive deployment instructions for the EVA Flutter application across web and mobile platforms.

## Web Deployment

### Prerequisites
- Flutter SDK installed
- Node.js and npm installed
- Firebase CLI installed

### Web Build Steps
1. Clean previous builds:
   \\\ash
   flutter clean
   \\\

2. Get dependencies:
   \\\ash
   flutter pub get
   \\\

3. Build for web:
   \\\ash
   flutter build web --release
   \\\

4. The build output will be in \uild/web/\

### Firebase Web Hosting
1. Initialize Firebase:
   \\\ash
   firebase init hosting
   \\\

2. Deploy to Firebase Hosting:
   \\\ash
   firebase deploy
   \\\

## Mobile Deployment

### iOS Deployment

#### Prerequisites
- macOS with Xcode installed
- Apple Developer account
- Provisioning profiles configured

#### Build Steps
1. Update version in \pubspec.yaml\:
   \\\yaml
   version: 1.0.0+1
   \\\

2. Build iOS app:
   \\\ash
   flutter build ios --release
   \\\

3. Open Xcode:
   \\\ash
   open ios/Runner.xcworkspace
   \\\

4. Configure signing and capabilities in Xcode
5. Archive and upload to App Store Connect

### Android Deployment

#### Prerequisites
- Android SDK installed
- Keystore file configured
- Google Play Developer account

#### Build Steps
1. Generate signing key (if needed):
   \\\ash
   keytool -genkey -v -keystore ~/key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
   \\\

2. Create \ndroid/key.properties\:
   \\\properties
   storePassword=<password>
   keyPassword=<password>
   keyAlias=key
   storeFile=/path/to/key.jks
   \\\

3. Build release APK:
   \\\ash
   flutter build apk --release
   \\\

4. Build app bundle (recommended for Play Store):
   \\\ash
   flutter build appbundle --release
   \\\

5. Upload to Google Play Console

## CI/CD Pipeline

This repository includes automated CI/CD workflows defined in \.github/workflows/deploy.yml\.

The pipeline includes:
- Automated testing on push
- Build generation for web, iOS, and Android
- Deployment to hosting platforms
- Notification of deployment status

## Environment Variables

Configure the following secrets in GitHub:
- \FIREBASE_TOKEN\: Firebase CLI token for deployment
- \APPLE_SIGNING_CERT_P12_PASSWORD\: iOS certificate password
- \ANDROID_KEYSTORE_PASSWORD\: Android keystore password
- \ANDROID_KEY_PASSWORD\: Android key password

## Rollback Procedures

### Web
1. Firebase Hosting maintains version history
2. To rollback:
   \\\ash
   firebase hosting:channels:list
   firebase hosting:clone-version <source> <target>
   \\\

### Mobile
1. Remove the bad version from App Store/Play Store
2. Upload previous stable version
3. Monitor crash reports and user feedback

## Monitoring and Logs

- Firebase Console: Monitor app analytics and errors
- GitHub Actions: Check deployment workflow logs
- App Store/Play Store: Monitor crash reports
- Firebase Crashlytics: Real-time crash reporting

## Support

For deployment issues, see:
- CI_CD_SETUP.md for detailed CI/CD configuration
- Flutter documentation: https://flutter.dev/deployment
- Firebase documentation: https://firebase.google.com/docs
