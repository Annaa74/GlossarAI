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
app/                  # expo-router screens (file-based routing)
  (tabs)/             #   home, progress, quiz, widgets, profile
  auth/               #   login, signup
components/           # presentational components (SwipeCard, Widget, ...)
constants/            # theme + categories
data/                 # static seed + growth-pool vocabulary
hooks/                # useVocabulary, useSpacedRepetition, useGoogleAuth, ...
services/             # business logic
                      #   - srs            SM-2 spaced repetition
                      #   - growthEngine   weekly local-pool release
                      #   - deckComposer   smart deck blend (R1)
                      #   - vocabManifest  remote vocab fetch (Layer 1)
                      #   - auth           Firebase auth + account deletion
                      #   - vocabulary     Firestore CRUD
                      #   - notifications  expo-notifications wrapper
stores/               # Zustand stores (user, vocab, settings, growth, widgets)
widgets/              # Android home-screen widget (react-native-android-widget)
types/                # shared TypeScript types
utils/                # pure helpers
__tests__/            # Jest unit tests for pure-logic modules

docs/legal/           # Privacy Policy + Terms of Service (host on GitHub Pages)
scripts/              # CI/automation scripts (e.g. weekly Claude-curated vocab)
.github/workflows/    # GitHub Actions: ci.yml, vocab-trending.yml

vocab.json            # Layer 1 manifest — bumping `version` ships terms to users
firestore.rules       # Production Firestore security rules
firebase.json         # Firebase CLI config
.firebaserc           # Pinned Firebase project ID
eas.json              # EAS Build profiles (development / preview / production)
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

The app runs fully offline in **guest mode** with zero configuration. The variables below are only needed for the features they unlock.

```bash
cp .env.example .env
# fill in the values you want, then restart the Expo dev server
```

| Env var                                    | Required for                                                            | Where to get it                                                                                           |
| ------------------------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | Email/password + Google sign-in, cloud sync                             | Firebase Console → Project settings → Your apps → Web app config                                          |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | "                                                                       | Same                                                                                                      |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | "                                                                       | Same                                                                                                      |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | "                                                                       | Same                                                                                                      |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | "                                                                       | Same                                                                                                      |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | "                                                                       | Same                                                                                                      |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`     | "Continue with Google" on Android (custom dev build only — not Expo Go) | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 client ID (Android)                      |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`         | Same on web / fallback                                                  | Auto-created when you enable Google sign-in in Firebase Console                                           |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`         | Same on iOS                                                             | Google Cloud Console (iOS OAuth client)                                                                   |
| `EXPO_PUBLIC_VOCAB_MANIFEST_URL`           | Layer 1 freshness pipeline (remote vocab)                               | A stable URL hosting `vocab.json` — recommended `raw.githubusercontent.com/<user>/<repo>/main/vocab.json` |
| `EXPO_PUBLIC_PROJECT_ID`                   | Push notification tokens (dev builds only)                              | Expo dashboard → Project settings                                                                         |

`.env` is gitignored. Never commit it.

### GitHub Actions secrets

For the weekly AI-curated vocab pipeline (`.github/workflows/vocab-trending.yml`):

| Secret              | Purpose                                             | Where to get it                                                        |
| ------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Calling Claude to generate trending term candidates | https://console.anthropic.com → keys (set a budget cap, e.g. $5/month) |

Add it under **Repo Settings → Secrets and variables → Actions → New repository secret**.

### One-time Firebase setup

1. Create a project at https://console.firebase.google.com (disable Analytics).
2. **Authentication → Sign-in method**: enable Email/Password.
3. **Firestore Database → Create database** (test mode is fine to start; deploy `firestore.rules` before going public).
4. **Project settings → Your apps → `</>` (Web)**: register an app, copy the config object into `.env`.
5. Restart the Expo dev server with `npm start`.

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

## Vocab freshness workflow

Once `vocab.json` is in the repo and `EXPO_PUBLIC_VOCAB_MANIFEST_URL` points at its raw URL, vocab updates ship without an app release. The full loop:

```
┌──────────────────────────┐
│ Mondays 14:00 UTC        │
│ vocab-trending.yml       │  Action calls Claude with HN + ArXiv signals.
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐  Appends candidates to vocab.json with
│ Auto-PR opened           │  approved=false. version is NOT bumped.
└────────────┬─────────────┘
             │  ← human review, edits, flips approved=true
             ▼
┌──────────────────────────┐  Reviewer bumps `version` field, merges PR.
│ Merge to main            │
└────────────┬─────────────┘
             │  raw URL now serves the new manifest version
             ▼
┌──────────────────────────┐  syncRemoteVocab() sees newer version,
│ App on user's device     │  merges only `approved: true` terms into deck.
│ — next launch            │  Cached locally for offline.
└──────────────────────────┘
```

You can also commit terms manually — same flow, just skip the PR step. **A version bump is what publishes**, not the merge.

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
