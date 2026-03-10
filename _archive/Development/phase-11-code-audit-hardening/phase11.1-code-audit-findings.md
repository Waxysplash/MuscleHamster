# Phase 11.1 — Code Audit Findings

**Status:** AUDIT COMPLETE
**Date:** Feb 25, 2026
**Scope:** MuscleHamsterExpo codebase (React Native/Expo)

---

## Executive Summary

The MuscleHamsterExpo codebase demonstrates **solid fundamentals** with good React Native practices, proper state management, and clean architecture. The main issues are around **production readiness** (logging, config management, error handling) rather than fundamental flaws.

| Category | Rating | Notes |
|----------|--------|-------|
| **Code Quality** | 🟢 GOOD | Well-structured, minor maintainability improvements needed |
| **Security Posture** | 🟡 MEDIUM | Good foundations, needs hardening for production |
| **Performance** | 🟢 GOOD | Minor optimizations available |
| **Production Readiness** | 🟡 MEDIUM | Address critical issues before launch |

**Estimated effort to address critical issues:** 2-3 days

---

## 1. CRITICAL SECURITY ISSUES

### 🔴 Issue 1.1: Firebase Config in Source Code
**Location:** `src/config/firebase.js:14-20`
**Severity:** Critical
**Risk:** Config visible in source control

```javascript
// Current (exposed)
const firebaseConfig = {
  apiKey: "AIzaSyD1_pzaBmy3DBNoAGNdVmE_hzJ4wjgMu_o",
  authDomain: "muscle-hamster.firebaseapp.com",
  projectId: "muscle-hamster",
  ...
};
```

**Fix Required:**
- Move to `app.config.js` with environment variables
- Use `expo-constants` for runtime config
- Add `.env` to `.gitignore`

---

### 🔴 Issue 1.2: AsyncStorage Stores Unencrypted User Data
**Location:** `src/context/UserProfileContext.js:298`
**Severity:** Critical
**Risk:** User data readable on Android (world-readable storage)

```javascript
// Current (unencrypted)
await AsyncStorage.setItem(profileKey, JSON.stringify(profileWithTimestamp));
```

**Fix Required:**
- Install `expo-secure-store`
- Migrate sensitive data (profile, stats, inventory) to SecureStore
- Keep only cache/non-sensitive data in AsyncStorage

---

### 🟡 Issue 1.3: Google OAuth Client ID Exposed
**Location:** `src/services/SocialAuthService.js:36`
**Severity:** High

```javascript
const GOOGLE_WEB_CLIENT_ID = '783320940502-o8h2fs...';
```

**Fix Required:**
- Move to app.config.js environment variables

---

## 2. CODE QUALITY ISSUES

### 🟡 Issue 2.1: Missing Error Handling in Async Operations
**Location:** `src/screens/Shop/ShopScreen.js:35-37`, multiple screens
**Severity:** High

```javascript
// Current (silent failure)
useFocusEffect(
  useCallback(() => {
    loadShopData();  // Not awaited, errors silently fail
  }, [])
);
```

**Fix Required:**
```javascript
useFocusEffect(
  useCallback(() => {
    const load = async () => {
      try {
        await loadShopData();
      } catch (error) {
        setError(error.message);
      }
    };
    load();
  }, [])
);
```

**Affected Files:**
- `ShopScreen.js`
- `HomeScreen.js`
- `InventoryScreen.js`
- `SettingsScreen.js`

---

### 🟡 Issue 2.2: Excessive Console Logs (145+ occurrences)
**Location:** 32 files across codebase
**Severity:** High

```javascript
// Example from UserProfileContext.js:85-86
console.log('=== LOADING PROFILE ===');
console.log('User ID:', userId);  // Security risk!
```

**Fix Required:**
- Create a Logger service that gates logs by environment
- Remove all `console.log` calls with user data
- Use `console.warn/error` only for actual errors

---

### 🟡 Issue 2.3: Race Conditions in State Updates
**Location:** `src/screens/Workout/WorkoutPlayerScreen.js:98-111`
**Severity:** Medium

```javascript
// Multiple state updates in rapid succession
setExercisesCompleted(completed);
setCurrentExerciseIndex(nextIndex);
setTimeRemaining(workout.exercises[nextIndex].duration);
progressAnim.setValue(0);
```

**Fix Required:**
- Use `useReducer` for complex state transitions
- Combine related state into single update

---

### 🟠 Issue 2.4: Duplicate Navigation Styling
**Location:** `src/navigation/MainTabNavigator.js` (5 locations)
**Severity:** Low

```javascript
// Repeated 5 times
screenOptions={{
  headerStyle: { backgroundColor: '#FFF8F0' },
  headerTintColor: '#4A3728',
  headerTitleStyle: { color: '#4A3728', fontWeight: '600' },
  headerShadowVisible: false,
}}
```

**Fix Required:**
```javascript
// Extract to constant
const HEADER_OPTIONS = {
  headerStyle: { backgroundColor: '#FFF8F0' },
  headerTintColor: '#4A3728',
  headerTitleStyle: { color: '#4A3728', fontWeight: '600' },
  headerShadowVisible: false,
};

// Use: screenOptions={HEADER_OPTIONS}
```

---

## 3. PERFORMANCE ISSUES

### 🟡 Issue 3.1: Context Cascade Re-renders
**Location:** `App.js:47-66`
**Severity:** High

```javascript
// 6 nested providers - any update cascades
<AuthProvider>
  <UserProfileProvider>
    <ActivityProvider>
      <InventoryProvider>
        <FriendProvider>
          <NotificationProvider>
```

**Fix Options:**
1. Use context selectors (`use-context-selector` library)
2. Split providers by feature (lazy load non-essential)
3. Consider Zustand for simpler state management

---

### 🟡 Issue 3.2: Missing useMemo for Expensive Computations
**Location:** `src/screens/Home/HomeScreen.js:54-55`
**Severity:** Medium

```javascript
// Recalculates every render
const todaysExercise = getTodaysExercise(currentUser?.uid || 'guest');
```

**Fix Required:**
```javascript
const todaysExercise = useMemo(
  () => getTodaysExercise(currentUser?.uid || 'guest'),
  [currentUser?.uid]
);
```

---

### 🟡 Issue 3.3: Array Access Without Bounds Checking
**Location:** `src/screens/Workout/WorkoutPlayerScreen.js:45-46`
**Severity:** Medium

```javascript
// Could crash if index out of bounds
const currentExercise = workout.exercises[currentExerciseIndex];
```

**Fix Required:**
```javascript
if (currentExerciseIndex >= workout.exercises.length) {
  return null; // or handle gracefully
}
const currentExercise = workout.exercises[currentExerciseIndex];
```

---

## 4. MEMORY LEAK RISKS

### 🟡 Issue 4.1: AppState Listener Re-subscription
**Location:** `src/screens/Workout/WorkoutPlayerScreen.js:54-58`
**Severity:** Medium

```javascript
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription?.remove();
}, [playerState]); // playerState causes re-subscription
```

**Fix Required:**
- Remove `playerState` from dependency array
- Use `useRef` for values needed in handler

---

## 5. MISSING INFRASTRUCTURE

### Issue 5.1: No Testing Framework
**Status:** Missing
**Impact:** No automated regression testing

**Required:**
```json
"devDependencies": {
  "jest": "^29.0.0",
  "@testing-library/react-native": "^12.0.0"
}
```

---

### Issue 5.2: No Linting/Formatting
**Status:** Missing
**Impact:** Inconsistent code style

**Required:**
```json
"devDependencies": {
  "eslint": "^8.0.0",
  "prettier": "^3.0.0",
  "@typescript-eslint/parser": "^6.0.0"
}
```

---

### Issue 5.3: No TypeScript
**Status:** Missing
**Impact:** No compile-time type checking

**Recommendation:** Consider migration for long-term maintainability

---

## 6. INPUT VALIDATION SUMMARY

| Field | Current Validation | Status |
|-------|-------------------|--------|
| Email | Regex pattern | ✅ Good |
| Password | Length >= 8 | ✅ Good |
| Hamster Name | Length <= 30, charset | ✅ Good |
| Age | Range 13-120 | ✅ Good |
| Points | Type number | ⚠️ No range check |
| Exercise duration | Not validated | ❌ Missing |

---

## 7. POSITIVE FINDINGS

### Architecture
- ✅ Clean separation of concerns (services, contexts, screens)
- ✅ Proper async/await usage throughout
- ✅ Good use of Firebase modern SDK (modular imports)
- ✅ Proper navigation structure with multiple stacks
- ✅ Feature flags system for toggling features

### Security Strengths
- ✅ Uses Firebase for auth (secure by default)
- ✅ Proper nonce usage in Apple Sign-In
- ✅ HTTPS enforced by Firebase
- ✅ No XSS vectors (React Native, not web)
- ✅ No SQL injection (Firestore)

### UX Strengths
- ✅ Proper loading states
- ✅ Friendly error messages (hamster-themed)
- ✅ Accessible navigation structure
- ✅ Good use of refresh controls

---

## 8. FIRESTORE SECURITY RULES

**Status:** Cannot verify from codebase - rules are on Firebase console

**Required Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /userStats/{statId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    match /inventory/{itemId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

**Action Required:** Verify these rules are in place on Firebase console

---

## Next Steps

See `phase11.2-hardening-tasks.md` for the implementation checklist.
