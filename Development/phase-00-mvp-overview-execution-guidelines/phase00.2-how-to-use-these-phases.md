# Phase 00.2 — How to Use These Phases

## Header
- **Goal:** Define execution rules so each subphase fits within one session context window, with buffer for troubleshooting.
- **Status:** Planning
- **Priority:** HIGH
- **Dependencies:** Phase 00.1
- **Platforms:** iOS (15+)

---

## Overview

### Required Functionality (high-level)
- **Feature-based phases:** Each phase focuses on one user-facing capability area.
- **One-session subphases:** Each subphase is scoped to be completed in one session context window (leaving room for troubleshooting).
- **Mandatory final review:** Every phase ends with a dedicated review subphase performed after implementation subphases are complete.

### Out of Scope
- Detailed engineering implementation instructions, code, exact endpoint/field names, or framework-specific prescriptions.

### Working Conventions
- **Tone:** Warm, nurturing, hamster-voiced; never guilt/shame.
- **State coverage:** Every new user-facing screen/flow should consider loading, empty, error, offline/poor network (where applicable), and success states.
- **Interruption coverage:** Mobile flows must account for backgrounding, app relaunch, screen lock, and poor connectivity.
- **Accessibility baseline:** VoiceOver readability and reasonable touch targets for primary actions.

---

## Deliverables
- A consistent execution approach that keeps build sessions predictable and reviewable.

