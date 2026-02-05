# Phase 00.1 — MVP Definition and Scope

## Header
- **Goal:** Define what “MVP” means for Muscle Hamster and what is explicitly not included yet.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** None
- **Platforms:** iOS (15+)

---

## Overview

### Current State
- ✅ PRD exists
- ❌ Implementation plan needs to be executed in feature-based phases

### Problem / Motivation
We need a crisp MVP boundary so implementation stays focused and the core loop can ship without being diluted by social, monetization, and long-horizon personalization.

### MVP Goal
A first, shippable iOS experience where a user can create an account, onboard, complete workouts (or rest-day check-ins), earn/spend points to customize their hamster, maintain a streak, and receive gentle reminders—**without guilt-based messaging**.

### In Scope (MVP)
- Accounts + age gate (13+)
- Onboarding (profile preferences, schedule preference, hamster naming)
- Home loop (hamster display + state, streak, “today” status, quick actions)
- Workout library + guided workout player + completion rewards
- Points economy + shop + inventory + customization
- Rest-day micro-tasks + daily check-in mechanic
- Streak system + streak freeze recovery flow
- Settings (schedule edits, audio toggles, notification preferences)
- Push notifications (basic) with hamster tone
- Sound/music support with mute controls (basic)

### Out of Scope (Post-MVP)
- Friends/social features (add friends, friend streaks, viewing friends’ hamsters)
- Ads (banner/interstitial/rewarded video) and monetization tuning
- “ML-powered” recommendations beyond a simple, rules-based recommendation v0
- Formal data export flows and advanced privacy tooling beyond basic account controls
- Android app
- Offline-first support beyond reasonable caching (future phase)

### Assumptions
- iOS-only for MVP (iOS 15+).
- Art/sound assets can be stubbed initially and swapped later without changing behavior.
- “Recommendation engine” starts rules-based and becomes more sophisticated after activity history exists.

---

## Deliverables
- Written MVP boundary (this document) that is used as the scoping reference for subsequent phases.

