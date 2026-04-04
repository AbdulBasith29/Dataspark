## UI Optimization Backlog (prioritized by conversion impact)

This is an action plan translating the audit + issues list into implementation-sized work items.

### P0 (Conversion first) — implement before aesthetic polish

1. **Add `aria-live` and `aria-describedby` to waitlist form statuses**
   - **Files**: `src/app/landing-page.jsx` (`WaitlistCTA`)
   - **What**:
     - Wrap error message and success message in a container with `aria-live="polite"`.
     - Give the email input an `aria-describedby` pointing to the current status element id.
     - Consider a short user-facing error headline + detailed “builder help” hidden behind a collapsible.
   - **Why**: Ensures the primary CTA result is communicated to assistive tech.

2. **Make platform interactive “cards” keyboard operable**
   - **Files**: `src/app/dataspark-platform.jsx`
   - **What**:
     - Replace `div` clickable cards with `<button>` elements where layout allows.
     - If retaining `div`, add `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space.
     - Add descriptive `aria-label` (e.g., course title + action).
   - **Why**: Prevents keyboard users from getting blocked entering the learning loop.

3. **Add consistent `:focus-visible` ring for all interactive elements**
   - **Files**: both `src/app/landing-page.jsx` and `src/app/dataspark-platform.jsx` (global style blocks)
   - **What**:
     - Add global `button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible { ... }`
   - **Why**: Improves accessibility and usability for “premium” feel.

### P1 (High impact UX polish)

4. **Add busy/disabled states for share/copy and secondary CTAs**
   - **Files**: `src/app/landing-page.jsx` (waitlist preview CTAs + mission buttons), `src/pages/ThankYouPage.jsx`
   - **What**:
     - Disable while copying/sharing; show “Copying…” / “Sharing…” text.
   - **Why**: Removes double-tap friction and improves perceived responsiveness.

5. **Improve toggle semantics (`aria-expanded`, `aria-controls`)**
   - **Files**: `src/app/landing-page.jsx`
   - **What**:
     - For `HeroCard` mode tabs and `FEATURE_PROOFS` micro-proof expansion, set `aria-expanded`.
   - **Why**: More understandable states, better screen-reader UX.

6. **Reduce motion support**
   - **Files**: `src/app/landing-page.jsx`
   - **What**:
     - `@media (prefers-reduced-motion: reduce)` to disable marquee + looping animations.
   - **Why**: Accessibility compliance and comfort.

### P2 (Mobile comfort + consistency)

7. **Verify and tune touch target sizes (~44px)**
   - **Files**: `src/app/landing-page.jsx`, `src/app/dataspark-platform.jsx`
   - **What**:
     - Increase padding/line-height on tabs, toggle buttons, and chips where needed.
   - **Why**: Prevents mis-taps on 320–430px.

8. **Introduce shared UI constants to reduce “token drift”**
   - **Files**: refactor across both app entry files and shell pages
   - **What**:
     - Centralize `P` palette + spacing/radius into shared module (e.g. `src/styles/tokens`).
   - **Why**: Keeps future changes consistent and premium.

### P3 (Lower impact / long-tail)

9. **External link clarity**
   - **Files**: `src/app/landing-page.jsx` footer
   - **What**: Append “↗” or “(opens new tab)” for external URLs.

10. **Form label improvements (email waitlist + contact page)**
   - **Files**: `src/app/landing-page.jsx`, `src/pages/ContactPage.jsx`
   - **What**: Ensure each input has a proper `<label>` association (or `aria-label` when labels are visually hidden).

---

## Definition of Done (acceptance criteria)

- **No broken layout on mobile** (verify on 320px and 430px widths).
- **All primary actions have clear states** (default/hover/focus/loading/error/success).
- **Conversion-first prioritization**: waitlist + platform entry states come before purely aesthetic polish.

