# Muscle Hamster — Product Requirements Document

## 1. Overview

### 1.1 Problem Statement

Most fitness apps rely on guilt, shame, and aggressive accountability to drive engagement. Messages like "You missed your workout!" or "You're falling behind!" create negative associations with exercise, leading users to abandon apps entirely rather than face the judgment. This approach particularly alienates beginners and casual users who aren't ready to commit to intense tracking regimens.

Additionally, many fitness apps overwhelm users with calorie counting, macro tracking, and complex workout programming—features that serve dedicated athletes but intimidate people just trying to move more.

### 1.2 Solution Summary

Muscle Hamster is a self-care fitness app that makes daily movement feel like nurturing rather than obligation. Users complete short workouts to earn points that feed and care for their virtual hamster companion. The hamster serves as a gentle accountability partner—when you miss a scheduled workout, your hamster is hungry, not angry. The app emphasizes quick, accessible bodyweight workouts, user-defined schedules, and a reward system based on customizing your hamster's appearance and environment.

### 1.3 Target Users

**Primary:** Fitness beginners and casual exercisers who want to build a movement habit without the intimidation of traditional fitness apps. They're not interested in tracking protein or counting calories—they just want a fun, low-pressure way to stay active.

**Secondary:** Lapsed exercisers who've fallen off their routines and need gentle re-engagement rather than guilt-based motivation.

**Demographics:** All ages (app collects age during onboarding to personalize experience). Skews toward users who respond to gamification, virtual pets, and positive reinforcement.

### 1.4 Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Day 7 retention | >40% | Users find the loop engaging enough to return |
| Day 30 retention | >20% | Habit formation is occurring |
| Daily check-in rate | >70% of active users | Core loop is sticky |
| Streak length (median) | >7 days | Users are building consistency |
| Workouts completed per week | Matches user-set goal ±1 | App respects user intent |
| App store rating | >4.5 stars | Tone and experience resonate |

---

## 2. Scope

### 2.1 In Scope (MVP / v1)

- User accounts (email/password + Apple/Google social login)
- Age gate (13+ only)
- Onboarding flow: age, fitness level, fitness goals (cardio/muscle gain/fat loss/flexibility/general), weekly workout goal, schedule preference (fixed vs. flexible), preferred workout time, fitness intent (maintenance vs. improvement)
- Virtual hamster with naming and appearance customization
- Hamster renaming available anytime
- Points economy: earn points from workouts, rest-day activities, and watching ads
- Shop: poses, outfits, enclosure items purchasable with points
- Workout library: comprehensive bodyweight exercises, categorized by difficulty, duration ranges (<15/<30/<45/<60 min), and fitness goal
- Smart workout recommendations based on user profile, goals, and history
- Longer workout options for users who set progressive goals
- Rest-day micro-tasks: <1 minute activities OR logging positive behaviors (walk, journal, stretch)
- Daily check-in mechanic to maintain streaks
- Streak system with purchasable streak freezes (cost points, manual activation after miss)
- Hamster states: happy/fed (workout completed), chillin' (rest day), hungry (missed scheduled workout)
- Sound and music throughout app experience (with mute option)
- Push notifications with hamster personality (text-based, timed to user's preferred workout time)
- Friends system: add via username, phone contacts, or share link/QR code
- View friends' hamsters and progress
- Friend streaks (with option for either friend to pay to restore, or one to pay double for both)
- Basic privacy features: blocking, profile visibility controls, data export, account deletion
- Free-to-play with ads; optional ad watching for bonus points (no daily limit)
- iOS app

### 2.2 Out of Scope (Future Consideration)

- Multiple hamsters per user
- Groups (create/join groups, view group members' hamsters)
- Gifting items between friends
- Android app (v2)
- Web version (v3)
- Premium subscription tier
- Equipment-based workouts (resistance bands, dumbbells, gym machines)
- Calorie/macro tracking
- Integration with fitness wearables (Apple Watch, Fitbit)
- Seasonal events or limited-time items
- Leaderboards or competitive rankings
- In-app purchase for points (real money)
- Offline functionality (future consideration)

### 2.3 Assumptions

- Users have iOS 15+ devices
- Users are willing to enable push notifications
- Art assets (hamster animations/illustrations) will be developed in parallel
- Ad network SDK (e.g., AdMob) is available and viable for monetization
- Users prefer short, guided workouts over open-ended logging

### 2.4 Constraints

*To be determined based on actual budget, timeline, and technical decisions.*

---

## 3. User Stories & Flows

### 3.1 User Stories

**Onboarding:**
- As a new user, I want to create an account quickly so I can start using the app without friction.
- As a new user, I want to tell the app my fitness level and goals so workouts match my abilities.
- As a new user, I want to name my hamster so it feels like mine.

**Core Loop:**
- As a user, I want to complete a short workout and see my hamster get fed so I feel rewarded.
- As a user, I want to earn points from workouts so I can buy fun items for my hamster.
- As a user on a rest day, I want to do a quick micro-task so I can maintain my streak without a full workout.
- As a user, I want to check in with my hamster daily so I don't lose my streak.

**Customization:**
- As a user, I want to browse a shop of hamster items so I can plan what to save up for.
- As a user, I want to change my hamster's outfit and pose so it reflects my personality.
- As a user, I want to decorate my hamster's enclosure so it feels like a space I've built.

**Streaks & Recovery:**
- As a user who might miss a day, I want to use a streak freeze so one bad day doesn't erase my progress.
- As a user, I want to see my current streak prominently so I'm motivated to keep it going.

**Social:**
- As a user, I want to add friends so I can see how their hamsters are doing.
- As a user, I want to maintain streaks with friends so we motivate each other.

**Schedule Management:**
- As a user, I want to set which days are workout days so the app respects my availability.
- As a user, I want to change my schedule in settings so I can adapt when my life changes.

**Monetization:**
- As a user, I want to watch an ad for bonus points so I can earn rewards faster without paying.

### 3.2 Primary User Flows

**Flow 1: Onboarding**
1. User downloads app and opens it
2. User creates account (email/password or social login)
3. User confirms they are 13 or older (age gate)
4. User enters age
5. User selects fitness level: Beginner / Intermediate / Hard
6. User selects fitness goals: Cardio, Muscle Gain, Fat Loss, Flexibility, General Fitness (can select multiple)
7. User sets weekly workout goal (e.g., 3 days/week)
8. User chooses schedule type: Fixed days (select specific days) or Flexible (any X days per week)
9. User sets preferred workout time (morning, afternoon, evening, or specific time)
10. User chooses fitness intent: Maintenance (consistent difficulty) or Improvement (progressive difficulty)
11. User names their hamster
12. User sees their hamster for the first time in its enclosure
13. User selects their first workout from tailored suggestions based on their goals

**Flow 2: Workout Day — Complete Workout**
1. User opens app on a scheduled workout day
2. User sees hamster is hungry/waiting
3. User taps "Start Workout"
4. User selects from available workouts (filtered by their level and goals)
5. User completes workout (follows along with exercises)
6. Completion screen: hamster is fed, points awarded, streak updated
7. User can browse shop or close app

**Flow 3: Workout Day — Miss Workout**
1. User does not open app or skips workout
2. Push notification sent: "Squeaks is getting hungry! 🐹"
3. If still no activity by end of day: hamster state = hungry (visual change)
4. Streak at risk; if no check-in, streak resets next day

**Flow 4: Rest Day Check-In**
1. User opens app on a rest day
2. Hamster is shown chillin' (relaxed state)
3. User is prompted with micro-task options:
   - Quick interaction: "Pet your hamster" / "Give a treat"
   - Log positive activity: walked, stretched, journaled, meditated
4. User completes micro-task
5. Small points awarded, streak maintained
6. User can browse shop or close app

**Flow 5: Use Streak Freeze**
1. User misses a check-in day (streak would normally reset)
2. Next time user opens app, they're informed streak was broken
3. User is offered option to spend points to restore streak (streak freeze)
4. User chooses whether to spend points or accept streak reset
5. If freeze used: streak continues unbroken; if not: streak resets to 0

**Flow 6: Add Friend**
1. User navigates to Friends section
2. User chooses method: search username / import contacts / share link or QR
3. Friend request sent/accepted
4. Friend appears in Friends list with their hamster preview

**Flow 7: Watch Ad for Points**
1. User taps "Earn bonus points" button (visible in shop or home screen)
2. User watches rewarded video ad
3. Bonus points credited upon completion

---

## 4. Functional Requirements

### 4.1 Features

**Feature: User Authentication**
- Description: Account creation and login
- User interaction: Sign up / log in via email+password or Apple/Google OAuth
- Behavior: Standard authentication flow; password reset via email
- Acceptance criteria: Users can create accounts, log in, log out, and recover passwords

**Feature: Onboarding Profile Setup**
- Description: Collect user preferences to personalize experience
- User interaction: Step-by-step screens collecting age, fitness level, fitness goals (cardio, muscle gain, fat loss, flexibility, general fitness), fitness intent (maintenance vs. improvement), workout goal, schedule preference, preferred workout time, hamster name
- Behavior: Data saved to user profile; can be edited later in Settings. Fitness goals used to tailor workout suggestions. Fitness intent determines whether workouts progressively increase in difficulty or stay consistent. After onboarding, user selects their first workout from tailored suggestions.
- Acceptance criteria: All inputs saved; workout suggestions reflect user's stated goals

**Feature: Hamster Display & States**
- Description: Visual representation of user's hamster with dynamic states and growth
- User interaction: View hamster on home screen
- Behavior: Hamster appearance reflects customizations; state reflects schedule/activity:
  - Happy/Fed: Workout completed today
  - Chillin': Rest day, check-in completed
  - Hungry: Scheduled workout day, not yet completed
  - Sad/Neglected: Missed check-in (streak broken)
- Acceptance criteria: Hamster state updates correctly based on user activity and schedule

**Feature: Workout Library**
- Description: Comprehensive collection of no-equipment bodyweight workouts
- User interaction: Browse and select workouts; filter by duration and difficulty
- Behavior: Workouts tagged by:
  - Level: beginner/intermediate/hard
  - Duration ranges: <15 min, <30 min, <45 min, <60 min
  - Fitness goal: cardio, muscle gain, fat loss, flexibility, general fitness
  - Body focus: full body, upper body, lower body, core, cardio
- Content: Comprehensive library of bodyweight exercises (push-ups, squats, lunges, planks, burpees, etc.). Future expansion may include resistance bands, dumbbells, or other at-home equipment.
- Acceptance criteria: Workouts display correctly; filtering works; all levels and goal types have sufficient content

**Feature: Workout Player**
- Description: Guided workout experience
- User interaction: Follow along with exercises; timer counts down; tap to pause/skip. After completion, user can rate workout (thumbs up/down) to improve future recommendations.
- Behavior: Displays exercise name, duration, and visual (hamster demo, hamster cheering, or illustrated instruction—TBD based on art). Rest periods between exercises. Completion triggers reward flow. Workout rating feeds into recommendation engine.
- Acceptance criteria: Timer functions correctly; exercises display in order; completion detected; rating captured

**Feature: Sound & Music**
- Description: Audio experience throughout the app
- User interaction: Background music and sound effects play automatically; user has granular control
- Behavior: 
  - Workout music: Original compositions, upbeat and motivating during exercises
  - Sound effects: Hamster squeaks, celebration sounds, UI feedback
  - Ambient sounds: Gentle background audio on home screen
  - Audio controls in settings:
    - Global mute toggle (disables all audio)
    - Per-category toggles: workout music, sound effects, ambient sounds
- Acceptance criteria: Audio plays appropriately in all contexts; global and per-category toggles work independently; audio doesn't conflict with other apps

**Feature: Smart Workout Recommendations**
- Description: ML-powered workout suggestions based on user profile and history
- User interaction: User sees personalized "Recommended for you" workouts on workout selection screen
- Behavior: Recommendation engine considers:
  - User's stated fitness goals (cardio, muscle gain, fat loss, flexibility)
  - Fitness level and intent (maintenance vs. improvement)
  - Workout history (what they've done, what they've skipped)
  - Time since last workout and muscle groups targeted
  - Preferred duration range
  - Completion rates (avoid recommending workouts user consistently abandons)
- Recommendations update based on: goal changes, workout completions, user feedback (thumbs up/down on workouts)
- Acceptance criteria: Recommendations feel personalized; users complete recommended workouts at higher rate than random selection

**Feature: Points Economy**
- Description: Earn and spend points
- User interaction: Earn points from workouts (more) and rest-day tasks (less); spend in shop
- Behavior: Points balance displayed prominently. Transactions logged.
  - Workout completion: [X] points (varies by duration/difficulty)
  - Rest-day micro-task: [Y] points (less than workout)
  - Watch ad: [Z] bonus points
  - Streak freeze cost: [W] points
- Acceptance criteria: Points awarded correctly; balance updates; shop purchases deduct points

**Feature: Shop**
- Description: Spend points on hamster customizations
- User interaction: Browse categories (poses, outfits, enclosure items); preview items; purchase
- Behavior: Items have point costs. Purchased items added to inventory. Items can be equipped/placed.
- Acceptance criteria: All items display with prices; purchases work; inventory tracks owned items

**Feature: Hamster Customization**
- Description: Modify hamster appearance and environment
- User interaction: Access customization screen; equip outfits, select poses, place enclosure items
- Behavior: Changes reflected immediately on home screen hamster display
- Acceptance criteria: All purchased items can be equipped; changes persist

**Feature: Rest-Day Micro-Tasks**
- Description: Quick activities to maintain streak on rest days
- User interaction: Select from quick interaction (pet hamster, give treat) or log activity (walk, stretch, journal, meditate)
- Behavior: Task completion awards small points, maintains streak, keeps hamster in "chillin'" state
- Acceptance criteria: All task types work; points awarded; streak maintained

**Feature: Streak System**
- Description: Track consecutive days of check-ins
- User interaction: View current streak on home screen
- Behavior: Streak increments daily with check-in (workout or micro-task). Resets to 0 if day missed without freeze.
- Acceptance criteria: Streak counts correctly; resets on miss; freeze prevents reset

**Feature: Streak Freeze**
- Description: Protect streak from single missed day
- User interaction: After missing a day, user is prompted to spend points to preserve streak
- Behavior: Costs [W] points. Can stockpile multiple. Manual activation only—after streak is broken, user chooses whether to spend points to restore it. One freeze covers one day.
- Acceptance criteria: Purchase works; freeze restores streak after miss; user has choice to spend or not

**Feature: Schedule Management**
- Description: User-defined workout days
- User interaction: Set during onboarding; edit in Settings
- Behavior: Fixed mode: select specific days (e.g., Mon/Wed/Fri). Flexible mode: user sets number of days per week and marks each day as workout or rest when they open the app (app asks "Is today a workout day?"). Hamster state reflects whether today is a workout day based on user input.
- Acceptance criteria: Schedule saved correctly; hamster state responds to schedule; flexible mode prompts user appropriately

**Feature: Push Notifications**
- Description: Reminders with hamster personality
- User interaction: Receive notifications; tap to open app
- Behavior: Notifications sent based on user's preferred workout time (set during onboarding). Timing ramps up as scheduled workout time approaches. Copy is warm and hamster-voiced:
  - "Squeaks is wondering where you are! 🐹"
  - "Your hamster could use some attention today!"
  - "Time to check in! Squeaks is waiting."
- Acceptance criteria: Notifications delivered at appropriate times; tapping opens app; tone is never guilt-based

**Feature: Friends System**
- Description: Connect with other users
- User interaction: Add friends via username search, phone contacts import, or share link/QR code
- Behavior: Friend requests sent and accepted. Friends appear in list with hamster preview and streak info.
- Acceptance criteria: All add methods work; friend list displays correctly; can remove friends

**Feature: View Friends' Hamsters**
- Description: See how friends are doing
- User interaction: Tap friend to view their hamster, enclosure, and streak
- Behavior: Read-only view of friend's hamster state and customizations. Cannot interact.
- Acceptance criteria: Friend hamster displays correctly with their customizations

**Feature: Friend Streaks**
- Description: Maintain streaks together with friends
- User interaction: View shared streak with a friend; option to restore broken streaks
- Behavior: Separate counter tracks days both users checked in. Resets immediately if either user misses a day, regardless of reason. When a friend streak breaks:
  - Either friend can spend points to restore their side
  - One friend can pay double to restore the streak for both
  - If neither pays, the streak resets to 0
- Acceptance criteria: Shared streak counts correctly; resets on either user's miss; restoration payment works for self or both

**Feature: Rewarded Ads**
- Description: Watch ads for bonus points
- User interaction: Tap "Earn bonus points" button; watch video ad
- Behavior: Ad plays; upon completion, bonus points credited. No daily limit.
- Acceptance criteria: Ads play correctly; points awarded after completion

**Feature: Standard Ads**
- Description: Monetization via banner/interstitial ads
- User interaction: Ads appear in non-intrusive placements (e.g., between screens, bottom banner)
- Behavior: Standard ad network integration. Frequency capped to avoid annoyance.
- Acceptance criteria: Ads display; do not interrupt core workout experience

### 4.2 Data Requirements

**User Profile:**
- Account credentials (email/hashed password or OAuth token)
- Age
- Fitness level (beginner/intermediate/hard)
- Fitness goals (cardio, muscle gain, fat loss, flexibility, general fitness—can have multiple)
- Fitness intent (maintenance vs. progressive improvement)
- Weekly workout goal
- Schedule type and selected days
- Preferred workout time (for notification timing)
- Notification preferences
- Sound preferences (global mute, per-category toggles: workout music, sound effects, ambient)

**Hamster:**
- Name
- Equipped outfit
- Selected pose
- Enclosure items and placement
- Current state (derived from activity)

**Activity Log:**
- Workouts completed (date, workout ID, duration, points earned, user rating)
- Rest-day tasks completed (date, type, points earned)
- Check-in timestamps

**Economy:**
- Points balance
- Transaction history (earned, spent, item)
- Inventory (owned items)
- Streak freezes owned

**Streaks:**
- Current personal streak (count, start date)
- Streak history (for potential future features)
- Friend streaks (pairs of user IDs, count)

**Social:**
- Friends list (user IDs)
- Friend requests (pending)

**Retention:** User data retained indefinitely unless account deleted. Activity logs may be pruned after 1 year for storage optimization.

### 4.3 Integrations

- **Authentication:** Apple Sign-In, Google Sign-In
- **Push Notifications:** Apple Push Notification Service (APNs)
- **Ads:** AdMob or similar ad network (banner, interstitial, rewarded video)
- **Analytics:** Mixpanel, Amplitude, or Firebase Analytics for tracking success metrics
- **Contacts:** iOS Contacts framework (with permission) for friend discovery

---

## 5. Non-Functional Requirements

### 5.1 Performance

- App launch to home screen: <2 seconds
- Workout player: zero perceptible lag between exercises
- Points balance update: immediate (optimistic UI)
- API response times: <500ms for standard operations
- Offline capability: View hamster, access downloaded workouts; sync when online

### 5.2 Security

- Passwords hashed with bcrypt or equivalent
- OAuth tokens stored securely in iOS Keychain
- API authentication via JWT with short expiry
- Personal data (age, email) encrypted at rest
- Friend discovery via contacts: phone numbers hashed, never stored raw

### 5.3 Privacy

- **Age restriction:** Users must be 13 or older. Age gate during onboarding; users under 13 cannot create accounts.
- **Data export:** Users can request a copy of all their data (profile, activity history, hamster customizations)
- **Account deletion:** Users can delete their account and all associated data from settings
- **Friend blocking:** Users can block other users, preventing friend requests and visibility
- **Profile visibility:** Users can control whether their hamster is visible to friends or hidden
- **Data minimization:** Only collect data necessary for app functionality

### 5.4 Accessibility

- Target: WCAG 2.1 AA compliance
- VoiceOver support for all screens
- Minimum touch target size: 44x44 pt
- Sufficient color contrast for text and UI elements
- Workout instructions available as text (not just visual)
- Option to extend workout timers for users who need more time

### 5.5 Platform & Browser Support

- **MVP:** iOS 15.0+
- **Devices:** iPhone (all sizes); iPad support optional in v1
- **Orientation:** Portrait only for v1
- **Offline:** Core features functional offline; social features require connection

---

## 6. UI/UX Requirements

### 6.1 Design Principles

1. **Warmth over pressure:** Every interaction should feel nurturing. No guilt, no shame, no aggressive language.
2. **Speed over complexity:** Users should be able to complete a workout and close the app in under 15 minutes total.
3. **Delight in details:** Hamster animations, micro-interactions, and playful copy reward engagement.
4. **Transparency:** Users always know why the app is suggesting what it's suggesting. Their settings drive the experience.
5. **Low cognitive load:** Minimal choices at any moment. Don't overwhelm with options.

### 6.2 Key Screens/Views

| Screen | Purpose |
|--------|---------|
| Home | Hamster display, current streak, today's status, quick actions |
| Workout Selection | Browse/filter available workouts |
| Workout Player | Active workout experience |
| Completion | Celebration, points earned, hamster fed |
| Shop | Browse and purchase items |
| Customization | Dress hamster, arrange enclosure |
| Friends | Friend list, add friends, view friend hamsters |
| Profile/Settings | Edit schedule, notification preferences, account |
| Onboarding | Account creation, profile setup, hamster naming |

### 6.3 Navigation Structure

- **Tab Bar (4 tabs):**
  1. Home (hamster, today's activity)
  2. Workouts (library, start workout)
  3. Shop (browse, purchase, customize)
  4. Social (friends)

- **Settings:** Accessible from Home screen (gear icon)
- **Profile:** Accessible from Home screen or Settings

### 6.4 Responsive Behavior

- Portrait orientation only (v1)
- Layouts adapt to iPhone SE through iPhone Pro Max
- Safe area compliance for notch/Dynamic Island devices
- Hamster display scales proportionally to screen size

---

## 7. Technical Considerations

### 7.1 Suggested Architecture

- **Client:** Native iOS (Swift/SwiftUI)
- **Backend:** RESTful API (Node.js/Express or similar)
- **Database:** PostgreSQL for relational data (users, social, transactions)
- **Media Storage:** Cloud storage (S3 or equivalent) for workout content
- **Real-time:** Not required for v1 (polling acceptable for social updates)

### 7.2 Technology Preferences

- **iOS:** Swift, SwiftUI preferred for modern UI
- **Backend:** Flexible; Node.js, Python/Django, or Go all viable
- **Database:** PostgreSQL recommended for relational queries
- **Auth:** Firebase Auth or Auth0 for simplified OAuth handling
- **Ads:** Google AdMob SDK

### 7.3 Deployment Environment

- **Backend:** Cloud hosting (AWS, GCP, or Vercel)
- **iOS:** App Store distribution
- **CI/CD:** Fastlane for iOS builds; GitHub Actions or similar for backend

---

## 8. Implementation Notes

### 8.1 Priority Order

**Phase 1: Core Loop**
1. Authentication (email + social + age gate)
2. Onboarding (profile setup, fitness goals, hamster naming)
3. Home screen with hamster display and states
4. Basic workout library (comprehensive bodyweight exercises)
5. Workout player with sound/music
6. Points earning from workouts
7. Streak tracking and daily check-in

**Phase 2: Engagement**
8. Rest-day micro-tasks
9. Push notifications (timed to user's preferred workout time)
10. Shop and basic items
11. Hamster customization (outfits, poses, enclosure)
12. Streak freezes (manual activation after miss)
13. Smart workout recommendations

**Phase 3: Social**
15. Friends (add via username, contacts, link/QR)
16. View friends' hamsters
17. Friend streaks with payment options
18. Privacy features (blocking, visibility controls)

**Phase 4: Monetization**
19. Banner/interstitial ads
20. Rewarded video ads for bonus points

### 8.2 Dependencies

- Hamster art assets required before customization features
- Workout content required before workout player and recommendations are useful
- Sound/music assets required before workout player is complete
- Auth must be complete before any user-specific features
- Points economy must exist before shop is meaningful
- Notification permission flow must be designed before implementing notifications
- ML recommendation engine can be built incrementally once workout history data exists

### 8.3 Open Questions

1. **Workout visuals:** Hamster demonstrating, hamster cheering, or static illustrations? (Depends on art capacity)

---

## Appendix

### A. Competitive Landscape

| App | Approach | Muscle Hamster Differentiator |
|-----|----------|------------------------------|
| Nike Training Club | Professional, intense | Warmer, gamified, beginner-focused |
| Fabulous | Habit building, coaching | Pet companion vs. abstract rewards |
| Finch | Self-care pet app | Fitness-specific vs. general wellness |
| Duolingo | Gamified learning, streak guilt | Kind tone, no passive-aggressive owl |
| Zombies, Run! | Narrative fitness | Cute/nurturing vs. adrenaline/survival |

### B. Tone Guide

**Do say:**
- "Your hamster is waiting for you!"
- "Squeaks could use some love today 🐹"
- "Great job! Your hamster is so happy!"
- "Rest day! Your hamster is taking it easy too."
- "It's okay to take a break. Your hamster understands."

**Don't say:**
- "You missed your workout!"
- "Don't break your streak!"
- "You're falling behind!"
- "Your hamster is disappointed."
- "Get back on track!"

### C. Points Economy Sketch (Needs Balancing)

| Action | Points |
|--------|--------|
| Workout <15 min | 50 |
| Workout <30 min | 100 |
| Workout <45 min | 150 |
| Workout <60 min | 200 |
| Rest-day micro-task | 20 |
| Watch rewarded ad | 25 |
| Personal streak freeze (cost) | 150 |
| Friend streak freeze - self only (cost) | 150 |
| Friend streak freeze - pay for both (cost) | 300 |

| Item Type | Price Range |
|-----------|-------------|
| Basic pose | 100-200 |
| Outfit piece | 150-300 |
| Enclosure item (small) | 100-200 |
| Enclosure item (large) | 300-500 |
| Premium/rare items | 500-1000 |

*Note: Values are illustrative. Actual economy requires playtesting and iteration.*

### D. Bodyweight Exercise Catalog

All exercises require no equipment. Each exercise is tagged by primary body focus and difficulty level to enable filtering and workout building.

**Upper Body**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Wall push-ups | Beginner | Hands on wall, standing |
| Knee push-ups | Beginner | Modified from knees |
| Standard push-ups | Intermediate | Full plank position |
| Wide push-ups | Intermediate | Wider hand placement, chest emphasis |
| Diamond push-ups | Hard | Hands together, tricep emphasis |
| Decline push-ups | Hard | Feet elevated |
| Pike push-ups | Intermediate | Hips raised, shoulder emphasis |
| Hindu push-ups | Hard | Flowing dive motion |
| Tricep dips (floor) | Beginner | Hands on floor behind body |
| Tricep dips (chair) | Intermediate | Hands on elevated surface |
| Arm circles | Beginner | Forward and backward |
| Shoulder taps (plank) | Intermediate | Alternate tapping shoulders in plank |
| Inchworms | Intermediate | Walk hands out to plank, walk back |
| Bear crawl | Intermediate | Forward and backward crawling |
| Plank to push-up | Hard | Alternate between forearm plank and push-up position |
| Pseudo planche push-ups | Hard | Hands turned outward, lean forward |

**Lower Body**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Bodyweight squats | Beginner | Standard depth |
| Wall sits | Beginner | Static hold against wall |
| Sumo squats | Beginner | Wide stance |
| Split squats | Intermediate | Staggered stance |
| Bulgarian split squats | Hard | Rear foot elevated |
| Jump squats | Intermediate | Explosive upward |
| Pistol squats (assisted) | Hard | Single leg, using wall/chair for balance |
| Pistol squats | Hard | Full single leg, no assistance |
| Forward lunges | Beginner | Alternating legs |
| Reverse lunges | Beginner | Step backward |
| Walking lunges | Intermediate | Continuous forward |
| Lateral lunges | Intermediate | Side-to-side |
| Jump lunges | Hard | Alternating with jump |
| Curtsy lunges | Intermediate | Cross behind |
| Glute bridges | Beginner | Two legs, floor |
| Single-leg glute bridge | Intermediate | One leg extended |
| Calf raises | Beginner | Both feet |
| Single-leg calf raises | Intermediate | One foot |
| Step-ups | Beginner | Using chair or step |
| Box jumps (low) | Intermediate | Jump onto stable surface |
| Donkey kicks | Beginner | On all fours, kick back |
| Fire hydrants | Beginner | On all fours, leg to side |
| Hip thrusts (floor) | Intermediate | Shoulders on floor |

**Core**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Dead bugs | Beginner | Alternating arm/leg extension |
| Bird dogs | Beginner | Opposite arm/leg extension |
| Forearm plank | Beginner | Static hold |
| High plank | Beginner | Arms extended, static hold |
| Side plank (knee) | Beginner | Modified with knee down |
| Side plank | Intermediate | Full extension |
| Side plank with hip dip | Intermediate | Raise and lower hips |
| Crunches | Beginner | Standard |
| Bicycle crunches | Intermediate | Alternating elbow to knee |
| Reverse crunches | Intermediate | Hips lift off floor |
| Leg raises | Intermediate | Lying flat, legs straight |
| Flutter kicks | Intermediate | Small alternating leg kicks |
| Scissor kicks | Intermediate | Crossing legs alternately |
| Mountain climbers | Intermediate | Running in plank position |
| V-ups | Hard | Simultaneous upper and lower body lift |
| Hollow body hold | Hard | Arms and legs extended, back pressed to floor |
| Dragon flags (assisted) | Hard | Lying on back, lower body controlled descent |
| Windshield wipers | Hard | Legs side to side while lying flat |
| Russian twists | Intermediate | Seated rotation |
| Plank jacks | Intermediate | Jumping feet in/out from plank |
| Ab wheel rollout (towel) | Hard | Using towel on smooth floor |

**Cardio**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Marching in place | Beginner | High knees, controlled pace |
| Jumping jacks | Beginner | Standard |
| Seal jacks | Intermediate | Arms open/close horizontally |
| High knees | Intermediate | Running in place with knees up |
| Butt kicks | Beginner | Running in place, heels to glutes |
| Burpees (no push-up) | Intermediate | Squat, jump back, jump up |
| Burpees (full) | Hard | With push-up at bottom |
| Skaters | Intermediate | Lateral bounding |
| Tuck jumps | Hard | Jump with knees to chest |
| Star jumps | Intermediate | Explosive jump, arms and legs spread |
| Fast feet (football drill) | Intermediate | Rapid small steps in place |
| Squat jacks | Intermediate | Jumping jack with squat |
| Lateral shuffles | Beginner | Side-to-side quick steps |
| Shadow boxing | Beginner | Punching combinations in place |
| High plank jog | Intermediate | Running feet in plank |
| Pop squats | Intermediate | Jump feet wide into squat, jump back together |
| Power skips | Intermediate | Exaggerated skipping for height |
| Broad jumps | Intermediate | Standing long jump, walk back |

**Full Body**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Bear crawl | Intermediate | Forward and backward |
| Crab walk | Intermediate | Face up, hands and feet |
| Sprawls | Intermediate | Like a burpee without the jump |
| Walkouts | Intermediate | Standing, walk hands to plank, walk back |
| Squat to press (imaginary) | Beginner | Squat with overhead arm extension |
| Turkish get-ups (bodyweight) | Hard | Floor to standing, controlled movement |
| Burpee to tuck jump | Hard | Burpee with tuck jump at top |
| Animal flow sequences | Hard | Fluid movement combining multiple positions |

**Flexibility / Mobility**

| Exercise | Difficulty | Notes |
|----------|-----------|-------|
| Neck rolls | Beginner | Gentle circular motion |
| Shoulder rolls | Beginner | Forward and backward |
| Cat-cow stretch | Beginner | On all fours, arch and round |
| World's greatest stretch | Intermediate | Lunge with rotation |
| Hip circles | Beginner | Standing, circular hip motion |
| Deep squat hold | Beginner | Sit in bottom of squat |
| Pigeon stretch | Beginner | Hip opener |
| Figure-four stretch | Beginner | Seated or lying |
| Hamstring stretch (standing) | Beginner | Hinge at hips |
| Quad stretch (standing) | Beginner | Pull foot to glutes |
| Child's pose | Beginner | Kneeling stretch |
| Cobra stretch | Beginner | Lying face down, press up |
| Downward dog | Beginner | Inverted V position |
| Thoracic spine rotation | Beginner | Seated or on all fours |
| Ankle circles | Beginner | Both directions |
| Wrist circles | Beginner | Both directions |
| Standing side bend | Beginner | Lateral stretch |
| Butterfly stretch | Beginner | Seated, soles together |

*Note: This catalog represents the initial exercise library. Exercises can be combined into workouts based on user goals, difficulty, duration, and body focus. Future expansions may add equipment-based variations (resistance bands, dumbbells).*
