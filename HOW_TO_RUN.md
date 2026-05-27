# SafeScan — How to Run

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 or 20 LTS | https://nodejs.org |
| Expo Go app | Latest | App Store / Google Play |

You do **not** need Xcode, Android Studio, or any simulator to get started.

---

## Step 1 — Extract the zip

```bash
unzip safescan-v2.zip
cd safescan2
```

---

## Step 2 — Install dependencies

```bash
npm install
```

---

## Step 3 — Start the dev server

```bash
npx expo start
```

You will see a **QR code** in the terminal.

---

## Step 4 — Open on your phone

### iPhone
1. Open the built-in **Camera** app
2. Point it at the QR code
3. Tap the "Open in Expo Go" banner

### Android
1. Open the **Expo Go** app
2. Tap **"Scan QR code"**
3. Point at the QR code

The app will load in ~10–30 seconds on first launch (JavaScript bundle compiles).

---

## Troubleshooting

### "Network response timed out" in Expo Go
Your phone and computer must be on the **same Wi-Fi network**.  
If they are and it still fails, run:
```bash
npx expo start --tunnel
```
This routes through Expo's servers and bypasses local network issues. Install `@expo/ngrok` if prompted.

### Metro bundler won't start
```bash
npx expo start --clear
```

### "Module not found" error
```bash
npm install
npx expo start --clear
```

### Camera doesn't appear / black screen
- Camera only works on a **real device** (not a browser or most simulators)
- The app will show a permission request on first use — tap **Allow**

---

## Features

| Tab | What it does |
|-----|-------------|
| 📁 Library | All your saved PDFs — tap to view/share/delete |
| ⚡ FAB button (center) | Opens camera scanner |
| 🔧 Tools | Photos→PDF, Import PDF, Compress PDF |
| ⚙️ Settings | Storage info, delete all |

### Scanning flow
1. Tap the **center teal button**
2. Point camera at document → tap shutter
3. Add more pages or tap ✓ to finish
4. Choose name, filter (B&W / Enhance), quality
5. Tap **Save as PDF** → appears in Library

### Share a PDF
- Library → tap document → **Share / Open In…**
- Opens native share sheet → Files, AirDrop, email, etc.

---

## Build for production (optional)

```bash
npm install -g eas-cli
eas login
eas build --platform ios      # or android
```

Requires an Expo account (free).
