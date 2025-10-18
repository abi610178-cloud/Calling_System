# Client Calling System - Mobile App

A native mobile application for managing client calls and contacts, built with React Native and Expo.

## Features

- **Native Mobile Experience**: True iOS and Android native application
- **Authentication**: Secure login and signup with Supabase
- **Contact Management**: Add, view, and manage client contacts
- **Direct Calling**: Make phone calls directly from the app
- **WhatsApp Integration**: Quick WhatsApp messaging
- **Real-time Sync**: Data synced with Supabase backend
- **Offline Support**: Uses AsyncStorage for persistence

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Expo Go app installed on your phone (for testing)
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation

1. **Navigate to the mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials (already configured)

## Running the App

### Development Mode

Start the Expo development server:

```bash
npm start
```

This will open the Expo DevTools in your browser with options to:

- **Press `a`** - Open on Android emulator/device
- **Press `i`** - Open on iOS simulator (macOS only)
- **Scan QR code** - Open on your physical device using Expo Go app

### Running on Physical Device

1. Install **Expo Go** app on your phone
2. Run `npm start` in the mobile directory
3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Running on Emulators

**Android:**
```bash
npm run android
```

**iOS (macOS only):**
```bash
npm run ios
```

## Project Structure

```
mobile/
├── App.tsx                 # Main application component
├── index.js               # App entry point
├── lib/
│   └── supabase.ts       # Supabase client configuration
├── .env                   # Environment variables
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Building for Production

### Android APK

```bash
expo build:android
```

### iOS App

```bash
expo build:ios
```

For more details on building standalone apps, see [Expo Build Documentation](https://docs.expo.dev/build/setup/).

## Key Dependencies

- **expo**: Core framework for React Native apps
- **react-native**: Native mobile framework
- **@supabase/supabase-js**: Backend and authentication
- **@react-native-async-storage/async-storage**: Local data persistence
- **expo-secure-store**: Secure credential storage

## Features Overview

### Authentication
- Email/password login and signup
- Secure session management with Supabase
- Persistent authentication state

### Contact Management
- Add new contacts with name and phone number
- View all contacts in a clean list
- Contact status tracking (pending, calling, answered, missed)

### Communication
- **Direct Calling**: Tap to call any contact
- **WhatsApp Integration**: Quick message via WhatsApp
- Automatic phone number formatting

### Data Sync
- Real-time synchronization with Supabase
- Automatic data refresh on app open
- Secure user-specific data access

## Troubleshooting

### App Won't Start
```bash
rm -rf node_modules
npm install
expo start -c
```

### Clear Expo Cache
```bash
expo start -c
```

### Module Not Found Errors
```bash
npm install
```

### Supabase Connection Issues
- Check your `.env` file has correct credentials
- Ensure you have internet connection
- Verify Supabase project is active

## Platform-Specific Notes

### iOS
- Requires macOS for iOS simulator
- Physical device testing requires Apple Developer account
- WhatsApp calling requires WhatsApp installed

### Android
- Works on Windows, macOS, and Linux
- USB debugging must be enabled for physical devices
- WhatsApp calling requires WhatsApp installed

## Database Schema

The app uses the following Supabase tables:

- **businesses**: Business categories/types
- **employees**: Client contacts with call status
- **auth.users**: User authentication (managed by Supabase)

## Security

- All authentication handled by Supabase Auth
- Row Level Security (RLS) enabled on all tables
- API keys stored securely in environment variables
- No sensitive data stored in app code

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Expo documentation: https://docs.expo.dev
3. Check Supabase documentation: https://supabase.com/docs

## Next Steps

1. **Install dependencies**: `cd mobile && npm install`
2. **Start development server**: `npm start`
3. **Open on your device**: Scan QR code with Expo Go
4. **Login or create account** to start managing contacts!

## Deployment

### Publishing to Expo
```bash
expo publish
```

### Building Standalone Apps
```bash
expo build:android
expo build:ios
```

See [Expo documentation](https://docs.expo.dev/distribution/introduction/) for detailed deployment guides.
