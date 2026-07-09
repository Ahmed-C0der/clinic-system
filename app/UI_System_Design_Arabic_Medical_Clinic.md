# UI System Design — Professional Arabic Medical Clinic
> RTL-first design system for a clean, trustworthy clinical environment

---

## 1. Color Palette

A professional teal-based palette balancing clinical cleanliness with a welcoming atmosphere.

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1a6b5a` | Brand identity, main navigation, structural elements |
| `accent` | `#2dbfa0` | Primary CTAs, highlights, success states |
| `surface` | `#fcf8fb` | Page background — soft warm off-white to reduce eye strain |
| `on-surface` | `#1c1c1e` | Body text — near-black charcoal for maximum contrast |

### Extended States (derived)

| Token | Derived From | Purpose |
|---|---|---|
| `primary-dark` | `#1a6b5a` darkened ~10% | Hover/active on primary buttons |
| `accent-light` | `#2dbfa0` at 15% opacity | Tinted backgrounds, selected rows |
| `error` | `#c0392b` | Form validation errors, critical alerts |
| `warning` | `#e67e22` | Appointment conflicts, low-stock alerts |
| `success` | `#2dbfa0` | Confirmation states (aligns with accent) |
| `border` | `#e0dce5` | Dividers, input borders, card outlines |

---

## 2. Typography

A dual-font strategy optimised for modern Arabic screen interfaces.

### Font Families

| Role | Font | Fallback | Notes |
|---|---|---|---|
| Headings | `Noto Kufi Arabic` | `serif` | Geometric Kufi — clean, authoritative, modern |
| Body & Labels | `Tajawal` / `IBM Plex Arabic` | `sans-serif` | Optimised for dense screen legibility |

### Type Scale

| Level | Size | Weight | Line-Height | Usage |
|---|---|---|---|---|
| `display` | 32px / 2rem | 700 | 1.25 | Hero headlines, page titles |
| `h1` | 28px / 1.75rem | 700 | 1.3 | Section headings |
| `h2` | 22px / 1.375rem | 600 | 1.35 | Sub-section headings |
| `h3` | 18px / 1.125rem | 600 | 1.4 | Card titles, panel headers |
| `body-lg` | 16px / 1rem | 400 | 1.6 | Primary body text |
| `body-sm` | 14px / 0.875rem | 400 | 1.55 | Secondary text, captions |
| `label` | 12px / 0.75rem | 500 | 1.4 | Form labels, table headers, tags |
| `micro` | 11px / 0.6875rem | 400 | 1.3 | Timestamps, footnotes |

> **Note:** All text elements must include `font-feature-settings: "kern" 1` and `text-rendering: optimizeLegibility` for Arabic shaping quality.

---

## 3. Design Tokens

### Spacing

Based on an 8px base unit. Use multiples for consistent rhythm.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps (icon padding, tight labels) |
| `space-2` | 8px | Inline element gaps |
| `space-3` | 12px | Compact component padding |
| `space-4` | 16px | Standard component padding |
| `space-5` | 24px | Card padding, section gutters |
| `space-6` | 32px | Between sections |
| `space-8` | 48px | Page-level vertical rhythm |
| `space-10` | 64px | Hero / large breakpoints |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `ROUND_NONE` | 0px | Hard-edged decorative elements |
| `ROUND_FOUR` | 4px | Badges, small tags |
| `ROUND_EIGHT` | **8px** | **Buttons, cards, input fields** ← primary token |
| `ROUND_TWELVE` | 12px | Modal dialogs, large panels |
| `ROUND_FULL` | 9999px | Pills, avatar chips |

### Elevation (Shadows)

| Token | CSS Value | Usage |
|---|---|---|
| `shadow-none` | `none` | Flat surfaces |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Cards, interactive tiles |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Dropdowns, date pickers |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, sidesheets |
| `shadow-focus` | `0 0 0 3px rgba(45,191,160,0.35)` | Keyboard focus ring (accent colour) |

### Motion

| Token | Value | Usage |
|---|---|---|
| `duration-fast` | 100ms | Micro-interactions (toggles, checkboxes) |
| `duration-base` | 200ms | Button hover, tab transitions |
| `duration-slow` | 350ms | Modal open/close, page transitions |
| `easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | All standard transitions |

---

## 4. Layout & Grid

### RTL Directionality

- Document direction: `dir="rtl"` on `<html>` element
- Use logical CSS properties: `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`
- Icons with directional meaning (arrows, carets) must be mirrored for RTL

### Breakpoints

| Name | Min Width | Columns | Gutter | Use Case |
|---|---|---|---|---|
| `xs` | 0px | 4 | 16px | Mobile portrait |
| `sm` | 480px | 4 | 16px | Mobile landscape |
| `md` | 768px | 8 | 24px | Tablet |
| `lg` | 1024px | 12 | 24px | Desktop |
| `xl` | 1280px | 12 | 32px | Large desktop |

### Page Templates

| Template | Layout | Target Page |
|---|---|---|
| Patient Portal | Single-column centred, max-width 720px | Appointments, forms |
| Dashboard | Fixed sidebar (260px) + fluid content | Admin, doctor view |
| Data Table | Full-width with sticky header | Patient records, billing |
| Modal / Dialog | Centred overlay, max-width 560px | Confirmations, quick entry |

---

## 5. Component Specifications

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `#1a6b5a` | `#ffffff` | none | `primary-dark` |
| `secondary` | transparent | `#1a6b5a` | `1px solid #1a6b5a` | `accent-light` bg |
| `accent` | `#2dbfa0` | `#ffffff` | none | darken 8% |
| `ghost` | transparent | `#1c1c1e` | none | `border` bg |
| `danger` | `#c0392b` | `#ffffff` | none | darken 8% |
| `disabled` | `#e0dce5` | `#9e9e9e` | none | no change |

- Height: 40px (default), 32px (compact), 48px (large)
- Border radius: `ROUND_EIGHT` (8px)
- Padding: `space-4` horizontal (16px)
- Font: `label` size, weight 600

### Form Inputs

- Border: `1px solid #e0dce5`
- Border radius: `ROUND_EIGHT` (8px)
- Focused border: `2px solid #2dbfa0` + `shadow-focus`
- Error border: `2px solid #c0392b`
- Height: 44px (touch-friendly for clinical tablet use)
- Background: `#ffffff`
- Placeholder colour: `#9e9e9e`
- Text alignment: `right` (RTL default)

### Cards

- Background: `#ffffff`
- Border: `1px solid #e0dce5`
- Border radius: `ROUND_EIGHT` (8px)
- Shadow: `shadow-sm`
- Padding: `space-5` (24px)

### Navigation (Sidebar)

- Background: `#1a6b5a`
- Active item background: `rgba(255,255,255,0.12)`
- Active item indicator: `3px solid #2dbfa0` on the inline-end edge
- Icon + label gap: `space-2` (8px)
- Item height: 48px
- Font: `body-sm`, weight 500, colour `#ffffff`

### Data Tables

- Header background: `#f4f1f7` (slightly deeper than surface)
- Header font: `label` size, weight 600, colour `#1c1c1e`
- Row height: 52px
- Hover row: `accent-light` tint
- Selected row: `rgba(45,191,160,0.12)` background
- Border: `1px solid #e0dce5` between rows
- Text alignment: `right` (RTL)

### Badges / Status Pills

| Status | Background | Text |
|---|---|---|
| Active / Confirmed | `rgba(45,191,160,0.15)` | `#1a6b5a` |
| Pending | `rgba(230,126,34,0.15)` | `#c05a00` |
| Cancelled | `rgba(192,57,43,0.12)` | `#c0392b` |
| Completed | `rgba(26,107,90,0.10)` | `#1a6b5a` |

- Border radius: `ROUND_FULL` (pill)
- Padding: `space-1` vertical, `space-3` horizontal
- Font: `label` size, weight 600

---

## 6. Iconography

- Style: Outlined (2px stroke), consistent with a medical professional tone
- Recommended library: **Phosphor Icons** or **Heroicons** (both support RTL mirroring)
- Size tokens: 16px (inline), 20px (standard), 24px (nav), 32px (featured)
- Colour: inherits from parent text colour unless decorative
- Directional icons (chevrons, arrows) **must be mirrored** in RTL contexts using `transform: scaleX(-1)` or `dir` attribute

---

## 7. Accessibility

| Requirement | Standard |
|---|---|
| Colour contrast (text on bg) | WCAG AA minimum — 4.5:1 for body, 3:1 for large text |
| Primary `#1a6b5a` on `#fcf8fb` | ~7.4:1 ✓ |
| Accent `#2dbfa0` on `#ffffff` | ~2.8:1 — **use only for decorative/non-text** or add dark label |
| Focus indicators | Visible on all interactive elements (`shadow-focus` token) |
| Touch target minimum | 44×44px |
| Arabic screen reader support | Use `lang="ar"` and `dir="rtl"` on all Arabic content blocks |
| Motion | Respect `prefers-reduced-motion` — disable transitions when set |

---

## 8. Usage Guidelines

### Do ✅
- Use `ROUND_EIGHT` (8px) consistently for all interactive components
- Use `shadow-sm` to elevate cards above the `surface` background
- Use `Noto Kufi Arabic` exclusively for headings; do not mix into body text
- Apply `accent (#2dbfa0)` only for CTAs and positive feedback — never for body text
- Maintain 8px grid alignment for all spacing decisions

### Don't ❌
- Don't use pure white (`#ffffff`) as a page background — use `surface (#fcf8fb)`
- Don't use `accent` colour on text smaller than 18px (contrast is insufficient)
- Don't mix LTR layout conventions — always use logical CSS properties
- Don't use more than 2 font families in a single view
- Don't apply `shadow-lg` to inline components — reserve for overlays and modals

---

*Version 1.0 — Professional Arabic Medical Clinic Design System*
