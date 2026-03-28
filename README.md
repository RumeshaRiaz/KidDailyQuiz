# Kids Daily Quiz — React Native App

A beautiful, professional educational quiz app for children aged 6-10.
Built with React Native + Expo.

---

## Features
- 4 subjects: Math, Science, English, General Knowledge
- 20 questions per subject (randomized each game)
- Daily Challenge mode (mixed subjects)
- 20-second countdown timer per question
- Star rewards system
- Day streak tracking
- Best score saved per subject
- Beautiful animations & transitions
- Ads-ready (add AdMob later)

---

## Setup Instructions

### Step 1 — Install Node.js
Download from: https://nodejs.org (LTS version)

### Step 2 — Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 3 — Install dependencies
```bash
cd KidsQuiz
npm install
```

### Step 4 — Run the app
```bash
npx expo start
```

Then:
- Press `a` → Run on Android emulator
- Press `i` → Run on iOS simulator (Mac only)
- Scan QR code → Run on your phone via Expo Go app

---

## Project Structure
```
KidsQuiz/
├── App.jsx                    # Navigation root
├── app.json                   # Expo config
├── package.json               # Dependencies
├── src/
│   ├── screens/
│   │   ├── HomeScreen.jsx     # Dashboard, subject picker
│   │   ├── QuizScreen.jsx     # Quiz gameplay
│   │   └── ResultScreen.jsx   # Score + stars result
│   ├── data/
│   │   └── questions.js       # 80 questions (4 subjects × 20)
│   └── utils/
│       ├── theme.js           # Colors, sizes, subjects config
│       └── storage.js         # AsyncStorage helpers
└── assets/                    # App icons & splash screen
```

---

## Monetization (After Launch)

### Ads (Free tier)
1. Create account at: https://admob.google.com
2. Install: `npx expo install react-native-google-mobile-ads`
3. Add banner ad in HomeScreen bottom
4. Add interstitial ad between quiz sessions

### Subscription (Premium tier)
1. Use RevenueCat: https://revenuecat.com
2. Free: 5 questions/day, with ads
3. Premium $2.99/month: Unlimited, no ads

---

## Publishing to Stores

### Google Play Store
```bash
npx expo build:android
```
Upload the .apk to: https://play.google.com/console

### Apple App Store
```bash
npx expo build:ios
```
Upload via Xcode or Transporter to App Store Connect.

---

## Customization Tips
- Add more questions in `src/data/questions.js`
- Change colors in `src/utils/theme.js`
- Add new subjects by expanding `SUBJECTS` array in theme.js
- Adjust timer (default 20s) in QuizScreen.jsx line: `const QUESTION_TIME = 20`

---

Made with React Native + Expo
