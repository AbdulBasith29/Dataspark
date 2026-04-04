## UX Issues by Severity — prioritized for impact

This backlog is derived from scanning:
- `src/app/landing-page.jsx`
- `src/app/dataspark-platform.jsx`
- `src/pages/PageShell.jsx` + marketing pages (`PreviewPage`, `ThankYouPage`, `ContactPage`, `PrivacyPage`, `TermsPage`)

### SEV 0 — Conversion blockers / critical accessibility

1. **No robust announcement for waitlist error/success messaging**
   - **Where**: `WaitlistCTA` (landing waitlist form).
   - **Problem**: Error message exists visually, but nothing guarantees screen readers announce it when it appears. Success state also changes content without `aria-live`.
   - **Impact**: Users relying on assistive tech may miss the result of their primary action.
   - **Fix**: Add an `aria-live="polite"` wrapper for error/success message; ensure the input/button have proper `aria-describedby` linkage.

2. **Clickable content implemented as `onClick` on non-semantic elements**
   - **Where**: Platform app uses `div` cards with `onClick` (course cards, lesson items, question items).
   - **Problem**: These are not keyboard-activatable by default (Enter/Space). They also lack `role="button"` and key handlers.
   - **Impact**: Accessibility and usability regression for keyboard users; potentially harms engagement/conversion for “trial into platform”.
   - **Fix**: Convert cards to `<button>` where possible, or add `role="button"`, `tabIndex=0`, and `onKeyDown` handlers for Enter/Space. Provide `aria-label` with context.

3. **Focus visibility is inconsistent across surfaces**
   - **Where**: Landing relies on custom `input:focus` styling but many buttons/links do not have explicit `:focus-visible` styling. Some interactive elements use JS hover styles only.
   - **Impact**: Keyboard users may not clearly see focus, especially on secondary CTAs and platform buttons.
   - **Fix**: Add a global `:focus-visible` style consistent with the token palette (e.g., indigo ring).

### SEV 1 — High impact polish (conversion + interaction quality)

4. **No clear loading affordance on secondary buttons**
   - **Where**: Landing waitlist button shows “Joining...”, but other CTAs (Preview route, share native/copy) don’t show busy states.
   - **Impact**: Users may double-tap; increases perceived friction.
   - **Fix**: Add lightweight busy state for copy/share and any network-driven CTAs. Disable while busy.

5. **CTA hierarchy could be more explicit in secondary cards**
   - **Where**: Landing “HeroCard” toggle uses two buttons but lacks `aria-pressed`/semantic state. Feature cards toggle “micro-proof” but are still buttons without clear pressed/expanded semantics.
   - **Impact**: Some users may not understand which surface is currently expanded/toggled.
   - **Fix**: Use `aria-expanded`, `aria-controls` for toggles and set visible “expanded” styles.

6. **Error messaging is excellent for builders but may overwhelm end-users**
   - **Where**: `waitlistErrorMessage` on landing.
   - **Impact**: Some error strings include operational detail; still correct, but can reduce conversion if users hit an error and feel confused.
   - **Fix**: Keep the detailed builder text in a collapsible “Need help?” area; show a short, friendly user-facing headline.

### SEV 2 — Medium impact (consistency, mobile comfort)

7. **Touch target sizing needs verification on 320–430px**
   - **Where**: Landing uses 10px/11px mono labels and some chips; some buttons use padding but font sizes vary.
   - **Impact**: Small tap targets can cause mis-taps.
   - **Fix**: Ensure all primary/secondary actions meet ~44px height or equivalent padding; increase vertical padding for small buttons and tabs.

8. **Mixed layout languages between marketing and platform**
   - **Where**: `landing-page` vs `dataspark-platform` use different max widths and card radii/borders.
   - **Impact**: The transition from marketing to product can feel less “premium cohesive”.
   - **Fix**: Define shared tokens (`P`) in a single place and use consistent spacing/radius/shadows.

9. **Marquee / animations without reduced-motion fallback**
   - **Where**: Landing marquee uses CSS animation, hero has animations.
   - **Impact**: Motion sensitivity issues.
   - **Fix**: Add `@media (prefers-reduced-motion: reduce)` to disable marquee/looping effects.

### SEV 3 — Low impact (readability and content structure)

10. **External link intent clarity**
   - **Where**: Footer links open in new tabs but link labels are not marked.
   - **Impact**: Minor accessibility/expectation mismatch.
   - **Fix**: Add “(opens in new tab)” for external links or visually indicate.

11. **Form placeholder vs label usage**
   - **Where**: Landing email input uses placeholder but no visible label.
   - **Impact**: Screen readers need explicit label associations.
   - **Fix**: Add an accessible `<label>` (even if visually hidden) and link via `htmlFor`/`id`.

