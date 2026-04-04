## UI Tokens & Interaction States (proposed baseline)

Goal: create a single mental model for spacing/typography/colors and define consistent states across the app.

### 1. Color Tokens (derive from existing palette)

Use these as a shared basis across marketing + platform:

- **Background**
  - `--ds-bg`: `#020617` (marketing / marketing shell)
  - `--ds-bg-elev`: `#080E1A` (platform app)
- **Text**
  - `--ds-text`: `#F8FAFC` (primary)
  - `--ds-text-muted`: `#E2E8F0` / `#94A3B8` (secondary)
  - `--ds-text-dim`: `#475569` (tertiary)
- **Accents**
  - `--ds-indigo`: `#818CF8`
  - `--ds-indigo-strong`: `#6366F1`
  - `--ds-green`: `#34D399`
  - `--ds-red`: `#EF4444`
- **Borders & Surfaces**
  - `--ds-border`: `rgba(255,255,255,0.08)` (generic)
  - `--ds-card`: `rgba(255,255,255,0.02..0.04)` (glassy card)
  - `--ds-card-glass`: `rgba(6,8,20,0.65)` (thank-you style)

### 2. Typography Tokens

- **Sans**: `Manrope` / `Outfit` (marketing + platform)
- **Mono**: `JetBrains Mono`
- **Base**
  - `body`: 15–17px on marketing, 13–14px on platform (current)
  - `small`: 11–12px for mono labels
- **Heading**
  - Use `clamp()` for landing; convert fixed sizes in platform to `clamp()` where feasible for mobile consistency.

### 3. Spacing Scale (proposed)

Adopt a consistent spacing scale to replace ad-hoc `padding: "14px 20px"` etc.

- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-7`: 28px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px

### 4. Radius Tokens & Shadows

- `--radius-sm`: 8px (inputs, small pills)
- `--radius-md`: 10px (buttons, cards)
- `--radius-lg`: 14–16px (feature/testimonial cards)
- `--radius-xl`: 18–20px (big glass surfaces)
- Shadows
  - `--shadow-soft`: subtle glow/border (cards)
  - `--shadow-primary`: `0 8px 28px rgba(99,102,241,0.45)` used in CTAs

### 5. Component States (must be consistent across CTAs/buttons/inputs)

#### Buttons
- **Default**: background + border + text
- **Hover**: slightly brighter background/border; do not rely only on mouse events
- **Active/Pressed**: reduce elevation (`transform: translateY(1px)` or shadow change)
- **Disabled**: reduce opacity + `cursor: not-allowed`; keep contrast acceptable
- **Focus-visible**: `outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.35);`

#### Links
- **Default**: muted text; on hover brighten
- **Focus-visible**: same ring as buttons

#### Inputs / Textareas
- **Default**: border and background
- **Focus-visible**: ring color consistent with indigo
- **Error**: border red + error text `aria-live`
- **Success (optional)**: green border + confirm message

#### Expandable / Toggle States
- **Collapsed**: aria-expanded=false
- **Expanded**: aria-expanded=true + visible expanded affordance (border, icon, or microcopy)

#### Empty / Error / Loading Patterns
- **Loading**: show spinner/skeleton or text “Loading…” with disabled controls
- **Error**: headline + single-line explanation + next step (“Try again” / “Check setup”)
- **Empty**: friendly state with CTA to proceed

### 6. Accessibility Minimums

- **Touch targets**: ensure all buttons/tappable items satisfy ~44px height on mobile.
- **Keyboard**: every interactive element must be reachable via tab and operable with Enter/Space.
- **ARIA**: use `aria-label` / `aria-describedby` for form controls; `aria-expanded` for toggles; `aria-live` for status messages.

