# CRITICAL SESSION CONTEXT — READ FIRST (Muscle Hamster)

**DO NOT IGNORE.** This file defines the session rules and “how we work” for the **Muscle Hamster** project.

**For current work status and next steps, see `progress.md`.**  
**For the product requirements, see `muscle-hamster-prd.md`.**  
**For how to write phase/subphase docs, see `md-file-creation-instructions-for-new-phases.md`.**

---

## 0. WHAT THIS APP IS

**Muscle Hamster** is a **self-care fitness mobile app** that helps users build a daily movement habit through a nurturing virtual pet loop.

- **Core loop**: Complete a short workout → earn points → feed/care for your hamster → spend points on customization → build streaks.
- **Tone**: Gentle accountability (hamster is **hungry, not angry**). No guilt, no shame, no aggressive “you failed” language.
- **MVP platform**: **iOS (iOS 15+)**.

---

## 1. CURRENT PROJECT STATE (IMPORTANT)

This project is **planning complete — ready for implementation**. We have:
- A PRD (`muscle-hamster-prd.md`)
- Phase-doc writing methodology (`md-file-creation-instructions-for-new-phases.md`)
- Session bootstrap rules (this file)
- **Complete phase roadmap (Phase 00–08)** in `Development/`
- **GitHub repo**: https://github.com/Waxysplash/MuscleHamster

Current focus: **Phase 01 — App Shell & Core Navigation**

---

## 2. NON-NEGOTIABLE PRODUCT PRINCIPLES (TONE + UX)

All user-facing copy, notifications, and UI feedback must follow:

- **Warmth over pressure**: nurturing, playful, kind.
- **No guilt language**: never scold, shame, or threaten.
- **Low cognitive load**: quick choices; avoid overwhelming screens.
- **Speed over complexity**: users should be able to do a workout flow in **<15 minutes total**.

If a feature creates pressure, it conflicts with the product’s core differentiation.

---

## 3. MVP SCOPE BOUNDARIES (FROM PRD)

When making roadmap decisions, assume **MVP/v1 includes** (high-level):
- Authentication (email/password + Apple/Google)
- Age gate (13+)
- Onboarding personalization
- Workout library + workout player
- Hamster states + customization + growth
- Points economy + shop + inventory
- Streaks + streak freeze mechanics
- Push notifications (hamster personality)
- Social (friends, view friends, friend streaks)
- Ads (rewarded + standard)
- Privacy features (blocking, visibility controls, export, deletion)

Assume **out of scope for MVP** unless explicitly pulled in:
- Android app
- Wearables integration
- Premium subscriptions
- Real-money point purchases
- Leaderboards/competitive rankings
- Web version

---

## 4. KEY CONCEPTS (USE THESE TERMS CONSISTENTLY)

Keep terminology consistent across PRD, phase docs, and implementation notes:

- **Check-in**: the daily action that maintains streaks (workout or rest-day micro-task).
- **Workout day** vs **rest day**: determined by schedule rules (fixed vs flexible).
- **Hamster state**: fed/happy, chillin’, hungry, sad/neglected (final naming can evolve, meaning must be consistent).
- **Points balance**: user currency.
- **Inventory**: items the user owns (outfits/poses/enclosure items).
- **Streak freeze**: consumable that can restore a broken streak after a miss.
- **Friend streak**: shared streak requiring both users to check in.

---

## 5. MOBILE-SPECIFIC REQUIREMENTS TO ALWAYS CONSIDER

Even during planning, every feature should account for:

- **App lifecycle**: backgrounding, interruptions, app termination mid-flow.
- **Connectivity**: weak network and “try again” UX.
- **Permissions**: notifications, contacts (for friend discovery), and any future device features.
- **Accessibility**: VoiceOver support, 44x44pt touch targets, sufficient contrast.
- **Device matrix**: iPhone sizes from small to large; safe areas (notch/Dynamic Island).

---

## 6. OPEN QUESTIONS / PRD CONFLICTS (TRACK + RESOLVE)

The PRD includes at least one **inconsistency** that must be resolved before implementation:

- **Offline support**:
  - Scope section says “Offline functionality” is future consideration.
  - Non-functional requirements section suggests offline core access and later sync.

**Rule:** When you find contradictions like this, add them to `progress.md` under “Open Questions” and propose a clear decision + implications.

---

## 7. “HOW WE WORK” — SESSION PROTOCOL

### At the start of every session
- Read this file (`A1-new-session-instructions.md`)
- Read `progress.md` (what’s active, what’s blocked, what’s next)
- Read the PRD section(s) relevant to the current work (`muscle-hamster-prd.md`)
- If working on phases/subphases, follow `md-file-creation-instructions-for-new-phases.md`

### During the session
- Keep changes scoped to the active phase/subphase goal
- Document assumptions and decisions as you go (so future sessions don’t “re-decide”)
- Prefer clear, testable requirements over implementation prescriptions

### At the end of every session (MANDATORY)
- Update `progress.md`:
  - Mark completed items with `✅`
  - Update "Active Phase"
  - Add new open questions, risks, and decisions made
  - Add links to any new phase/subphase docs created
- **Push to GitHub**:
  - Commit all changes with a clear message
  - Push to `origin main`
  - Repo: https://github.com/Waxysplash/MuscleHamster

---

## 8. REQUIREMENTS WRITING RULES (WHEN CREATING PHASE DOCS)

Phase docs should be readable by both:
- A product owner (to validate intent)
- A senior developer (to implement without ambiguity)

**Do:**
- Describe **what** and **why**
- Include UX states (loading/empty/error/offline)
- Include edge cases and interruptions (mobile)
- Include privacy/security considerations where relevant

**Don’t:**
- Include code or pseudo-code
- Specify exact file/class/endpoint names
- Mandate frameworks/libraries unless explicitly decided for this project

---

## 9. QUALITY BAR (TESTING + RELIABILITY, HIGH-LEVEL)

Even before we write code, requirements should be testable. For most features, phase docs should include:
- **Happy-path flows**
- **Edge cases** (missed days, retries, partial completion, permission denial, offline)
- **Abuse scenarios** (blocking, spam friend requests, privacy defaults)
- **Performance constraints** (startup speed, smooth workout playback)

---

## 10. COMMON RISKS / GOTCHAS (PLAN AROUND THESE)

- **Economy balancing**: points costs and rewards need tuning; avoid grind or pay-to-win feel.
- **Content dependency**: workouts, visuals, and audio assets can block “feel good” UX.
- **Notification tone**: easy to accidentally drift into guilt language—must be policed.
- **Social safety**: blocking, visibility, and friend discovery need careful defaults.
- **Kids/age compliance**: age gate and data handling must be consistent with 13+ requirement.

---

## 11. FINAL OUTPUT CHECKLIST (BEFORE YOU RESPOND)

- [ ] Did I respect the **tone principles** (no guilt/shame)?
- [ ] Did I reflect **mobile realities** (interruptions, permissions, connectivity)?
- [ ] Did I keep scope aligned to MVP boundaries (or explicitly mark out-of-scope)?
- [ ] Did I update `progress.md` if I completed meaningful work or made decisions?

