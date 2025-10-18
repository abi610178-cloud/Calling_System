# Client Calling System - Mobile & Web

This project includes both a **web application** and a **native mobile application** for managing client calls and contacts.

## Project Structure

```
project/
├── src/                    # Web application (React + Vite)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── services/
│
├── mobile/                 # Mobile application (React Native + Expo)
│   ├── App.tsx
│   ├── lib/
│   └── package.json
│
├── supabase/              # Database migrations
└── package.json           # Web app dependencies
```

## Two Applications

### 1. Web Application (Current)
- **Technology**: React + TypeScript + Vite + Tailwind CSS
- **Access**: Run in web browser
- **Location**: Root directory (`/`)

#### Running Web App:
```bash
npm install
npm run dev
```

Access at: `http://localhost:5173`

### 2. Mobile Application (NEW!)
- **Technology**: React Native + Expo + TypeScript
- **Access**: Native iOS and Android apps
- **Location**: `/mobile` directory

#### Running Mobile App:
```bash
cd mobile
npm install
npm start
```

Then:
- **On Phone**: Scan QR code with Expo Go app
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i` (macOS only)

## Quick Start - Mobile App

### Step 1: Install Expo Go on Your Phone

**iOS:**
- Download [Expo Go from App Store](https://apps.apple.com/app/expo-go/id982107779)

**Android:**
- Download [Expo Go from Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Step 2: Start the Mobile App

```bash
cd mobile
npm install
npm start
```

### Step 3: Open on Your Phone

1. The terminal will show a QR code
2. **iOS**: Open Camera app and scan the QR code
3. **Android**: Open Expo Go app and scan the QR code
4. The app will open automatically!

## Features Comparison

| Feature | Web App | Mobile App |
|---------|---------|------------|
| Authentication | ✅ | ✅ |
| Contact Management | ✅ | ✅ |
| Add/Delete Contacts | ✅ | ✅ |
| Call Contacts | ✅ (via link) | ✅ (native dialer) |
| WhatsApp Integration | ✅ (web link) | ✅ (native app) |
| Auto-Calling System | ✅ | 🚧 Coming soon |
| Calendar/Scheduling | ✅ | 🚧 Coming soon |
| Business Categories | ✅ | ✅ |
| Offline Support | ❌ | ✅ |
| Push Notifications | ❌ | 🚧 Coming soon |

## Shared Backend

Both applications use the **same Supabase database**, so:
- ✅ Data syncs between web and mobile
- ✅ Login works on both platforms
- ✅ Contacts added on mobile appear on web (and vice versa)
- ✅ Same authentication system

## Which Should I Use?

### Use Web App When:
- Working on desktop/laptop
- Need full feature set (auto-calling, scheduling)
- Managing multiple contacts at once
- Using advanced filtering and analytics

### Use Mobile App When:
- On the go
- Need to make quick calls
- Want native phone integration
- Need offline access to contacts
- Prefer mobile experience

## Development

### Web App Development:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run linter
```

### Mobile App Development:
```bash
cd mobile
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS (macOS only)
```

## Environment Variables

Both apps use the same Supabase credentials:

**Web App** (`.env`):
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

**Mobile App** (`mobile/.env`):
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
```

## Building for Production

### Web App:
```bash
npm run build
# Deploy dist/ folder to any static hosting
```

### Mobile App:

**Android APK:**
```bash
cd mobile
expo build:android
```

**iOS App:**
```bash
cd mobile
expo build:ios
```

## Troubleshooting

### Web App Issues:
- Clear browser cache
- Run `npm install` again
- Check browser console for errors

### Mobile App Issues:
- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Ensure phone and computer are on same WiFi network
- Check firewall isn't blocking connections

## Next Steps

1. ✅ **Web app is ready** - Just run `npm run dev`
2. ✅ **Mobile app is ready** - Go to `mobile/` and run `npm start`
3. 📱 **Test on your phone** - Install Expo Go and scan QR code
4. 🚀 **Deploy** - Build production versions when ready

## Support

- **Web App**: Built with Vite + React
- **Mobile App**: Built with Expo + React Native
- **Backend**: Supabase (shared)
- **Database**: PostgreSQL (via Supabase)

For detailed mobile setup, see `mobile/README.md`
