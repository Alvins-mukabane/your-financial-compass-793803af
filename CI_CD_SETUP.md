# GitHub Actions Configuration Guide

This document explains how to set up GitHub Actions secrets and environment variables for both the web and mobile applications.

## Required Secrets

To enable CI/CD pipelines, add these secrets to your GitHub repository:

### 1. Navigate to Repository Settings

Go to: `Settings` → `Secrets and variables` → `Actions`

### 2. Add the Following Secrets

#### Supabase Configuration (Required for both apps)
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase publishable API key
- `VITE_SUPABASE_URL`: Your Supabase project URL

#### Optional: External APIs
- `GROQ_API_KEY`: Groq API key for enhanced AI features
- `TAVILY_API_KEY`: Tavily API key for research and news features

#### Web App Deployment (for Vercel deployment)
- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID for the web app

#### Mobile App Deployment (for Play Store and App Store)
- `ANDROID_KEYSTORE`: Base64-encoded keystore file for Android APK signing
- `ANDROID_KEYSTORE_PASSWORD`: Password for the Android keystore
- `ANDROID_KEYSTORE_KEY_ALIAS`: Key alias in the keystore
- `ANDROID_KEYSTORE_KEY_PASSWORD`: Password for the key alias
- `APPLE_DEVELOPER_CERTIFICATE`: Base64-encoded Apple certificate
- `APPLE_DEVELOPER_CERTIFICATE_PASSWORD`: Certificate password
- `APPLE_PROVISIONING_PROFILE`: Base64-encoded provisioning profile

### 3. Environment Variables in Workflows

Environment variables can be set in workflow files or GitHub Actions:

**Test/CI Environment** (set in workflow file):
```yaml
env:
  VITE_SUPABASE_PROJECT_ID: ci-project-id
  VITE_SUPABASE_PUBLISHABLE_KEY: ci-publishable-key
  VITE_SUPABASE_URL: https://ci-project-id.supabase.co
```

**Production Environment** (use GitHub Secrets):
```yaml
env:
  VITE_SUPABASE_PROJECT_ID: ${{ secrets.VITE_SUPABASE_PROJECT_ID }}
  VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
```

## Workflow Files

### Web App CI: `.github/workflows/ci.yml`
- **Triggers**: Push to main/develop, PRs, manual dispatch
- **Jobs**: 
  - Setup Node.js
  - Install dependencies
  - Validate environment
  - Build
  - Lint
  - Test

### Mobile App CI: `.github/workflows/flutter-ci.yml`
- **Triggers**: Changes to `apps/mobile/` or `supabase/`
- **Jobs**:
  - Analyze Dart code
  - Format check
  - Run tests
  - Build Android APK

### Deployment: `.github/workflows/deploy.yml`
- **Triggers**: Push to main (web app changes)
- **Jobs**:
  - Build web app
  - Deploy to Vercel

## Setup Instructions

### 1. Configure Supabase Secrets

```bash
# Get your values from Supabase Dashboard
# https://app.supabase.com/project/[project-id]/settings/api
```

1. Go to Supabase Dashboard
2. Select your project
3. Navigate to `Settings` → `API`
4. Copy the values:
   - Project URL → `VITE_SUPABASE_URL`
   - Project ID → `VITE_SUPABASE_PROJECT_ID`
   - Publishable key (anon) → `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Configure Vercel Deployment (Web App)

For automatic deployment to Vercel:

1. Create a Vercel account: https://vercel.com
2. Create a new project pointing to your GitHub repo
3. Get your deployment token: https://vercel.com/account/tokens
4. Add secrets:
   - `VERCEL_TOKEN`: Your deployment token
   - `VERCEL_ORG_ID`: Found in Vercel account settings
   - `VERCEL_PROJECT_ID`: Found in Vercel project settings

### 3. Configure Mobile App Deployment (Optional)

#### Android (Play Store)
1. Create a keystore file for signing APKs
2. Encode as base64: `base64 -i release-key.jks -o release-key.jks.b64`
3. Add as `ANDROID_KEYSTORE` secret

#### iOS (App Store)
1. Generate Apple Developer certificate
2. Create provisioning profile
3. Encode both as base64
4. Add as `APPLE_DEVELOPER_CERTIFICATE` and `APPLE_PROVISIONING_PROFILE` secrets

## Workflow Troubleshooting

### Web App CI Fails
- Check if `apps/web/package.json` exists
- Verify environment variables are correct
- Check Node.js version in workflow matches `package.json`

### Mobile App CI Fails
- Ensure Flutter SDK is available
- Check if `apps/mobile/pubspec.yaml` exists
- Verify `working-directory` is correct
- Check Flutter version compatibility

### Deployment Fails
- Verify Vercel secrets are configured
- Check Vercel project settings
- Ensure branch is set to `main`

## Viewing Workflow Logs

1. Go to `Actions` tab in your GitHub repo
2. Click on the workflow run you want to inspect
3. Click on the job to see detailed logs
4. Look for errors in the "Run" sections

## Adding More Workflows

To add new CI/CD workflows:

1. Create a new `.yml` file in `.github/workflows/`
2. Define triggers (`on:`), jobs, and steps
3. Use environment variables and secrets as needed
4. Test the workflow by pushing to a feature branch
5. Merge to main once working

## Best Practices

✅ **Do:**
- Use secrets for sensitive information (API keys, tokens)
- Set proper `working-directory` for monorepo structure
- Use path filters to avoid unnecessary runs
- Cache dependencies for faster builds
- Add meaningful commit messages

❌ **Don't:**
- Commit `.env` files with real secrets
- Hardcode API keys in workflow files
- Use main branch as default for PRs
- Trigger all jobs on every commit
- Ignore workflow failures

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Flutter CI/CD](https://flutter.dev/docs/deployment)
