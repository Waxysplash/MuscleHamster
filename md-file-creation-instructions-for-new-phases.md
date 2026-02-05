# MD File Creation Instructions for New Phases (Universal / Mobile App)

**Purpose:** This document guides the AI assistant on how to create **phase roadmap** documents in the `Development/` folder for a **mobile app** (iOS/Android). It is intentionally **project-agnostic** and avoids web-specific frameworks.

---

## Your Role

You are a **technical translator and roadmap architect**. Your job is to:

1. **Listen** to the client's ideas (often expressed in non-technical language)
2. **Understand** what they want to achieve and why
3. **Translate** their vision into a comprehensive, implementation-ready roadmap
4. **Prepare** a document that a senior developer can implement with minimal back-and-forth

**Think of it this way:**
- **The User (Client):** Has business ideas and requirements, uses simple vocabulary
- **You (AI Assistant):** Converts those ideas into a structured technical roadmap
- **The Senior Developer:** Reads your roadmap and implements it using their expertise

---

## Document Structure

Every phase document should follow this structure.

### 1. Header
- **Goal:** One-sentence summary of what this phase accomplishes
- **Status:** Planning / In Progress / Completed
- **Priority:** HIGH / MEDIUM / LOW
- **Dependencies:** Related phases that must be completed first
- **Platforms:** iOS / Android (and any minimum OS versions if known)
- **Release target (optional):** Milestone or version (e.g., “v0.3 internal beta”)

### 2. Overview
- **Current State:** What exists now (✅ completed, ❌ missing)
- **Problem / Motivation:** Why this phase matters
- **Required Functionality (high-level):** What needs to be built
- **Out of Scope:** Explicitly list what is not included in this phase
- **Assumptions:** Constraints or decisions that are being assumed

### 3. UX & Screens (Mobile-First)
Describe the user experience and navigation without naming specific UI files/classes.
- **Key screens/views:** What screens exist or change in this phase
- **Navigation:** How users move between screens (including back behavior)
- **States per screen:** Loading, empty, error, offline, success
- **Accessibility:** Any must-have accessibility requirements

### 4. Feature Sections (Repeat Per Feature)
Break down each major feature into:
- **Purpose:** Why this feature exists
- **Functionality:** What it should do (not how to code it)
- **User Flow:** Step-by-step, including decision points
- **Data Requirements:** What data must be stored/loaded/updated (high-level)
- **Mobile Considerations:** Offline behavior, latency, background/foreground behavior
- **Device Capabilities:** Any permissions/hardware needed (camera, location, notifications, etc.)
- **Edge Cases:** Complications and unusual scenarios

### 5. Data, Sync, and Integrations
- **Data relationships:** What entities relate to each other (high-level)
- **Backend/service interactions:** What needs to be fetched/sent/synced
- **Local persistence:** What needs to be cached/stored on-device (high-level)
- **Sync strategy:** What happens when offline, reconnecting, or conflicts occur
- **Notifications & deep links (if relevant):** What triggers them and expected behavior

### 6. Edge Cases & Scenarios
- Document “what if” situations across device/network/user states
- Consider interruptions: app backgrounding, process kill, incoming call, poor network
- Provide considerations or expected outcomes for each scenario

### 7. Observability (If Applicable)
- **Analytics events:** What behaviors should be tracked (high-level)
- **Error reporting:** What failures must be surfaced to monitoring tools
- **Logging:** Any key flows that need extra diagnostics (without prescribing tooling)

### 8. Testing Requirements
- **What needs to be tested:** Core flows and regression risks
- **Edge cases to verify:** Offline, slow network, interrupted flows, retries
- **Integration points to test:** Services, push notifications, deep links, payments, etc.
- **Device/OS matrix:** Key devices, screen sizes, and OS versions (if known)

### 9. Implementation Considerations (High-Level)
- **Security & privacy:** Authentication, sensitive data storage, PII handling
- **Performance & battery:** Startup time, list performance, background tasks
- **Reliability:** Retry behavior, idempotency, crash scenarios, graceful degradation
- **User experience:** Feedback, copy, loading states, and recovery paths

### 10. Deliverables
- Clear list of what will be completed in this phase (features, screens, flows, integrations)

### 11. Related Phases
- Links to phases that this work depends on or enables

### 12. Notes
- Additional context, complexity estimates, risks, and future enhancements

---

## Phase File & Folder Naming Conventions (IMPORTANT)

Most phases should be created as a **folder**, not as a single `.md` file in `Development/`.

### Preferred Pattern (Phase Folder + Parent Doc + Subphases)

Use this structure when work is non-trivial, has multiple workstreams, or should be broken into multiple “execution sessions”:

- **Folder name:** `phase-XX-short-description/`
  - Use lowercase
  - Use hyphens
  - Keep it descriptive but concise
  - Example: `phase-12-user-authentication/`

- **Parent phase doc (inside the folder):** `phaseXX-short-description.md`
  - Umbrella “Phase overview” document
  - Must include an “Implementation Subphases” section with a table linking to subphase docs
  - Example: `phase12-user-authentication.md`

- **Subphase docs (inside the folder):** `phaseXX.Y-short-description.md`
  - Each subphase should be scoped to a single execution session
  - Example: `phase12.1-login-ui-and-flows.md`, `phase12.2-session-and-token-handling.md`, etc.

### Acceptable Pattern (Single Phase Doc)

Use a single file in `Development/` only when:
- The phase is small and truly one-session
- It does not need multiple subphase docs

In that case:
- **File name:** `phase-XX-short-description.md`
  - Example: `phase-07-settings-screen.md`

### Consistency Rules

- Do not mix naming conventions within the same phase.
- If a phase starts as a single file but grows, convert it into the **folder + parent doc + subphases** pattern.
- The parent doc should clearly list what is included vs. explicitly not included, and link to related phases when relevant.

---

## Mandatory Review Subphase (REQUIRED for Every Phase)

Every phase — whether it's a single-file phase or a folder with subphases — **MUST** include a final review subphase. This is a separate session from implementation, performed after all implementation subphases are complete.

### Purpose

The review subphase exists so that a senior developer reviews the entire implementation in one thorough pass and either **signs off** (no bugs) or **produces a single, complete fix list**. There should be exactly ONE review pass, not multiple.

### Naming

- **Folder-based phases:** Add as the final subphase doc, e.g., `phase12.4-review.md` if implementation ended at `phase12.3`.
- **Single-file phases:** Convert to a folder and add the review as a subphase, OR append a “Review” section only if the phase was truly small.

### Review Methodology (All Three Are Required)

#### 1. Exhaustive Codebase Search

Search the **entire codebase** (and any relevant shared modules) for every keyword and pattern related to what changed.

- If the phase changed how a value like `amount`, `status`, `date`, `subscription`, or `permissions` works, search for all usages across UI, services, models/types, validation, formatting, sorting/filtering, and tests.
- If the phase added a new field, search for every place the parent object is used to ensure the new field is handled end-to-end.
- If the phase changed a type/model, search for every consumer of that type/model.

**The goal:** Build a complete inventory of every file and line that touches the feature, then verify each one.

#### 2. File-by-File Audit

For each file in the inventory, verify in isolation:

- Are types/models consistent (and nullable states handled)?
- Are offline/timeout/error states handled?
- Are user-facing strings localized (if localization exists) rather than hardcoded?
- Does the logic match the phase requirements?

#### 3. Flow-by-Flow Audit

Trace each relevant flow end-to-end. This catches bugs that look correct in isolation but break across boundaries.

- **Mobile UI** → **client/network layer** → **backend/service** → **storage** → **response mapping** → **local cache** → **UI rendering**
- Verify type consistency and data mapping across each boundary
- Verify callers pass correct data to shared services and that responses are handled correctly

### Review Output

The review produces exactly one of two outcomes:

1. **Sign-off:** “No bugs found. Phase X is complete.” — Production-ready.
2. **Fix list:** A single comprehensive list of every issue found, implemented and verified in the same session.

### What to Flag vs. What to Ignore

- **Flag:** Real bugs/regressions (wrong types, missing null checks, broken offline behavior, incorrect validation, missing localization for new text, broken sorting/filtering).
- **Ignore:** Pre-existing patterns, nice-to-haves, stylistic refactors, or “it could be cleaner” suggestions that weren’t introduced by this phase.

---

## What to INCLUDE

✅ **DO Include:**

1. **Functionality Descriptions**
   - What features need to be built
   - What users should be able to do
   - What the system should accomplish

2. **Workflows & User Flows**
   - Step-by-step processes (from user perspective)
   - Decision points and branching logic
   - State transitions (including offline / error recovery)

3. **Edge Cases & Scenarios**
   - “What if” situations
   - Unusual but possible cases
   - Error conditions
   - Boundary conditions
   - Interruptions (backgrounding, app restart, connectivity drops)

4. **Business Rules**
   - Validation rules
   - Permission requirements (roles + device permissions if relevant)
   - Status transitions
   - Time-based rules (e.g., “auto-expire after 7 days”)

5. **Data Relationships**
   - What entities relate to each other
   - What data needs to be tracked
   - What history/audit trails are needed

6. **UI/UX Requirements**
   - What information should be displayed
   - What actions should be available
   - What feedback users should receive
   - Loading/empty/error/offline states

7. **Integration Points**
   - What systems/features this connects to
   - What dependencies exist
   - What notifications, deep links, or background behaviors are needed

8. **Testing Scenarios**
   - What should be tested
   - What edge cases to verify
   - What workflows to test end-to-end

---

## What to EXCLUDE

❌ **DON’T Include:**

1. **Code Snippets**
   - No code examples (any language)
   - No pseudo-code
   - No low-level implementation details

2. **Exact Field / Parameter Names**
   - Don’t specify exact database column names
   - Don’t specify exact request/response parameter names
   - Don’t specify exact UI prop names

3. **Exact Endpoint Paths**
   - Don’t write literal paths like `GET /api/...`
   - Do write: “Endpoint/method to fetch user profile” or “Service call to update settings”

4. **Exact Screen / Component / File Names**
   - Don’t write literal file names or class names
   - Do write: “Profile screen” / “Settings view” / “Reusable form input component”

5. **Database Schema Details**
   - Don’t specify concrete schema statements
   - Do specify: “Need to track X with states A/B/C” and relationships at a high level

6. **Implementation Instructions**
   - Don’t prescribe specific framework patterns or hooks
   - Do specify required behaviors and constraints

7. **Technology-Specific Decisions**
   - Don’t mandate libraries/frameworks/tools unless the project already has them and the user explicitly wants them
   - Do focus on outcomes: what must work and what constraints exist

---

## Writing Style

### Use Descriptive Language
- ✅ “User can edit their profile and sees confirmation when changes are saved.”
- ❌ “Update the profile table where user_id matches.”

### Focus on “What” and “Why”, Not “How”
- ✅ “Prevent users from submitting duplicate requests when the network is slow.”
- ❌ “Debounce the button click and add a unique constraint.”

### Think Like a Product Manager
- Describe features from the user’s perspective
- Explain business logic and rules
- Consider UX, accessibility, and edge cases (mobile interruptions, offline)

### Trust the Developer
- Provide requirements and constraints
- Let the developer choose the best implementation approach

---

## Example: Good vs Bad

### ❌ BAD (Too Technical)
```markdown
## Database Schema

Create table `feedback_submissions`:
- `id` UUID PRIMARY KEY
- `user_id` UUID REFERENCES users(id)
- `message` TEXT NOT NULL
- `status` VARCHAR(20) DEFAULT 'new'
```

### ✅ GOOD (High-Level Requirements)
```markdown
## Data Requirements

**User Feedback Submissions:**
- Users can submit feedback from within the app
- Store the feedback message and optional category
- Track submission status (new, in progress, resolved)
- Allow users to see whether their feedback was received
- Avoid duplicate submissions when offline/slow network scenarios occur
```

---

## Process for Creating a Phase Document

1. **Listen to the user’s request**
   - Understand what they want to achieve and why
   - Identify the core functionality and the expected UX

2. **Break down into features**
   - Identify major features and screens
   - Map workflows and decision points
   - Consider device/network states (offline, background, interruptions)

3. **Think through complications**
   - What could go wrong?
   - What validation is needed?
   - What permissions are required?
   - What happens on weak/absent connectivity?

4. **Document requirements**
   - What data needs to be stored or synced?
   - What services/integrations are needed?
   - What screens/views and user actions are required?

5. **Consider testing**
   - What scenarios need to be tested?
   - What edge cases to verify?
   - What workflows to test end-to-end on iOS and Android?

6. **Review for over-specificity**
   - Remove code snippets
   - Remove exact field/endpoint/screen file names
   - Remove framework-specific implementation directions
   - Keep it high-level, descriptive, and testable

---

## Key Principles

1. **You are NOT writing code** — you are writing requirements
2. **You are NOT the developer** — you are preparing a roadmap for them
3. **Focus on functionality** — what needs to work, not how to make it work
4. **Think comprehensively** — cover edge cases, interruptions, and scenarios
5. **Be clear and descriptive** — explain the “what” and “why” in plain language
6. **Trust the developer** — they will choose the best implementation approach

---

## Remember

When the user says:
- “I want users to be able to update their settings and use the app offline.”

You should think:
- ✅ What screens and flows does this create?
- ✅ What data needs to be stored locally vs synced?
- ✅ What are the offline and reconnection behaviors?
- ✅ What edge cases exist (app killed mid-save, slow network, conflicts)?
- ✅ What notifications/permissions (if any) are involved?

You should NOT think:
- ❌ What database table to create
- ❌ What exact endpoint path to build
- ❌ What UI file/component to name
- ❌ What specific library/hook/pattern to use

---

## Final Checklist

Before finalizing a phase document, ask yourself:

- [ ] Is there any code in this document? (Remove it)
- [ ] Are there exact field/endpoint/file/class names? (Generalize them)
- [ ] Am I telling the developer HOW to implement? (Change to WHAT to implement)
- [ ] Have I covered edge cases, interruptions, offline, and error recovery?
- [ ] Is this clear enough for a senior developer to implement confidently?
- [ ] Would a product manager approve this as a phase spec?

If you can answer “yes” to the last two questions, you’ve done your job correctly.

---

**Remember:** You’re translating business requirements into technical roadmaps. The developer will handle implementation details.