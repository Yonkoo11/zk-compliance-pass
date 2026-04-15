# Design Research Brief

## Product Category: ZK Privacy / Compliance DeFi

## Comparables Studied: Railgun (Railway Wallet), Aztec (zk.money), Tornado Cash, World (Worldcoin)

---

### COMPARABLE: Railgun (Railway Wallet)
**URL:** https://railway.xyz
**Layout:** Mobile-first wallet with bottom tab nav (Balances, dApps, Activity, Settings). Desktop: centered single-column card layout, max-width ~480px. Left-right hero on marketing site. No sidebar.
**Color:** Dark mode only. Deep navy/charcoal background. Blue-purple accent tones. Shield iconography throughout. Professional, muted palette avoiding neon.
**Typography:** System sans-serif stack. Medium density. Clear hierarchy between balance numbers (large, bold) and labels (small, muted gray).
**Key interaction:** "Shield/Unshield" toggle as the core action. Users switch between public and private (0zk) address modes. Proof generation is abstracted away, no visible progress bar. Swap interface mirrors Uniswap-style token pair selector.
**Information hierarchy:** Balance first, actions second, history third. Complexity hidden behind "Advanced" toggles. Compliance section (Proof of Innocence) tucked into settings rather than front-and-center.
**Signature element:** The 0zk address prefix as visual shorthand for "you're in private mode." Green shield icon when funds are shielded.
**What works:** Privacy feels like a toggle, not a workflow. The shield/unshield metaphor is immediately understood. Compliance (Proof of Innocence) exists but doesn't dominate.
**What doesn't:** Desktop web experience is weak since it's mobile-first. No visual feedback during ZK proof generation (just a spinner). Marketing site undersells the app quality.
**Steal this:** Shield/unshield as a single toggle action, not a multi-step flow. Private mode as a "state" the wallet is in, not a separate feature.

---

### COMPARABLE: Aztec (zk.money)
**URL:** https://zk.money (now sunset)
**Layout:** Single-page centered card. ~440px max-width content area on white/dark background. Top nav with just logo + wallet connect. Extremely minimal. No sidebar, no tabs beyond Deposit/Withdraw.
**Color:** Dark background with purple/violet accents (#865ff3 range). Clean white text. Minimal color usage; purple only for CTAs and active states. Near-monochrome.
**Typography:** Clean sans-serif (Inter or similar). Low density. Generous whitespace. 14-16px body, large balance numbers.
**Key interaction:** "Shield" deposits ETH into zkETH with a single button. Proof generation happens silently in background. Username-based receiving (like email). Multiple wallet signatures during onboarding abstracted into a flow.
**Information hierarchy:** Radical simplicity. One number (your shielded balance), one action (shield more or send). Nothing else on screen. "You can't get lost because it's pretty straightforward."
**Signature element:** The transformation visual: ETH becomes zkETH. Your assets change form when they enter the private zone.
**What works:** Best-in-class simplicity. The "you can't get lost" factor. Proof generation invisible to user. Minimum viable interface.
**What doesn't:** Too minimal for power users. No transaction history on main screen. Shutdown proved fragile centralized infrastructure. No compliance story at all.
**Steal this:** Single-number dashboard. One balance, one primary action. Hide everything else until needed. `max-width: 440px` centered card as the entire app.

---

### COMPARABLE: Tornado Cash
**URL:** https://github.com/tornadocash/tornado-classic-ui (open source, archived)
**Layout:** Centered card layout (~440px). Tab navigation: Deposit | Withdraw. Stats panel as secondary card to the right on desktop. Top nav with logo + network selector + wallet connect. Vue/Nuxt + Bulma/Buefy.
**Color:** Pure dark. `$primary-invert: #000403` (near-black background). `$primary: #94febf` (mint green accent). `$dark: #171717` (card surfaces). `$grey-lighter: #393939` (borders). `$danger: #ff0658` (warnings). `$violet: #865ff3`. `$warning: #ff8a00`. Loading bar: `#94febf` on `#000` background.
**Typography:** `PT Mono`, monospace. 14px base. Font-weight 400/700 only. Monospace gives hacker/cypherpunk feel. Low density with generous padding (`1.5rem` box padding).
**Key interaction:** Deposit tab: select token + denomination from fixed set (0.1/1/10/100 ETH). Click deposit. Save secret note. Withdraw tab: paste note, get funds. Proof generation shown via green progress bar (`#94febf`, 5px height, 5s duration).
**Information hierarchy:** Two-tab binary: you either deposit or withdraw. Token/amount selection via radio buttons (not free-form input). Stats (anonymity set size) shown alongside but clearly secondary. Compliance tool exists as separate tab.
**Signature element:** The mint-green-on-black color scheme. Floating astronaut mascot. The "secret note" as a tangible artifact of the ZK proof. Monospace font reinforcing the cryptographic vibe.
**What works:** Fixed denominations remove decision fatigue. The secret note gives users something concrete to hold. Color scheme is instantly recognizable. Tab-based binary choices keep it simple.
**What doesn't:** Monospace font hurts readability for non-technical users. Fixed denominations limit flexibility. No mobile optimization. "Secret note" UX is error-prone (users lose notes).
**Steal this:** The exact color scheme is gold: `background: #000403; accent: #94febf; surface: #171717; border: #393939; text: #eeeeee`. Fixed-denomination deposits as radio buttons instead of free-form input. Green progress bar for proof generation.

---

### COMPARABLE: World (Worldcoin)
**URL:** https://world.org / World App
**Layout:** Mobile super-app pattern. Tab bar navigation (Home, Wallet, Discover, Profile). Card-based content areas. Marketing site: full-viewport hero with video background, responsive grid (`layout-container-2xl` system). Mini-apps ecosystem inside the main app.
**Color:** Light mode default, dark mode supported. Neutral sophisticated palette. Off-white backgrounds (`bg-gray-a10`). Black text (`text-gray-a1`). Minimal accent color; relies on the Orb's metallic silver/chrome as brand color. `theme-color: black` for dark contexts. White CTAs on dark backgrounds.
**Typography:** Custom "World Pro" variable font (`WorldProMVPVF-v2.ttf`). Hierarchical scale: `text-h1` through `text-h5`, `text-b1` through `text-b4`. Optimized letter-spacing. Clean, modern, Apple-influenced. Mini-apps UI kit uses Nunito Sans (400/700).
**Key interaction:** Identity verification is physical (Orb iris scan), then digital proof follows. World ID credentials stored on-device. "Verify" as a single-tap action in apps. NFC passport scanning for additional credentials. Proof of personhood as a reusable credential.
**Information hierarchy:** Identity status first (verified/not), then wallet, then ecosystem apps. Progressive disclosure: simple top-level, complexity in sub-screens. Card-based layout with icon + title + description pattern. `gap-y-7, gap-x-10` spacing.
**Signature element:** The Orb device as physical-to-digital bridge. Chrome/metallic visual language. The concept of "proof of personhood" as a product category.
**What works:** Identity verification feels premium and trustworthy. The super-app model means users don't leave. Credential reuse across mini-apps is powerful. Design feels Apple-tier polished.
**What doesn't:** Orb requirement creates massive friction for onboarding. Privacy messaging is undermined by iris scanning optics. Desktop web experience is marketing-only; all real utility is mobile-locked. Overkill for single-purpose compliance.
**Steal this:** Verification status as a persistent visual badge/indicator. The credential-as-card pattern (showing what you've proven without revealing data). Custom easing functions: `ease-impulse` for snappy micro-interactions, `duration-100` transitions. `rounded-full` pill buttons for primary CTAs.

---

## Common Patterns (table stakes)
- Dark mode as default (3/4 use dark primary)
- Centered single-card layout, max-width 440-480px
- Wallet connect button in top-right corner
- Network/chain selector in header
- Minimal navigation (2-4 items max)
- "Shield" as the universal metaphor for privacy
- Proof generation abstracted away from user (no raw ZK jargon)
- Monochrome base with single accent color

## Differentiation Opportunities
- **Compliance as feature, not afterthought.** Every competitor hides compliance or adds it later. zkGate can make "provably compliant" the hero message, not "private."
- **Proof generation transparency.** Everyone hides the ZK proof step. Show it as a premium moment: animated progress with stages (generating witness, computing proof, verifying). Make the wait feel like security, not lag.
- **Dual-state dashboard.** Show both public identity status AND private vault position in one view. No competitor shows the bridge between compliance and privacy simultaneously.
- **HashKey Chain identity.** Leverage the regulated chain's brand trust. Competitors operate on permissionless chains with no institutional credibility.

## Anti-patterns to Avoid
- Monospace fonts for non-technical audiences (Tornado Cash readability problem)
- Hiding compliance features in settings (Railgun buries Proof of Innocence)
- "Secret note" patterns that shift backup responsibility to users
- Too-minimal interfaces that give no feedback during proof generation
- Mobile-only experiences with no desktop story
- Marketing sites that don't match app quality

## Stolen Elements
- **From Tornado Cash:** Color system `bg: #000403, accent: #94febf, surface: #171717, border: #393939`. Green progress bar for proof generation. Fixed-denomination deposit selector as radio buttons.
- **From zk.money:** Single-balance centered card as entire app surface. Max-width 440px. Radical action reduction (one primary CTA visible at a time).
- **From Railgun:** Shield/unshield as toggle state, not multi-step wizard. Privacy as a "mode" indicator in the header.
- **From World:** Verification badge as persistent status indicator. Credential-as-card pattern. Pill-shaped primary CTAs with `rounded-full`. Snappy `100ms ease` micro-interactions.
