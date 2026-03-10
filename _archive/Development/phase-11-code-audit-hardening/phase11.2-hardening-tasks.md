# Phase 11.2 — Hardening Tasks

**Status:** READY FOR IMPLEMENTATION
**Estimated Effort:** 2-3 days
**Priority:** Complete before App Store submission

---

## Priority 1: CRITICAL (Before Production)

### Task 1.1: Move Firebase Config to Environment Variables
**Effort:** 1 hour
**Files:** `src/config/firebase.js`, `app.config.js`, `.env`

- [ ] Create `.env` file with Firebase config
- [ ] Update `app.config.js` to use `process.env`
- [ ] Update `firebase.js` to use `expo-constants`
- [ ] Add `.env` to `.gitignore`
- [ ] Document env setup in README

```javascript
// app.config.js
export default {
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    // ...
  }
};
```

---

### Task 1.2: Implement Secure Storage
**Effort:** 2 hours
**Files:** New `src/services/SecureStorageService.js`, update contexts

- [ ] Install `expo-secure-store`
- [ ] Create `SecureStorageService.js` wrapper
- [ ] Migrate `UserProfileContext` to use SecureStore
- [ ] Migrate `ActivityContext` stats to SecureStore
- [ ] Keep cache-only data in AsyncStorage
- [ ] Test on both iOS and Android

```javascript
// src/services/SecureStorageService.js
import * as SecureStore from 'expo-secure-store';

export const saveSecure = async (key, value) => {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
};

export const getSecure = async (key) => {
  const value = await SecureStore.getItemAsync(key);
  return value ? JSON.parse(value) : null;
};

export const deleteSecure = async (key) => {
  await SecureStore.deleteItemAsync(key);
};
```

---

### Task 1.3: Add Error Handling to All Async Operations
**Effort:** 2 hours
**Files:** All screens with `useFocusEffect` or data loading

- [ ] `ShopScreen.js` - add try/catch and error state
- [ ] `HomeScreen.js` - add try/catch and error state
- [ ] `InventoryScreen.js` - add try/catch and error state
- [ ] `SettingsScreen.js` - add try/catch and error state
- [ ] `WorkoutsScreen.js` - add try/catch and error state
- [ ] Create reusable `ErrorBanner` component
- [ ] Test error scenarios

---

### Task 1.4: Remove/Gate Console Logs
**Effort:** 1 hour
**Files:** 32 files with console statements

- [ ] Create `src/services/LoggerService.js`
- [ ] Replace all `console.log` with Logger calls
- [ ] Gate logs to development only using `__DEV__`
- [ ] Remove any logs containing user data
- [ ] Keep `console.error` for actual errors

```javascript
// src/services/LoggerService.js
const Logger = {
  debug: (...args) => {
    if (__DEV__) console.log('[DEBUG]', ...args);
  },
  warn: (...args) => {
    if (__DEV__) console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
    // TODO: Send to crash reporting service
  },
};

export default Logger;
```

---

### Task 1.5: Verify Firestore Security Rules
**Effort:** 30 minutes
**Location:** Firebase Console

- [ ] Open Firebase Console → Firestore → Rules
- [ ] Verify auth required for all operations
- [ ] Verify user can only access own documents
- [ ] Test rules with Firebase Emulator
- [ ] Document rules in codebase

---

## Priority 2: HIGH (Before v1.0.1)

### Task 2.1: Extract Navigation Styling Constants
**Effort:** 30 minutes
**Files:** `src/navigation/MainTabNavigator.js`, `src/navigation/AuthNavigator.js`

- [ ] Create `src/config/NavigationTheme.js`
- [ ] Extract header options to constants
- [ ] Update all stack navigators to use constants
- [ ] Verify styling still works

```javascript
// src/config/NavigationTheme.js
export const WARM_HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#FFF8F0' },
  headerTintColor: '#4A3728',
  headerTitleStyle: { color: '#4A3728', fontWeight: '600' },
  headerShadowVisible: false,
};
```

---

### Task 2.2: Add Bounds Checking for Array Access
**Effort:** 30 minutes
**Files:** `src/screens/Workout/WorkoutPlayerScreen.js`

- [ ] Add guard before `workout.exercises[index]` access
- [ ] Handle edge case of empty exercises array
- [ ] Add error recovery if index is invalid

---

### Task 2.3: Fix AppState Listener Re-subscription
**Effort:** 30 minutes
**Files:** `src/screens/Workout/WorkoutPlayerScreen.js`

- [ ] Remove `playerState` from useEffect dependencies
- [ ] Use `useRef` for values needed in handler
- [ ] Test workout pause/resume still works

---

### Task 2.4: Add useMemo for Expensive Computations
**Effort:** 1 hour
**Files:** `src/screens/Home/HomeScreen.js`, `src/context/ActivityContext.js`

- [ ] Wrap `getTodaysExercise` with useMemo
- [ ] Wrap date comparisons with useMemo
- [ ] Profile with React DevTools to verify improvement

---

## Priority 3: MEDIUM (v1.1)

### Task 3.1: Add Error Boundary Component
**Effort:** 1 hour
**Files:** New `src/components/ErrorBoundary.js`

- [ ] Create ErrorBoundary class component
- [ ] Wrap main app with ErrorBoundary
- [ ] Show friendly error screen on crash
- [ ] Add "Try Again" button

---

### Task 3.2: Set Up ESLint and Prettier
**Effort:** 1 hour
**Files:** `.eslintrc.js`, `.prettierrc`, `package.json`

- [ ] Install dev dependencies
- [ ] Configure ESLint rules
- [ ] Configure Prettier
- [ ] Add npm scripts for linting
- [ ] Fix any existing lint errors

---

### Task 3.3: Add Basic Unit Tests
**Effort:** 4 hours
**Files:** New `__tests__/` directory

- [ ] Install Jest and Testing Library
- [ ] Write tests for `ActivityService`
- [ ] Write tests for `ShopService`
- [ ] Write tests for `JournalService`
- [ ] Add test npm script
- [ ] Set up CI to run tests

---

### Task 3.4: Optimize Context Re-renders
**Effort:** 2 hours
**Files:** All context providers

- [ ] Install `use-context-selector` or similar
- [ ] Update contexts to use selectors
- [ ] Profile with React DevTools
- [ ] Consider splitting large contexts

---

## Priority 4: LOW (v2.0)

### Task 4.1: Migrate to TypeScript
**Effort:** 8-16 hours
**Files:** Entire codebase

- [ ] Add TypeScript dependencies
- [ ] Create tsconfig.json
- [ ] Convert files incrementally (start with models)
- [ ] Add type definitions for services
- [ ] Add type definitions for contexts

---

### Task 4.2: Add Crash Reporting
**Effort:** 2 hours
**Files:** `App.js`, Logger service

- [ ] Install Sentry or similar
- [ ] Configure for React Native
- [ ] Update Logger to send errors
- [ ] Test crash reporting works

---

### Task 4.3: Add E2E Tests
**Effort:** 8 hours
**Files:** New `e2e/` directory

- [ ] Install Detox
- [ ] Write test for onboarding flow
- [ ] Write test for daily check-in
- [ ] Write test for shop purchase
- [ ] Add to CI pipeline

---

## Verification Checklist

After completing Priority 1 tasks:

- [ ] App builds without warnings
- [ ] No console.log statements in production build
- [ ] Firebase config not visible in source
- [ ] Sensitive data stored securely
- [ ] Error states shown to user on failures
- [ ] Firestore rules verified
- [ ] Test on both iOS and Android

---

## Files Changed Summary

| Task | Files Modified |
|------|----------------|
| 1.1 Firebase Config | firebase.js, app.config.js, .env |
| 1.2 Secure Storage | SecureStorageService.js, UserProfileContext.js, ActivityContext.js |
| 1.3 Error Handling | ShopScreen.js, HomeScreen.js, InventoryScreen.js, SettingsScreen.js |
| 1.4 Logger | LoggerService.js, 32 files with console.log |
| 2.1 Navigation Theme | NavigationTheme.js, MainTabNavigator.js, AuthNavigator.js |
| 2.2-2.4 Fixes | WorkoutPlayerScreen.js, HomeScreen.js |
