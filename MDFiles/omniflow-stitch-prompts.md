# OmniFlow — Stitch AI Sketch Prompts
> مبنية على Site Map النهائي + نظام التصميم `Kinetic Minimalist` (DESIGN.md)

كل صفحة من الـ Site Map ليها Prompt جاهز تلصقه في **Stitch AI** لتوليد Sketch/Wireframe.
كل Prompt بيتبع نفس الأساس البصري (الألوان، الخطوط، الشبكة) مأخوذ حرفيًا من `DESIGN.md`، وبيضيف تفاصيل خاصة بمحتوى الصفحة نفسها.

---

## 🎨 الأساس البصري المشترك (Style Brief)

انسخ هذا المقطع والصقه في بداية **كل** prompt ترسله لـ Stitch (أو خزّنه كـ "System Prompt" في Stitch لو بيدعم ده)، عشان كل الشاشات تطلع متسقة بصريًا:

```
Design system: "Kinetic Minimalist" — a disciplined, technical, dark-mode SaaS
dashboard for personal life-management. Calm, data-dense, no visual clutter.

COLORS
- Canvas/background: #141313
- Card / container surface: #201f1f, with surface-container-high #2a2a2a for hover/active states
- Borders / dividers: 1px solid #444748 (outline-variant) — never use drop shadows
- Primary text (on-surface): #e5e2e1
- Secondary/muted text (on-surface-variant): #c4c7c8
- Primary accent: pure white #ffffff (buttons, active states) with dark text #2f3131 on top of it
- Error/warning: #ffb4ab on dark #93000a container
- Track accent colors (used ONLY for progress bars, chips, small icons, left-border accents — never for large surfaces):
  - Developer/Tech track → #534AB7 (violet)
  - Learning/Language track → #1D9E75 (green)
  - School/Study track → #3B8BD4 (blue)
  - Health/Fitness track → #D85A30 (orange)
  - Freelance track → #BA7517 (amber)

TYPOGRAPHY
- UI labels, headings, body text, buttons → Inter (600 weight for headings, 400 for body)
- ALL numbers, timestamps, percentages, counters, durations, streak counts → JetBrains Mono,
  visually distinct so the user can scan "what to do" vs "how much is done" at a glance
- h1: 32px/600, h2: 24px/600, body: 16px/400, small labels: 12px uppercase mono with letter-spacing

LAYOUT
- Strict 8px spacing grid, 32px page margins, 16px gutters
- 12-column dashboard grid
- Card corner radius: 8px (12px for large "master" containers/sections)
- Depth via tonal layering (surface-0 → surface-1 → surface-2), NOT shadows

COMPONENTS
- Primary button: solid white fill, dark text, 8px radius
- Ghost button: 1px #444748 border, white text, transparent fill
- Track chip: pill shape, 2px left-border in track color OR 10% opacity tint background, label in JetBrains Mono
- Progress bar: track/background #2a2a2a, fill in the specific track accent color, rounded ends
- Data card: #201f1f surface, 1px #444748 border, numbers in JetBrains Mono, label in Inter caps
- Input field: darker than card (#141313), 1px #444748 border that turns to the active track's accent color on focus
- Dashed connector lines: 1px dashed #444748, used to visually link related items

TONE: minimal, confident, "calm control" — the UI recedes, the data leads.
```

---

## 1. `/` — Landing (غير مسجّل)

**الهدف:** شرح قيمة المنتج للطالب + دعوة للتسجيل.

```
[الأساس البصري أعلاه] +

Screen: Marketing landing page for OmniFlow, a student life-tracking OS.
- Full-bleed dark hero section (#141313) with a bold Inter h1: "One OS for every part of your student life"
- Below headline, a horizontal preview strip showing 4-5 track chips side by side
  (School #3B8BD4, Learning #1D9E75, Health #D85A30, Freelance #BA7517), each with a mini
  progress bar mid-fill, to hint at the multi-track concept without full data
- A small static preview of the "Sync Map" concept: 3-4 thin horizontal lines (tracks) with
  dashed connector lines linking a highlighted day-node across them
- Two CTAs: primary white button "Get Started", ghost button "Log in"
- Minimal footer, single row, muted on-surface-variant text
```

---

## 2. `/login` — تسجيل الدخول

```
[الأساس البصري أعلاه] +

Screen: Centered auth card on dark canvas.
- Single #201f1f card, 8px radius, 1px #444748 border, max-width ~400px, vertically centered
- Card header: small JetBrains Mono label-caps "SIGN IN", then Inter h2 "Welcome back"
- Two input fields (email, password) using the darker #141313 input style with focus-state
  border turning white (#ffffff) since there's no single track context yet
- Primary white full-width button "Log in"
- Small ghost text link below: "Don't have an account? Register"
- No illustration, no clutter — pure functional minimalism
```

---

## 3. `/register` — إنشاء حساب

```
[الأساس البصري أعلاه] +

Screen: Same auth-card layout as Login, but with an additional "Name" input above email,
and a JetBrains Mono micro-copy line under the password field: "Used only for your account —
no data sharing." Primary button label: "Create account".
```

---

## 4. `/dashboard` — CEO Dashboard

**الهدف:** نظرة 360° على توازن حياة الطالب.

```
[الأساس البصري أعلاه] +

Screen: Main dashboard, 12-column grid, 32px margins, dense but organized.
- Top bar: greeting in Inter ("Good evening, [Name]") + current context-mode pill
  (e.g. "Deep Work" chip, white outline) on the right
- Row 1 (3 data cards side by side): "Tasks completed this week" (big JetBrains Mono number
  + small progress bar), "Current streaks" (flame icon + longest streak in mono), "Lecture hours
  this week" (mono duration format like "04:30 / 08:00")
- Row 2 left (7 cols): a hexagonal/radar chart card titled "Life Balance" with 6 axes
  (School, Learning, Health, Freelance, Habits, Deep Work), thin white radar polygon on
  dark grid lines
- Row 2 right (5 cols): a GitHub-style contribution heatmap card, muted gray cells scaling
  to white/bright for high-activity days, JetBrains Mono month labels
- Row 3: horizontal scrollable row of Track cards, each with track-colored left border,
  track name in Inter, progress % in JetBrains Mono, thin progress bar in track color
```

---

## 5. `/sync-map` — مخطط التزامن التفاعلي ⭐ (الميزة الرئيسية)

```
[الأساس البصري أعلاه] +

Screen: Full-canvas interactive visualization, minimal chrome.
- Dark canvas #141313 filling the viewport below a thin top toolbar (zoom controls, today button)
- 4-5 horizontal track lanes stacked vertically, each labeled on the left in Inter with a small
  track-color dot, JetBrains Mono showing "Day 63" style counters at the right end of each lane
- Each lane has small circular day-nodes spaced along it; nodes for completed days filled solid
  in the track color, upcoming days shown as hollow outline circles
- One node is shown in a "hovered" state: from it, several dashed/curved cubic Bézier connector
  lines (1px, #444748, with one highlighted in white) sweep to the corresponding day-node on
  every other lane, illustrating the cross-track sync moment
- Bottom-left floating legend: small track chips list
- Overall feel: architectural, precise, like a technical timing diagram — not decorative
```

---

## 6. `/tracks` — قائمة المسارات

```
[الأساس البصري أعلاه] +

Screen: Grid of track cards (3 per row on desktop), "New Track" ghost card with a "+" icon
as the last grid item.
- Each track card: #201f1f surface, 2px top-border in the track's accent color, track name
  in Inter h2, category label in small mono caps below it, a progress bar (track color fill)
  with "Day 63 / 90" in JetBrains Mono under it, and a small row of 3 upcoming task titles
  in muted on-surface-variant text
- Sort/filter row above the grid: ghost pill buttons ("All", "School", "Health", "Freelance"...)
```

---

## 7. `/tracks/new` — إنشاء مسار جديد

```
[الأساس البصري أعلاه] +

Screen: Single-column form card, max-width ~480px, centered.
- Input: track name
- Category selector: horizontal row of color-swatch pills (one per category color from the
  palette), selected one gets a white ring outline
- Two inputs side by side: Start date (calendar icon) + Target duration in days (mono input)
- Primary white button "Create track" at the bottom, full width
```

---

## 8. `/tracks/:id` — تفاصيل مسار

```
[الأساس البصري أعلاه] +

Screen: Track detail page, header + 3 tabs (Tasks / Milestones / Resources).
- Header: track name (Inter h1), track-colored progress bar full width beneath it, with
  "Day 63/90 · 70%" in JetBrains Mono aligned right
- Tabs styled as underlined text tabs, active tab underlined in the track's accent color
- Tasks tab (default): vertical list of task rows, each with a checkbox, task title in Inter,
  scheduled date in small JetBrains Mono on the right, dashed connector line style separators
  between grouped days
- Milestones tab: horizontal stepper/timeline with circular milestone markers, achieved ones
  filled in track color, future ones hollow
```

---

## 9. `/calendar` و `/calendar/:date` — التقويم

```
[الأساس البصري أعلاه] +

Screen: Month-grid calendar (default view for /calendar), 7-column grid, 8px gutters.
- Each day cell: date number top-left in JetBrains Mono, up to 3 small colored dots below it
  representing tasks/lectures/todos due that day (dot color = track color, gray dot = generic Todo)
- Today's cell has a white 1px ring border
- /calendar/:date is a side-panel/drawer variant: same calendar on the left (narrower),
  right panel lists that day's items as rows grouped by type (Tasks, Lectures, Todos),
  each row track-colored left border + checkbox
```

---


## 10. `/habits` — قائمة العادات

```
[الأساس البصري أعلاه] +

Screen: Vertical list of habit cards, each full-width, compact height (~72px).
- Left: habit name in Inter + type icon (checkmark for binary, small bar-chart icon for
  quantitative)
- Center: mini 7-day streak strip — 7 small squares, filled white if logged that day, empty
  outline if not
- Right: JetBrains Mono "current streak" number with a flame glyph, and longest streak in
  smaller muted mono text beneath it
- Floating primary white "+" button bottom-right to add a new habit
```

---

## 11. `/habits/:id` — تفاصيل عادة

```
[الأساس البصري أعلاه] +

Screen: Habit detail page.
- Header: habit name, current/longest streak as two large JetBrains Mono stat blocks side
  by side (like scoreboard numbers)
- Below: a calendar-heatmap style grid (like GitHub contributions) for this single habit's
  history, cells scale in brightness with logged value (or binary filled/empty)
- Bottom: a simple log button — for binary habits a single primary "Mark done today" button;
  for quantitative habits a mono numeric input + "Log" button
```

---

## 12. `/lectures` — قائمة المحاضرات 🆕

```
[الأساس البصري أعلاه] +

Screen: List of lecture-tracking cards, similar density to /tracks but simpler.
- Each row: lecture title in Inter, linked track chip (small, optional) on the right of title,
  a horizontal progress bar (generic white/gray fill, since lectures aren't tied to one track
  color necessarily — or use the linked track's color if present)
- Right-aligned JetBrains Mono duration fraction: "02:15 / 03:00" and a computed "75%" mono badge
- Status tag (small pill): "Not started" (muted outline), "In progress" (white outline),
  "Completed" (solid white fill, dark text)
- Primary white "+ Add lecture" button top-right of the page
```

---


## 13. `/lectures/new` — إضافة محاضرة 🆕

```
[الأساس البصري أعلاه] +

Screen: Simple form card, centered, max-width ~420px.
- Input: Lecture title
- Optional select: "Link to track" (dropdown showing track chips)
- Two side-by-side mono-styled numeric inputs: "Total duration (min)" and "Completed so far (min)"
- Live-computed read-only percentage shown below the two inputs in large JetBrains Mono
  (e.g., "42%"), updating as the user types — visually treat this like a calculator readout
- Primary white button "Save lecture"
```

---

## 14. `/lectures/:id` — تفاصيل محاضرة 🆕

```
[الأساس البصري أعلاه] +

Screen: Lecture detail — mostly about updating completed duration.
- Header: lecture title, linked track chip if any
- Large circular progress ring (SVG) in the center, track-color stroke (or white if unlinked),
  with the percentage in large JetBrains Mono in the center of the ring
- Below the ring: two stat labels side by side — "Completed: 02:15" and "Total: 03:00" in mono
- An inline-editable field to update "Completed duration" + a "Save" ghost button
- Small notes textarea below, muted styling
```

---

## 15. `/todos` — قائمة TODOs السريعة 🆕

```
[الأساس البصري أعلاه] +

Screen: Lightweight flat list, distinctly simpler/less dense than /tracks or /lectures to
signal "quick capture" nature.
- Top: single-line input with a "+" icon inline — "Add a quick todo..." placeholder, Inter font
- Below: flat list of todo rows, each with a circular checkbox, title in Inter, optional due-date
  in small JetBrains Mono on the right, optional priority dot (red/amber/gray small circle)
- Completed todos shown lower in the list, strikethrough text, reduced opacity
- No cards, no borders between rows — just thin 1px #444748 divider lines, keeping it fast
  and list-like rather than "dashboard-heavy"
```

---

## 16. `/digest` — الملخص الأسبوعي 🆕

```
[الأساس البصري أعلاه] +

Screen: "Weekly recap" page, styled like a digest/report card rather than a live dashboard.
- Header: "Your week, March 30 – April 5" in Inter h1, JetBrains Mono date range subtext
- A row of 4 summary stat cards: "Tasks done" / "Habit streaks kept" / "Lecture hours" /
  "Todos cleared" — each big JetBrains Mono number, small Inter label caption beneath
- A compact version of the radar chart from /dashboard, same visual style, smaller
- A "sent via" footer note in muted mono text: "Sent to you@email.com every Friday at 20:00"
  with a ghost button "Change settings" linking to /settings/digest
```

---

## 17. `/settings/digest` — إعدادات الملخص الأسبوعي 🆕

```
[الأساس البصري أعلاه] +

Screen: Settings sub-page, single-column form list (similar pattern to other settings screens).
- Toggle row: "Enable weekly digest" (white pill toggle switch)
- Row: "Delivery channel" — segmented control with 3 options (Email / WhatsApp / SMS), active
  segment filled white with dark text
- Row: "Send on" — day-of-week selector, 7 small circular buttons (Sun–Sat), selected one filled white
- Row: "Send time" — time input styled in JetBrains Mono
- Primary white "Save changes" button at the bottom
```

---

## 18. `/resources` — مخزن الموارد

```
[الأساس البصري أعلاه] +

Screen: Filterable grid of resource cards (masonry-ish, mixed heights based on type).
- Filter chips row on top: "All / PDF / Video / Link / Note"
- PDF card: shows a small document-icon thumbnail, title in Inter, "Page 42" mono badge
- Video card: shows a thin 16:9 placeholder thumbnail with a play icon, "12:30" mono timestamp badge
- Link card: shows a small globe/link icon, domain name in muted mono small text
- Note card: shows first two lines of note text, muted background tint
- Each card has a thin track-colored left border if linked to a track
```

---



## 19. `/freelance` — لوحة العمل الحر

```
[الأساس البصري أعلاه] +

Screen: Freelance overview dashboard, using the Freelance track color (#BA7517) as the
accent throughout this section only.
- Top row: 3 stat cards — "Income this month" (mono currency figure), "Active proposals" (mono
  count), "Active projects" (mono count) — each with a thin #BA7517 top-border accent
- Client list below: rows with client name (Inter), company (muted), and a status chip
  showing their most recent proposal stage (Draft/Sent/Negotiating/Accepted/Rejected) using
  outline pills in progressively "warmer" tones toward accepted
```

---

## 20. `/freelance/portal/:portalToken` — بوابة العميل العامة 🔓

```
[الأساس البصري أعلاه] +

Screen: Public, read-only, no navigation chrome (no sidebar, no settings access) — signal
"external view" clearly.
- Simple centered header: project title, client name, small "Shared by OmniFlow" mono badge
- One large progress bar (Freelance accent #BA7517), percentage in big JetBrains Mono above it
- A read-only timeline of milestones below, same style as track milestones but non-interactive
  (no checkboxes, no edit affordances)
- Minimal footer: "This is a read-only shared view" in small muted mono text
```

---

## 21. `/conflicts` و `/conflicts/rules` — كاشف التعارض

```
[الأساس البصري أعلاه] +

Screen /conflicts: list of detected conflict cards.
- Each card: two track chips shown side-by-side with a small "⚠" or "⛔" icon between them
  (amber outline = warning severity, red/error #ffb4ab = critical severity)
- Below the chips: overlapping time range in JetBrains Mono ("Wed 17:00–18:00") and the
  day-of-week in Inter
- Suggested resolution text in muted on-surface-variant

Screen /conflicts/rules: simple rule-builder list — each rule row shows "Track A ⨯ Track B",
day-of-week pill selector, start/end time mono inputs, and a severity segmented toggle
(Warning/Critical). "+ Add rule" primary button at the top.
```

---

## 22. `/prompts` — مكتبة مطالبات الذكاء الاصطناعي

```
[الأساس البصري أعلاه] +

Screen: Card grid of prompt entries, filterable by category chips at top.
- Each card: category mono label-caps at top, prompt title in Inter, a truncated 2-line
  preview of the prompt content in muted monospace-adjacent style, and a ghost "Copy" button
  bottom-right of the card (icon + text)
```

---

## 23. `/settings` و `/settings/sessions`

```
[الأساس البصري أعلاه] +

Screen /settings: single-column grouped list — sections "Profile", "Appearance" (theme toggle,
though dark is default/only), "Timezone" (dropdown), "Active context mode" (segmented control:
Default/Deep Work/Gym/School). Each row simple label-left, control-right pattern with thin
divider lines.

Screen /settings/sessions: list of active session rows — device/browser name in Inter, last
active timestamp in JetBrains Mono, current session marked with a small white dot + "This
device" label, ghost "Revoke" button on each non-current row.
```

---

## ملاحظات استخدام عامة مع Stitch AI

1. ابدأ دايمًا بالـ **Style Brief** فوق، حتى لو Stitch مش بيحتفظ بالسياق بين الطلبات — كرره في كل prompt جديد.
2. لو Stitch رجّع ألوان مش مطابقة تمامًا، صحّح بجملة زي: *"Use exact hex #141313 for background, #201f1f for cards — do not substitute with pure black or generic dark gray."*
3. لأي شاشة فيها بيانات رقمية (progress %, duration, streak, price) أكّد دايمًا على: *"All numeric values must render in a monospace font (JetBrains Mono), never in the body sans-serif."*
4. الشاشات المميزة بـ 🆕 هي إضافات v1.1 (تعقب المحاضرات، TODOs، الملخص الأسبوعي) — ابدأ بيها لو عايز تعمل sketches لأولويات الطالب الجديدة الأول.
5. شاشة `/sync-map` هي الأعقد بصريًا — يفضّل توليدها آخر حاجة بعد ما باقي الشاشات تثبّت اللغة البصرية، عشان Stitch يقدر يقلّد نفس الأسلوب في العناصر التفاعلية.
