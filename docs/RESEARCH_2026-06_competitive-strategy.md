# Competitive Strategy Research — June 2026

**Method:** multi-agent deep research (27 sources → 128 claims → top 25 put through 3-vote adversarial verification).
**Headline: only 6 of 25 claims survived. 19 were refuted.** The evidence collapsed hardest in exactly the highest-priority area (retention psychology) and in ASO.

> Refuted ≠ proven false. It means the claim could not be verified to this standard, so it carries **no weight in decisions**.

---

## ✅ VERIFIED FINDINGS (safe to act on)

### 1. Step auto-feed is a real project, not a weekend hack — *high confidence*
- `expo-sensors` historical step retrieval (`getStepCountAsync`) is **iOS-only**. Android's native module throws `NotSupportedException: "Getting step count for date range is not supported on Android yet"`.
- Android requires **Health Connect** (`react-native-health-connect`), which **cannot run in Expo Go** — needs a custom dev build (`eas build --profile development`), `minSdkVersion 26`, compileSdk 34–35, plus Google Play Health Connect data-use review.
- **Sequencing decision: ship iOS step-feeding first. Android is a separate milestone.**
- Sources: docs.expo.dev/versions/latest/sdk/pedometer, github.com/matinzd/react-native-health-connect

### 2. Apple §5.1.3(i) — health data must never touch analytics — *high confidence*
- Guideline text: apps "may not use or disclose to third parties data gathered in the health, fitness, and medical research context — including … HealthKit API, Motion and Fitness … for advertising, marketing, or other use-based data mining purposes other than improving health management." Must "disclose the specific health data that you are collecting from the device."
- On iOS, Expo's pedometer reads **CMPedometer (Motion & Fitness)** — named explicitly in the guideline — so this binds even without HealthKit.
- **Feeding the hamster from steps is explicitly SAFE** (direct user benefit carve-out).
- ⚠️ **Real removal risk:** documented cases of Firebase Analytics inadvertently receiving HealthKit-derived events triggering app removal.
- **Rule for this codebase: never pass step/health values as analytics event parameters.** Disclose on all three surfaces: `NSMotionUsageDescription` purpose string, App Privacy label, privacy policy.
- Source: developer.apple.com/app-store/review/guidelines (fetched live 2026-07-23)

### 3. Revenue expectations must be calibrated very low — *high confidence*
RevenueCat State of Subscription Apps 2026 (n = 115,000+ apps):

| Metric | Value |
|---|---|
| Median monthly revenue ~1yr post-launch | **~$72** |
| Reach $1,000/month within 2 years | **17.3%** |
| Reach $10,000/month within 2 years | **4.6%** |

"First revenue" for Muscle Hamster = **tens of dollars/month**. That is the normal outcome, not failure.
⚠️ Scope: these are **subscription** benchmarks. Our points/cosmetic shop is consumable IAP — a different distribution. Use as expectation-calibration, not forecast.

### 4. Health & Fitness is the best-monetizing subscription category — *high confidence*
- Revenue per install: **$0.48 (D14)**, **$0.66 (D60)** — vs Gaming $0.08/$0.14, all-categories $0.23/$0.34.
- Year-1 realized LTV per payer **~$35.64** (statistically tied with Business $35.48).
- Median D35 download-to-paid **2.9%**; top quartile **>6.2%** (execution roughly doubles it).
- 68% of revenue comes from annual plans; median download-to-trial 6.9%.
- **Implication:** the category rewards **install volume** at our scale — but note top-quartile conversion is >2x median, so conversion work is not irrelevant.

### 5. 🎯 The single best design lead: cosmetics must live OUTSIDE the app — *medium confidence (single source, 2-1 vote)*
Deconstructor of Fun teardown of Finch's home-screen widget describes four mechanics:
1. A **living pet display that reflects the user's own cosmetic choices** (clothing, accessories, room decor, environment)
2. **Appointment mechanics** — multi-hour "adventure" timers surfaced as *In Progress* / *Completed*
3. A **progress bar** for daily task completion
4. **Micro-events** anchored to natural daily transitions (morning check-in, friend visits)

**Direct implication for Muscle Hamster (inference):** our cosmetics only become *retention infrastructure* when visible outside the app. A home-screen **widget rendering the customized hamster** — plus today's steps eaten / hunger state — converts the shop from decoration into persistent daily presence. It composes naturally with step-feeding, and is **low-guilt compatible**: presence and progress, not streak-loss threat.

⚠️ Weaknesses: single industry blog, undated byline, could not confirm from Finch's own materials that cosmetics/progress bar render *in the widget* vs in-app. Treat as **design hypothesis worth testing**, not fact.

---

## ❌ REFUTED — do not rely on these
These are circulating publicly and sound authoritative. All failed verification:

- Finch **D1/D7 = 54%/37%**; Finch **2.34M downloads/90 days**; Finch **~$2M/month**
- The **Duolingo 110-day streak-loss → abandonment** anecdote
- **"Guilt demotivates"** / streak-loss warnings as **"dark nudges"**
- Intrinsic-vs-extrinsic motivation regression coefficients (β = 0.501 etc.)
- **"Gamification is a coin-flip for step counts"** / "76% of studies had no follow-up"
- **"Pet mechanics retain longer than leaderboards"**
- **"Hard paywalls convert 5x better"** (10.7% vs 2.1% D35)
- All Adapty funnel benchmarks: 9.5% install-to-trial, 42.2% trial-to-paid, **86.1% of conversions on Day 0**, $1.21 install LTV
- Health Connect **~2-week Google review lead time**
- Expo pedometer background-reconciliation claim
- §5.1.1(ii) constraint on permission-gated paid functionality

**⚠️ Our low-guilt positioning received NO evidence either way.** Every claim that would have supported "guilt/streak pressure backfires" was refuted. The positioning stands as a **product judgment** — currently neither validated nor contradicted.

---

## 🔍 OPEN QUESTIONS (unanswered)
1. Real D1/D7/D30 benchmarks for habit/pet apps — **no verified number exists**. We have no external target; only our own data can tell us.
2. Does low-guilt framing help, hurt, or not matter for retention? Unknown.
3. What converts in **cosmetic-IAP** health apps (as opposed to subscription)? No benchmark obtained.
4. ASO / cold-start growth — produced **zero** surviving claims. *(Second focused research pass launched June 2026.)*
5. Do Finch's widget mechanics genuinely render in the widget, and is the widget causal for retention or merely correlated with engaged users?

---

## 📋 RECOMMENDED SEQUENCE
1. **Instrument analytics.** Because no trustworthy public retention benchmarks exist in this category, our own data is the *only* reliable signal. (Hard constraint: **no health/step data in analytics events** — see §2.)
2. **iOS step auto-feed + home-screen widget rendering the customized hamster.** The highest-leverage surviving lead; composes with the already-planned step counter.
3. **Monetization later.** At current scale this is a volume problem, not a conversion-tuning problem.
4. **ASO/growth** — pending the focused second research pass.

---

*Full raw report with per-claim evidence, vote records, and source list was produced by the deep-research workflow run `wf_caf8cce1-c08`.*

---
---

# ASO / Growth — Second Focused Pass (June 2026)

**Method:** re-run restricted to Apple primary documentation. **Result: 18 of 25 claims confirmed** (vs 6/25 in pass 1). Restricting to first-party sources is what made the difference.

## ✅ VERIFIED MECHANICS (Apple's own docs — rely on these)

### Indexed fields
Apple: *"Search results are based on a number of factors, **including** text relevance (matches for your app's **title, subtitle, keywords, and primary category**), as well as user behavior (downloads, ratings and reviews...)."*
- ⚠️ "including" = **non-exhaustive**. These four are Apple-confirmed; it is NOT proof they're the only ones.
- **Description indexing is OPEN** — Apple never confirms or denies it, only warns against stuffing it.

### Character limits (App Store Connect Help, verbatim)
| Field | Limit |
|---|---|
| App Name | **2–30** chars |
| Subtitle | **30** chars |
| Keyword field | **100** chars total |
| Promotional text | **170** chars |

⚠️ 30 is the **entry** limit, not the **display** limit — search/home-screen truncate far earlier (~10 chars in some contexts). **Front-load distinctive words.**

### Keyword field syntax (Apple, verbatim)
- *"terms separated by commas and **no spaces**"*; spaces only **within** a phrase (`Property,House,Real Estate`)
- *"**Don't repeat any words** included in your app name, subtitle, or category."*
- Avoid, to save characters: plurals of words already present in singular · the word "app" · category names · duplicates · special characters (*"Special characters don't carry extra weight"*)
- These are Apple's **optimization guidance**, not validation-enforced.

### 🚨 Rejection risk (enforced policy, not guidance)
Apple: *"Improper use of keywords is a **common reason for App Store rejections**."* Disallowed: trademarked/celebrity/protected terms · irrelevant terms · **competing app names** · offensive terms.
→ **Do not put "Finch", "Tamagotchi", or rival app names in the keyword field.** That's a documented rejection trigger, not a growth hack.

### Promotional text
Apple: *"promotional text **doesn't affect your app's search ranking** so it should not be used to display keywords."*
→ It's a **conversion** field, and it updates **without submitting a new build** — ideal for a seasonal hook ("new outfit drop"), not keywords.

### Ratings & reviews
Apple states in two places that ratings *"can influence how your app ranks in App Store search"* — but publishes **no magnitude, threshold, or mechanism**. Verified as an acknowledged input only; do not upgrade this into "ratings are a weighted ranking factor."

### Review prompt rules (StoreKit / expo-store-review)
- System-controlled: *"isn't appropriate to call requestReview() ... in response to a button tap"*
- Max **three prompts per 365-day period**; developer cannot count, customize, or detect them
- Guideline 3.2.2(x): cannot **gate functionality** behind rating/reviewing
- Sanctioned alternative: a real "Rate us" link → product page URL with `?action=write-review`
- ⚠️ **Gotcha:** the prompt is **suppressed in TestFlight** but **always shows in dev builds** — you cannot validate real behavior via TestFlight.

### Product Page Optimization (PPO)
- Tests **visual creative ONLY** — app icon, screenshots, app previews. **Title, subtitle, keywords, description CANNOT be A/B tested.**
- Max 3 treatments; one test at a time; 90-day cap; iOS 15+; sticky assignment
- Winning **screenshots/previews auto-apply**; a winning **icon does not** (needs a new version)
- Cannot be combined with Custom Product Pages

### ⚠️ PPO is structurally unusable at our traffic
Apple recommends acting only at **≥90% confidence**, and ships a **"Likely to be Inconclusive"** status for tests that can't gather enough data in 90 days. The binding constraint is **impressions × baseline conversion rate**. At near-zero traffic, **do not start a PPO test blind** — open Apple's duration estimator first.

### Custom Product Pages (CPP)
Keywords can be assigned so the CPP is served instead of the default page for those queries — but keywords must come *"from your latest approved app version"*.
→ **CPPs redirect which page is shown; they do NOT expand the indexed keyword pool or add ranking.**

## ❌ STILL UNEVIDENCED (after TWO passes)
- **Cold start**: 0 → first few hundred organic downloads
- **Referral / social-sharing loops** in pet & habit apps
- **Underserved keyword space** in the virtual-pet + fitness niche

Failure modes: ASO-vendor blogs restating each other with no underlying measurement; indie case studies that are survivorship-biased single anecdotes (the launches that *failed* are never written up); keyword-volume figures from proprietary models with undisclosed methodology.

**Correct conclusion: not "these probably work" — but "no available source supports any specific cold-start or referral tactic here."** Treat any such plan as an untested hypothesis with an explicit kill criterion.

> 💡 The one real, free, trustworthy data source is **App Store Connect's own search-term impression/conversion reporting for your app** — use that over third-party volume estimates.

## 🔑 Highest-leverage OPEN question
**Do additional localizations (e.g. English UK/AU) give extra independent 100-char keyword fields that US users can match against?** No claim survived. If true it would multiply keyword characters at near-zero cost — worth resolving before other ASO effort.

Also unresolved: is the description indexed? Are **in-app purchase names** indexed (relevant — our cosmetic shop could name IAPs searchably)?

## 📋 WEEKEND CHECKLIST (verified mechanics only — no ranking promises)
1. **Audit the 100-char keyword field** — strip words already in name/subtitle/category, plurals of present singulars, "app", category names, special chars; re-comma with no spaces; **remove any competitor/trademarked name** (rejection risk).
2. **Fill Name + Subtitle to 30 chars** with distinct, non-overlapping words; front-load the distinctive ones.
3. **Move keywords out of promotional text**; use its 170 chars for a current hook (updates without a build).
4. **Ship a compliant review prompt** — `StoreReview.requestReview()` at a genuine success moment (streak milestone / first cosmetic unlock), never from a button, never gated; plus a separate "Rate us" link with `?action=write-review`. Test on a real device, not TestFlight.
5. **Don't start PPO blind** — check Apple's duration estimator; expect "Likely to be Inconclusive" at current traffic.

*Produced by deep-research workflow run `wf_94931241-17f`.*
