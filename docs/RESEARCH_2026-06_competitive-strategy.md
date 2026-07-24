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
