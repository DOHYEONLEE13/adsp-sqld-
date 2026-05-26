# QuestDP Google Play / TWA App Plan

Last updated: 2026-05-26

## Summary

QuestDP Android app should start as a **Trusted Web Activity (TWA)** app.

The web app remains the main product:

- Web users enter through `https://quest-dp.com/`
- Android app users enter through an app-only route such as `https://quest-dp.com/app`
- Most content, UI, SQLD lesson fixes, and screenshots update through the normal flow:
  `GitHub push -> Cloudflare deploy -> app reflects the new web build`
- Native app metadata changes still require a new Google Play upload.

This means QuestDP can keep the SEO/GEO web structure while shipping a mobile-first app experience.

## Core Decision

Use this split:

```txt
quest-dp.com/
  Web landing page, SEO pages, blog, pricing, Toss web payment

quest-dp.com/app
  Android app entry
  immediately opens onboarding/login/game
  no landing page
  no blog-first flow
  no Toss payment flow inside app
```

The app should not remove the landing page from the website. It should only skip it inside the Google Play app.

## App Entry Behavior

Recommended app start URL:

```txt
https://quest-dp.com/app
```

`/app` should:

1. Mark the session as app mode.
2. Replace the current browser history entry with the game/onboarding route.
3. Open `/#/game`, login, or onboarding depending on auth state.

Important:

- Use `replace`, not a normal push navigation.
- In simple terms, `replace` swaps the temporary `/app` entry with the game screen.
- This prevents Android back button from going back to the landing page.

Expected behavior:

```txt
Android app icon tap
-> /app
-> replace to /#/game or onboarding
-> back button exits app or follows in-game back behavior
```

## Update Model

### Updates that usually need only web deployment

These should update through the current GitHub/Cloudflare flow:

- SQLD/ADSP concept copy
- Problem content
- Lesson UI
- Game screens
- Quest/Friends/Weakness/Profile screens
- Store screenshot source screens
- Most CSS and frontend fixes

Flow:

```txt
edit code
-> commit
-> push to GitHub main
-> Cloudflare deploy
-> Android TWA shows new web version
```

### Updates that require a new Google Play app release

These require a new Android App Bundle (`.aab`) upload:

- App name
- Launcher icon
- Splash screen
- Package name
- Native permissions
- TWA start URL or Android manifest changes
- Play Billing native/TWA integration config
- Deep link / asset links config changes

## Payment Policy

QuestDP must support payment inside the Android app, but this has to be handled carefully.

Recommended split:

```txt
Web payment
  Toss Payments
  available on quest-dp.com web

Android app payment
  Google Play Billing
  available inside Google Play-distributed app

Supabase entitlement
  single source of truth for premium access
```

Do not route Android app users to Toss for digital premium features unless the policy has been reviewed and confirmed safe.

Google Play policy says apps distributed on Google Play that sell access to in-app digital features or services generally must use Google Play's billing system for those purchases.

TWA billing path:

- Use Digital Goods API + Payment Request API in TWA.
- Payment method identifier: `https://play.google.com/billing`
- Product SKUs should map to Supabase premium entitlements.
- Backend must verify purchases and update premium status.

Minimum backend concept:

```txt
Google Play purchase
-> verify purchase / subscription state
-> write entitlement to Supabase
-> app reads premium from Supabase snapshot
```

## Supabase Entitlement Model

Keep one premium source of truth regardless of where the user paid.

Suggested normalized fields/table:

```txt
profiles
  pass_tier
  premium_until
  premium_source: web_toss | google_play | coupon | admin

subscriptions / payments
  user_id
  provider
  provider_order_id / purchase_token
  product_id
  status
  purchased_at
  expires_at
  raw_payload
```

Rules:

- Web purchase and Play purchase both unlock the same app features.
- Coupon users should also unlock the same premium gates.
- App UI must not rely on local-only premium state.

## Logo / Icon Work

There are separate logo targets:

1. Web logo
   - Landing page
   - Header
   - favicon
   - OG images

2. Android launcher icon
   - The icon shown on the phone home screen.

3. Google Play store icon
   - Required for Play listing.
   - Official requirement: 512 x 512, 32-bit PNG with alpha, max 1024 KB.

Logo direction:

- Use QuestDP's astronaut mascot identity.
- Avoid cheap text-heavy badges.
- Avoid price/ranking/promotional words in icon art.
- Icon should still read clearly at small size.

## Google Play Store Images

Use actual app screenshots first. Generated marketing art can support, but screenshots should show the real product.

Recommended screenshot set:

1. Learning roadmap
   - Shows ADSP/SQLD progression.
   - Message: game-like certification roadmap.

2. Concept lesson
   - Shows mascot + short concept + progress.
   - Message: learn one small idea at a time.

3. SQL puzzle
   - Shows card/puzzle style SQL interaction.
   - Message: SQLD grammar is practiced actively.

4. Daily quests
   - Shows daily missions and review.
   - Message: the app tells you what to do today.

5. Weakness page
   - Shows weak topics.
   - Message: find what to review.

6. Friends page
   - Shows leaderboard/friend tag.
   - Message: compare progress with friends.

7. Profile / avatar
   - Shows mascot customization and learning identity.

8. Pricing or premium gate
   - Only if Play Billing is ready.
   - Avoid confusing Toss/web-only payment screenshots inside the Android listing.

Official Play screenshot requirements to respect:

- Minimum 2 screenshots.
- JPEG or 24-bit PNG, no alpha.
- Minimum dimension: 320 px.
- Maximum dimension: 3840 px.
- Long side cannot be more than 2x the short side.

Highly recommended for promotion eligibility:

- At least 4 screenshots.
- Portrait screenshots should be 9:16 and at least 1080 x 1920.
- Screenshots should depict actual in-app experience.

Feature graphic:

- Required for many Play surfaces.
- 1024 x 500.
- JPEG or 24-bit PNG, no alpha.
- Should communicate app experience, not just logo duplication.
- Avoid tiny details and excessive text.

Feature graphic concept:

```txt
Dark space background
QuestDP mascots
Crystal/planet learning world
Subtle UI cards from roadmap or SQL puzzle
Short value line only if needed
```

Avoid:

- "No.1"
- "Free"
- "Best"
- "Install now"
- pricing/ranking/promotional badges

## Store Listing Copy

Short description should be clear and policy-safe.

Candidate short description:

```txt
ADsP와 SQLD를 게임처럼 따라가는 자격증 학습 앱
```

Candidate full description structure:

```txt
QuestDP는 ADsP와 SQLD 자격증을 게임처럼 공부할 수 있는 학습 앱입니다.

짧은 개념을 보고 바로 문제로 확인합니다.
로드맵을 따라가며 챕터를 끝내고, 오늘의 퀘스트와 약점 복습으로 다시 익힙니다.

주요 기능
- ADsP, SQLD 학습 로드맵
- 개념 스텝 + 확인 문제
- SQL 문법 조립형 문제
- 오늘의 퀘스트
- 약점 분석
- 친구 XP 비교
```

Do not overclaim pass guarantees.

Avoid:

- "무조건 합격"
- "최고"
- "1위"
- unsupported official affiliation claims
- KData official-looking wording unless legally verified

## Today Checklist

### P0 - Before app packaging

- Finish current SQLD content corrections.
- Confirm no lesson/question fails with "문제를 불러오지 못했어요".
- Ensure added `quizId` and `extraQuizIds` exist both locally and in Supabase if server-backed.
- Run:

```bash
npm run typecheck
npm test -- --run
npm run build
```

### P1 - App entry

- Add `/app` route.
- In `/app`, use replace navigation to game/onboarding.
- Add app-mode detection.
- Hide web-only landing/pricing/blog flows inside app mode.
- Ensure Android back button does not land on the marketing homepage.

### P2 - Play Billing planning

- Define Google Play product IDs.
- Map product IDs to QuestDP premium tiers.
- Add Supabase entitlement fields/table if missing.
- Implement purchase verification path before public launch.
- Keep Toss only for web flow.

### P3 - Branding assets

- Replace logo direction if needed.
- Prepare:
  - Play icon: 512 x 512 PNG
  - Feature graphic: 1024 x 500
  - Phone screenshots: at least 4, ideally 6-8, 1080 x 1920 portrait

### P4 - TWA packaging

- Generate Android/TWA project.
- Set package name.
- Set app name.
- Set icons/splash.
- Configure Digital Asset Links (`assetlinks.json`).
- Build `.aab`.
- Upload to internal testing track first.

### P5 - Store submission

- Fill app details.
- Add privacy policy.
- Complete Data safety.
- Add screenshots and feature graphic.
- Add Play Billing products if paid features are active.
- Run internal test.
- Submit to review.

## Do Not Do

- Do not remove the web landing page.
- Do not make the Android app start at the web pricing page.
- Do not send app users to Toss for digital premium checkout unless explicitly policy-reviewed.
- Do not use fake or generated screenshots if real app screenshots are available.
- Do not claim official KData partnership unless legally true.
- Do not promise exam pass results.

## Official References

- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/1078870
- Google Play payments policy: https://support.google.com/googleplay/android-developer/answer/9858738
- Google Play Billing for TWA: https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing

