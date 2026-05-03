# GlosserAI

A swipeable flashcard app for learning technical vocabulary — built for engineers, students, and anyone trying to keep up with the fast-moving stacks of modern software.

Categories cover **AI/ML, Agentic AI, Backend, Frontend, DevOps, Cloud, Databases, and Security**, with new terms curated weekly from real industry signals.

## What it does

- **Swipe to learn.** Tinder-style cards with gesture-based ratings (know it / unsure / learning).
- **Spaced repetition.** An SM-2 scheduler resurfaces cards at the right time so review effort stays low and retention stays high.
- **Smart decks.** Custom blends of due reviews, weakest categories, and fresh interleaves — one tap on the deck-clear screen.
- **Weekly fresh vocab.** New terms are drafted by an AI pipeline from trending sources, reviewed by humans, and shipped to users without an app update.
- **Progress, quizzes, widgets.** Track streaks and accuracy, run quick quizzes, and pin a vocab widget to your Android home screen.
- **Works fully offline.** No account required — sign in only if you want sync across devices.

## Tech

Expo + React Native · TypeScript · Zustand · expo-router · React Native Paper (MD3) · Firebase (optional, for auth and sync) · Jest

## Project layout

```
app/            expo-router screens (tabs, auth)
components/    presentational components (cards, widgets)
services/      core logic — spaced repetition, decks, vocab sync, auth
stores/        Zustand state (user, vocab, settings, widgets)
data/          seed vocabulary
widgets/       Android home-screen widget
docs/legal/    privacy policy + terms of service
```

## Authentication

Three modes, picked based on what's configured:

| Mode             | Data lives                |
| ---------------- | ------------------------- |
| Guest            | On-device only            |
| Email + password | Firebase Auth + Firestore |
| Google sign-in   | Firebase Auth + Firestore |

Guest mode needs zero setup. Sign in to sync progress across devices.

## Status

Phase 1 — App Store readiness. Public release pending iOS / Android store review.

## License

Private. Not for redistribution.
