# GlosserAI

A swipeable flashcard app for technical vocabulary across AI/ML, Agentic AI, Backend, Frontend, DevOps, Cloud, Databases, and Security.

Built with Expo + React Native, TypeScript, Zustand for state, and an SM-2 spaced-repetition algorithm. Works fully offline; Firebase is optional for cross-device sync.

## Quick start

```bash
npm install --legacy-peer-deps
npm start
```

Scan the QR with Expo Go on your phone. Tap **Continue as guest** on the landing screen, then **Load Vocabulary**.

## Scripts

| Script              | Purpose                                     |
| ------------------- | ------------------------------------------- |
| `npm start`         | Start the Expo dev server                   |
| `npm run android`   | Open in Android emulator / connected device |
| `npm run ios`       | Open in iOS simulator                       |
| `npm run typecheck` | Run TypeScript without emitting             |
| `npm run lint`      | ESLint on the whole project                 |
| `npm run lint:fix`  | ESLint with `--fix`                         |
| `npm run format`    | Prettier on the whole project               |
| `npm run test`      | Jest unit tests                             |
| `npm run test:ci`   | Jest in CI mode with coverage               |

## Project layout

```
app/                # expo-router screens (file-based routing)
  (tabs)/           #   home, progress, quiz, widgets, profile
  auth/             #   login, signup
components/         # presentational components (SwipeCard, Widget, ...)
constants/          # theme + categories
data/               # static seed + growth-pool vocabulary
hooks/              # useVocabulary, useSpacedRepetition, useWordOfTheDay, ...
services/           # business logic (srs, growthEngine, auth, vocabulary, notifications)
stores/             # Zustand stores (user, vocab, settings, growth, widgets)
types/              # shared TypeScript types
utils/              # pure helpers
__tests__/          # Jest unit tests
```

## Architecture

- **Offline-first.** Every screen renders from `AsyncStorage`-persisted Zustand stores. Firebase calls are skipped in guest mode and short-circuited when the local store is already populated.
- **Spaced repetition.** `services/srs.ts` implements SM-2 with adapter functions mapping swipe gestures (`left`/`right`/`up`) to quality ratings.
- **Weekly growth engine.** `services/growthEngine.ts` runs once on app launch; if a week has elapsed it releases the next batch of held-back terms from `data/growthPool.ts` into the active deck.
- **Smart deck composer (R1).** `services/deckComposer.ts` blends 60% due-for-review + 25% weakest-category + 15% interleave when the user taps **SMART DECK** on the deck-clear screen. New users with no progress fall back to a plain shuffle.
- **Vocab freshness pipeline.**
  - **Layer 1** (`services/vocabManifest.ts`) — fetches `vocab.json` from `EXPO_PUBLIC_VOCAB_MANIFEST_URL` on launch; merges any new approved terms with version > last-applied. Runs offline-safe (no-op if URL unset, fails closed if network is down).
  - **Layer 3** (`.github/workflows/vocab-trending.yml`) — weekly GitHub Action calls Claude with HN + ArXiv signals, appends candidate terms (`approved: false`) to `vocab.json`, opens a PR for human review. Merging the PR + bumping `version` is what publishes to users.
- **Theme.** Light/dark via `react-native-paper` MD3 themes. Default is dark; toggle via Profile → Theme. A `useThemedColors()` hook in `constants/theme.ts` centralizes color access.
- **Widgets.** A pluggable widget system (`stores/widgetStore.ts` + `components/Widget.tsx`) with multiple widget types and per-user enable/size/order persistence.

## Configuration

All optional — the app runs fully offline without any of these.

1. Copy `.env.example` to `.env` and fill in your Firebase project values.
2. Restart the Expo dev server.

## Authentication

Three modes, picked automatically based on what's configured:

| Mode                 | Requirements                                                | Where data lives           |
| -------------------- | ----------------------------------------------------------- | -------------------------- |
| **Guest**            | None — tap **Continue as guest** on the landing screen      | AsyncStorage on the device |
| **Email + password** | `EXPO_PUBLIC_FIREBASE_*` env vars set in `.env`             | Firebase Auth + Firestore  |
| **Google sign-in**   | Firebase env vars **plus** `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` | Firebase Auth + Firestore  |

When Firebase env vars are missing, the email/password and Google buttons will fail at submission time. Use guest mode to demo the app without any setup.

**Account lifecycle:**

- **Forgot password** — login screen → tap **FORGOT PASSWORD?** with your email filled in → Firebase emails a reset link.
- **Sign out** — Profile → **SIGN OUT** (preserves account, clears local session).
- **Delete account** — Profile → **DELETE ACCOUNT** → enter current password to confirm. Permanently deletes the Firebase Auth record AND the Firestore user document. Required by Apple App Store Guideline 5.1.1(v) for any app with sign-up.

The bottom tab bar is hidden on the unauthenticated landing screen and appears once the user signs in or continues as guest.

## Firestore security rules

Production rules live in `firestore.rules`. Apply via:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Or paste the file's contents into Firebase Console → Firestore → Rules → Publish.

What they enforce: owner-only read/write on `users/{uid}`; identity fields (`id`, `email`, `createdAt`) are immutable on update; default deny for any undocumented path.

## Legal docs

- `docs/legal/privacy-policy.md`
- `docs/legal/terms-of-service.md`

Both are required by Apple and Google for store submission. Host them on GitHub Pages, Vercel, or a Notion public page, then link the URLs in your store listing AND from the Profile screen's About section.

## Shipping to the stores

EAS Build config is in `eas.json`. Quick start:

```bash
npm install -g eas-cli
eas login
eas build:configure              # one-time
eas build --platform android --profile preview     # internal APK
eas build --platform ios --profile production      # TestFlight
eas submit --platform ios                          # App Store Connect
```

iOS submission requires an Apple Developer account ($99/year, ~24-72hr verification — start early). Android requires a Google Play Console account ($25 one-time + identity verification).

## Quality gates

Pre-commit (via Husky + lint-staged): ESLint + Prettier on staged files.

CI (`.github/workflows/ci.yml`) on every PR and main push:

- Prettier format check
- ESLint
- TypeScript typecheck
- Jest tests with coverage

## Testing

```bash
npm test              # one-off run
npm run test:watch    # watch mode for TDD
```

Tests live in `__tests__/`. Pure-logic modules (`srs`, `growthEngine`) have unit-test coverage. UI components are intentionally untested for now — they'd benefit from `@testing-library/react-native` once the design system stabilizes.

## Push notifications

`expo-notifications` is lazy-loaded and skipped in Expo Go (push was removed from Expo Go in SDK 53). To use real push you need a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

## License

Private. Not for redistribution.
