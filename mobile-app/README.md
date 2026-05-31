# Kaar.Rentals — Android App (Expo + React Native)

Native shell around [kaar.rentals](https://kaar.rentals): branded header, bottom tabs, WhatsApp FAB, pull-to-refresh, and Android back handling. The site loads in a WebView with site chrome hidden so it feels like a native app.

## Project structure

```
mobile-app/
├── App.tsx                      # Entry: fonts, splash, SafeArea, navigation
├── app.json                     # Expo config (name, splash, Android package)
├── eas.json                     # EAS Build profiles (APK / AAB / Play Store)
├── index.ts                     # Expo registerRootComponent
├── package.json
├── tsconfig.json
├── assets/
│   ├── icon.png                 # App icon (1024×1024) — replace with your logo
│   ├── splash-icon.png          # Splash center image
│   └── android-icon-*.png       # Adaptive icon layers
└── src/
    ├── config/
    │   ├── constants.ts         # URLs, WhatsApp, routes
    │   └── theme.ts             # Colors/fonts (matches website CSS)
    ├── components/
    │   ├── AppHeader.tsx        # Native header (logo + back)
    │   ├── AppWebView.tsx       # WebView + refresh + back + link handling
    │   ├── FloatingWhatsApp.tsx # Always-visible FAB
    │   └── LoadingOverlay.tsx   # Gold spinner overlay
    ├── navigation/
    │   └── RootNavigator.tsx    # Bottom tabs: Home / Browse Cars / Profile
    ├── screens/
    │   └── WebTabScreen.tsx     # Tab screens wrapping AppWebView
    └── utils/
        ├── injectCss.ts         # Hides website header/footer in WebView
        └── linking.ts           # Internal vs external URLs
```

## Prerequisites

- Node.js 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) for Play Store builds: `npm install -g eas-cli`
- Expo account (free): https://expo.dev

## Install & run locally

```bash
cd mobile-app
npm install
npx expo start --clear
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi as your Mac).

### Fix: `java.io.IOException: Failed to download remote update`

This means **Expo Go cannot reach your Metro dev server** (not a bug in your React code).

1. **Use tunnel mode** (works across networks / strict Wi‑Fi):
   ```bash
   npm run start:tunnel
   ```
   Wait until you see `Tunnel ready`, then scan the new QR code.

2. **Same Wi‑Fi** — phone and Mac on the same network (not guest Wi‑Fi).

3. **Update Expo Go** from the Play Store (this project uses **Expo SDK 56**).

4. **Mac firewall** — System Settings → Network → Firewall → allow **Node** / terminal incoming connections, or temporarily disable firewall to test.

5. **No VPN** on phone or Mac while testing.

6. **Clear Expo Go cache** — Expo Go → profile → Clear cache, then scan again.

7. **Manual URL** — in Expo Go, enter: `exp://YOUR_MAC_IP:8081` (IP from `ipconfig getifaddr en0`).

Do **not** add a fake `extra.eas.projectId` until you run `eas build:configure`.

## Customize branding assets

Replace placeholder images in `assets/`:

| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | Store listing & launcher |
| `splash-icon.png` | ~400×400 transparent PNG | Splash center logo |
| `android-icon-foreground.png` | 1024×1024 | Adaptive icon foreground |

Recommended splash: gold car icon on transparent PNG; `app.json` uses background `#141414` (site primary black).

## Build APK (testing / sideload)

1. Log in: `eas login`
2. Configure project: `eas build:configure` (creates/links EAS project; updates `app.json` `extra.eas.projectId`)
3. Build APK:

```bash
cd mobile-app
eas build -p android --profile preview
```

Download the `.apk` from the Expo dashboard when the build finishes.

## Build AAB for Google Play Store

1. **Create a Google Play Console app**  
   - Package name must match: `com.kaar.rentals` (see `app.json`)
2. **Production build (Android App Bundle):**

```bash
eas build -p android --profile production
```

3. **Submit** (optional, after adding a Play service account JSON):

```bash
eas submit -p android --profile production
```

Or upload the `.aab` manually in Play Console → **Release** → **Production**.

### Play Store checklist

- [ ] Privacy policy URL (e.g. `https://kaar.rentals/privacy-policy`)
- [ ] App screenshots (phone + optional tablet)
- [ ] Short & full description
- [ ] Content rating questionnaire
- [ ] Target API level (EAS uses current Expo defaults)
- [ ] Signing: EAS manages keystore on first build (save credentials in Expo dashboard)

### Version bumps

- `app.json` → `expo.version` (user-facing, e.g. `1.0.1`)
- EAS `production` profile uses `autoIncrement` for `versionCode`

## Configuration

| Setting | File | Default |
|---------|------|---------|
| Website URL | `src/config/constants.ts` | `https://kaar.rentals` |
| WhatsApp | `src/config/constants.ts` | `+923245793350` |
| Android package | `app.json` | `com.kaar.rentals` |

## How it matches the website

- **Colors**: Black `#141414`, gold accent `#E8B117`, white background (from `frontend/src/index.css`)
- **Font**: Inter via `@expo-google-fonts/inter`
- **Header**: Car icon + “Kaar.Rentals” like the site header
- **Tabs**: Home `/`, Browse Cars `/cars`, Profile `/profile/me`
- **WebView**: Injected CSS hides fixed site header/footer; native header + tab bar remain

## Troubleshooting

- **Blank WebView**: Ensure device has internet; confirm `https://kaar.rentals` is live.
- **Login/session**: `sharedCookiesEnabled` keeps auth across tabs.
- **WhatsApp opens twice**: External `wa.me` links are opened in the WhatsApp app; the FAB uses the same number.

## License

Private — Kaar.Rentals.
