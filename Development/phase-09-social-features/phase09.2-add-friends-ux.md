# Phase 09.2 — Add Friends UX

**Goal:** Enable users to discover and add friends through username search, phone contacts import, and shareable invite links/QR codes.

**Status:** Planning
**Priority:** HIGH
**Dependencies:** Phase 09.1 (Friend Data Model and Service Layer)
**Platforms:** iOS 15+

---

## Overview

### Current State

- ✅ Social tab exists (placeholder)
- ✅ Friend data models and service exist (after 09.1)
- ❌ No UI for adding friends
- ❌ No username search
- ❌ No contacts import
- ❌ No invite link/QR sharing

### Problem / Motivation

Users need intuitive ways to find and connect with friends. Different users prefer different discovery methods — some know friends' usernames, some want to import from phone contacts, and some want to share a link or QR code in person or via messaging apps.

### Required Functionality

1. **Add Friends entry point** — Button/action from Social tab to access friend discovery
2. **Username search** — Search by username and send friend request
3. **Contacts import** — Request contacts permission, find matches, send requests
4. **Invite link sharing** — Generate shareable link to send via any app
5. **QR code sharing** — Display/scan QR code for in-person adding

---

## UX & Screens

### Add Friends Screen

Entry point from Social tab toolbar (plus icon or "Add Friends" button).

**Layout:**
- Header with welcoming message ("Find your friends!")
- Search bar for username search (at top, always visible)
- Three discovery method sections below:
  1. **From Contacts** — Card/button to import phone contacts
  2. **Share Invite Link** — Card/button to generate and share link
  3. **Scan QR Code** — Card/button to open QR scanner

**States:**
- Default (no search query)
- Searching (loading indicator)
- Search results (list of matching users)
- No results (friendly empty state)
- Error (retry option)

---

## Feature: Username Search

### Purpose
Allow users to find friends by their unique username.

### User Flow

1. User opens Add Friends screen
2. User types in search bar
3. After 300ms debounce, search executes
4. Results show matching users (profile picture placeholder, display name, username)
5. Each result shows:
   - User avatar/hamster preview
   - Display name
   - Username (@handle)
   - Relationship status button:
     - "Add" (not connected) → tapping sends request
     - "Pending" (request sent) → tapping cancels request
     - "Friends" (already connected) → disabled, shows checkmark
6. User taps "Add" to send friend request
7. Button changes to "Pending"
8. Confirmation feedback (brief toast or button animation)

### Search Behavior

- Minimum 2 characters to trigger search
- Case-insensitive matching
- Matches beginning of username preferentially, then contains
- Excludes blocked users (in both directions)
- Excludes self
- Results limited to reasonable count (e.g., 20)
- Empty query shows nothing (no "browse all users" for privacy)

### Edge Cases

- No matching users → friendly empty state: "No hamster friends found with that name. Try a different search!"
- Network error → error state with retry
- User types rapidly → debounce prevents excessive requests
- Blocked user searched → not shown in results
- User sends request, recipient blocks them → request auto-cancelled

---

## Feature: Contacts Import

### Purpose
Find friends who are already using the app by matching phone contacts.

### User Flow

1. User taps "From Contacts" section
2. If contacts permission not granted:
   - Show pre-permission explanation: "We'll only use your contacts to help you find friends who also use Muscle Hamster. We never store your contact details."
   - Show iOS permission prompt
   - If denied: show guidance to enable in Settings
3. If permission granted:
   - Loading state: "Looking for friends..."
   - Hash phone numbers locally (SHA-256 or similar)
   - Send hashes to backend for matching
   - Display matches (same UI as search results)
4. User can add any matched users

### Privacy Safeguards

- Phone numbers are hashed CLIENT-SIDE before transmission
- Raw phone numbers never leave the device
- Backend only receives and stores hashes
- Clear privacy explanation shown before permission request
- Users can revoke contacts access anytime (via iOS Settings)

### Matching Results Display

- Show matched users with:
  - Contact name from user's phone (local display only)
  - User's Muscle Hamster display name
  - User's hamster preview
  - Add/Pending/Friends button
- Sort by contact name alphabetically
- If contact has multiple phone numbers, any match counts

### Edge Cases

- No matches found → friendly message: "None of your contacts are on Muscle Hamster yet. Invite them!"
- Contacts permission denied → show guidance: "To find friends from contacts, enable access in Settings"
- Large contacts list → show loading progress, batch processing
- Contact matches blocked user → not shown

---

## Feature: Invite Link Sharing

### Purpose
Share a personal invite link via any messaging app, email, or social media.

### User Flow

1. User taps "Share Invite Link" section
2. App generates unique invite link for user (or retrieves existing one)
3. iOS share sheet opens with the link
4. Link format: Short URL with user's invite code
5. When recipient opens link:
   - If app installed: deep link opens app and auto-fills friend request
   - If app not installed: opens App Store, then handles link after install

### Link Content

The share message should include:
- Short, friendly text: "Join me on Muscle Hamster! Let's keep each other's hamsters happy. [link]"
- User can edit message before sharing

### Invite Link Behavior

- Each user has one persistent invite link (doesn't change)
- Link contains user's invite code (not user ID for privacy)
- Backend resolves invite code to user ID
- Opening own invite link: no-op (can't friend yourself)
- Invite link from blocked user: shows "This invite is no longer valid"

### Edge Cases

- Recipient already friends with sender → show "You're already friends with [Name]!"
- Recipient has pending request from sender → show request, allow accept
- Sender blocked recipient after sharing link → show "This invite is no longer valid"
- Link shared to non-iOS device → shows app store or "coming soon for Android" message

---

## Feature: QR Code Sharing

### Purpose
Add friends in person by scanning each other's QR codes.

### User Flow — Showing QR Code

1. User taps "Scan QR Code" section
2. Screen shows two tabs/options: "My Code" and "Scan"
3. "My Code" tab displays:
   - User's personal QR code (encodes their invite code)
   - Display name and username below QR
   - "Share" button to save/share QR as image
4. QR code can be scanned by another Muscle Hamster user

### User Flow — Scanning QR Code

1. User taps "Scan" tab
2. Camera permission requested if needed
3. Camera viewfinder opens with scanning frame
4. When valid QR code detected:
   - Show scanned user's profile preview
   - Show "Add Friend" button
   - User taps to send request
5. Confirmation: "Friend request sent to [Name]!"

### QR Code Content

- Encodes the same invite code as the invite link
- Uses standard QR format that resolves to a URL
- Scanning with any QR app opens the invite link (app or store)

### Edge Cases

- Invalid QR code (not Muscle Hamster) → "Hmm, that doesn't look like a Muscle Hamster code. Try another!"
- Own QR code scanned → "That's your code! Find a friend's code to scan."
- Camera permission denied → guidance to enable in Settings
- Low light conditions → hint to improve lighting
- Already friends with scanned user → "You're already friends with [Name]!"

---

## Friend Request Sending

### Request Flow (All Methods)

1. User initiates add (search result, contact match, invite link, QR scan)
2. Optimistic UI: button changes to "Pending" immediately
3. Backend request sent in background
4. On success: no additional feedback needed (already shown as pending)
5. On failure:
   - Revert button to "Add"
   - Show brief error toast: "Couldn't send request. Try again?"

### Request Confirmation

- No heavy modal or confirmation dialog (reduces friction)
- Simple button state change is sufficient feedback
- Cancel option available (button toggles from Pending → Add)

---

## Accessibility

- Search bar has clear label: "Search by username"
- All add/pending/friends buttons have descriptive VoiceOver labels
- QR scanner announces when code detected
- Contact import progress announced to VoiceOver
- All empty/error states are readable

---

## Testing Requirements

### Search Tests
- Search returns matching users
- Search excludes blocked users
- Search debounces correctly
- Empty search shows no results

### Contacts Tests
- Permission flow works correctly
- Phone numbers hashed before transmission
- Matches displayed correctly
- No matches shows friendly message

### Invite Link Tests
- Link generated successfully
- Share sheet opens with correct content
- Link opens app correctly (if installed)
- Link handles blocked/already-friends cases

### QR Code Tests
- QR code displays correctly
- Camera permission flow works
- Valid QR code detected and parsed
- Invalid QR code shows error

---

## Deliverables

1. **Add Friends screen** with three discovery methods
2. **Username search** with debounced real-time results
3. **Contacts import flow** with privacy safeguards and permission handling
4. **Invite link generation and sharing** via iOS share sheet
5. **QR code display and scanner** with camera integration
6. **Friend request sending** with optimistic UI
7. Integration with FriendService for all operations

---

## Notes

- Keep the Add Friends screen simple and scannable — three clear options
- Contacts import is privacy-sensitive — be transparent and respect user choice
- QR code adds fun "in-person" social element that fits the playful app tone
- All copy should be warm: "Find your friends!", "Let's connect!", "Your friend will be notified"
