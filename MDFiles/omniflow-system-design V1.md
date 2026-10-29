# OmniFlow — System Design
> مُستخرج ومُهيكل من وثيقة متطلبات المنتج (PRD v1.0 - مايو 2026)

> **📌 تحديث النطاق (v1.1):** تم تضييق الجمهور المستهدف ليصبح **الطلاب فقط**. تمت إضافة 3 ميزات جديدة: تتبع المحاضرات/التعلّم الذاتي (يُدخلها الطالب يدويًا لأنه لا يوجد تكامل مباشر مع أي منصة تعليمية)، قائمة TODOs سريعة، وملخص أسبوعي يُرسَل عبر بريد إلكتروني/رسالة يحتوي التحليلات.

---

## 1. المشكلة وكيفية حلها

### المشكلة
الأشخاص ذوو الأداء العالي (خصوصًا المطورين والطلاب) يديرون عدة "مسارات نمو" متوازية في نفس الوقت:
تعلّم لغة، دراسة، لياقة بدنية، مهارات تقنية، عمل حر... إلخ.

تطبيقات إدارة المهام التقليدية (Todoist, Notion, ...) تتعامل مع كل هذا كقائمة مهام مسطّحة (flat list)، بدون:
- فهم أن كل مجال له **جدول زمني مستقل** (تاريخ بدء، مدة، تقدّم).
- رؤية شاملة لكيفية **تقاطع/توازن** هذه المسارات مع بعضها في يوم معيّن.
- اكتشاف **تعارضات الوقت** بين الأنشطة (مثلاً: نادي رياضي ومدرسة في نفس التوقيت).

النتيجة: المستخدم يفقد السياق العام لحياته، ولا يعرف أين يستثمر وقته.

### الحل
**OmniFlow** = "نظام تشغيل للحياة" مبني على البيانات، حيث:
- كل مجال حياة = **Track (مسار)** مستقل له `startDate`، مدة مستهدفة، مهام، معالم (milestones).
- **مخطط التزامن التفاعلي (Sync Map)**: canvas مدعوم بـ GSAP يعرض كل المسارات كخطوط أفقية، وعند تمرير الماوس فوق يوم معيّن، يرسم منحنيات Bézier تربط هذا اليوم بكل المسارات الأخرى → رؤية "توازن الحياة" في لحظة واحدة.
- **لوحة تحليلات (CEO Dashboard)**: مخطط رادار بـ 6 أبعاد + خريطة حرارية (heatmap) + توزيع الوقت.
- **كاشف تعارضات**: قواعد تصريحية (declarative rules) تُقيَّم عند الطلب لاكتشاف تداخل الأوقات.
- **أوضاع سياق (Context Modes)**: الواجهة تتكيف حسب النشاط الحالي (عمل عميق / صالة رياضية / مدرسة) لإخفاء الضوضاء.

القيمة الجوهرية: **البيانات مُشتقة (derived) وقت الاستعلام وليست مخزّنة**، لتجنّب مشاكل عدم التزامن (مثال: نسبة التقدم % تُحسب من عدد المهام المكتملة/الإجمالي، لا تُخزَّن كعمود ثابت).

---

## 2. من سيستخدمه (Personas)

| الشريحة | الوصف | حالة الاستخدام الأساسية | الأولوية |
|---|---|---|---|
| **أساسي (المستخدم الوحيد الآن)** | طالب (17-25 سنة)، مدرسة/جامعة أو self-taught | تتبع الدراسة + المحاضرات + المهام اليومية + العادات + TODOs + الاستلام الأسبوعي بالبريد | P0 |
| **زائر خارجي (بدون حساب)** | ولي أمر / مُعلّم خصوصي (اختياري مستقبلًا عبر portalToken بنفس منطق بوابة العميل) | مشاهدة تقدم الطالب للقراءة فقط | P2 |

> ملاحظة: مع التضييق للطلاب، ميزات العمل الحر (§3.7) وقوالب "developer" تبقى موجودة في المخطط كمسارات اختيارية (طالب قد يعمل فريلانس بجانب دراسته)، لكنها لم تعد الجمهور الأساسي المُستهدف بالتصميم.

**مبادئ تصميم مرتبطة بالمستخدم:** Dark mode افتراضي، Keyboard-first، يعمل Offline (PWA)، WCAG 2.1 AA.

---

## 3. الميزات المطلوبة (Features)

### أساسية (P0 — MVP)
1. **إدارة المسارات (Tracks)** — CRUD + حساب اليوم الحالي تلقائيًا:
   `currentDay = floor((now - startDate) / 86400000) + 1`
2. **مخطط التزامن (Sync Map)** — SVG/Canvas + GSAP، منحنيات Bézier عند hover، أداء < 100ms، zoom/pan باللمس، احترام `prefers-reduced-motion`.
3. **نظام المهام (Tasks)** — جدول واحد بعمودين استعلام: `dayOrder` (للمسار) و `scheduledDate` (للتقويم)، مع idempotent status toggling.
4. **متتبع العادات والسلاسل (Habits & Streaks)** — تتبع ثنائي/كمي، حساب `currentStreak`/`longestStreak` ذريًا، قاعدة انقطاع السلسلة عند فجوة > 25 ساعة (لمعالجة DST).
5. **لوحة تحليلات CEO** — Radar chart (6 أبعاد)، GitHub-style heatmap، توزيع الوقت الفعلي/المقدّر.
6. **التقويم** — عرض كل المهام من كل المسارات ليوم محدد.

### مهمة (P1)
7. **مخزن الموارد (Resource Vault)** — PDF (Cloudinary/S3، حتى 50MB)، فيديو يوتيوب (بربط timestamp)، روابط، ملاحظات.
8. **أوضاع السياق (Context Modes)** — Default / Deep Work / Gym / School، مخزّنة في Zustand + localStorage، متزامنة عبر `PATCH /user/me`.
9. **منصة العمل الحر** — عملاء، عروض (Draft→Sent→Negotiating→Accepted/Rejected)، مشاريع، أهداف دخل، بوابة عميل عامة عبر `portalToken`.
10. **كاشف التعارض** — قواعد تعارض بين مسارين (أيام أسبوع + وقت)، تقييم عند الطلب `GET /conflicts/detect`.

### إضافية (P2)
11. **مكتبة مطالبات الذكاء الاصطناعي (AI Prompt Library)** — تصفح ونسخ مطالبات مصنّفة حسب الفئة.

### غير وظيفية أساسية
- PWA: عمل offline، مزامنة عند إعادة الاتصال، مؤشر offline.
- أداء: LCP < 1.5s، API P95 < 200ms، استعلام تقويم < 5ms، JWT عبر Redis < 1ms.
- أمان: JWT (access 15 دقيقة) + Refresh Token rotation (7 أيام)، Rate limiting، توقيع مسبق لروابط S3 لمدة ساعة، `portalToken` = nanoid عشوائي غير قابل للتخمين.

---

## 4. DB Schema

**التقنية:** PostgreSQL + Prisma ORM + Redis (كاش جلسات) + Cloudinary/S3 (تخزين ملفات).
**16 نموذجًا** موزّعة على 6 مجموعات منطقية.

### 4.1 المصادقة والمستخدم

```
User
├─ id            PK
├─ email         unique
├─ passwordHash
├─ name
├─ activeMode    enum(default, deep_work, gym, school)
├─ createdAt
└─ updatedAt

UserSettings
├─ id            PK
├─ userId        FK → User, unique
├─ theme         enum(dark, light)  -- default: dark
├─ timezone
├─ reducedMotion boolean
└─ notificationPrefs  json

Session
├─ id            PK
├─ userId        FK → User
├─ refreshToken  unique
├─ userAgent
├─ ipAddress
├─ createdAt
├─ expiresAt
└─ revokedAt      nullable   -- سجل تدقيق دائم + إلغاء لكل جهاز
```

### 4.2 نظام المسارات (Track System)

```
Track
├─ id                 PK
├─ userId             FK → User
├─ name
├─ category           enum(developer, learning, school, health, freelance)
├─ color              string (hex)
├─ startDate           date
├─ targetDurationDays  int
├─ sortOrder           int      -- لترتيب المسارات في Sync Map
└─ createdAt

Task
├─ id             PK
├─ trackId        FK → Track
├─ userId         FK → User
├─ title
├─ description
├─ dayOrder        int         -- ترتيب اليوم ضمن المسار
├─ scheduledDate   date        -- يُحسب مرة واحدة عند الإنشاء = startDate + (dayOrder-1) يوم
├─ status          enum(pending, completed, skipped)
├─ estimatedMinutes
├─ actualMinutes
├─ resourceId      FK → Resource, nullable
├─ resourcePage    int/nullable  -- رقم صفحة PDF أو ثانية فيديو
├─ createdAt
└─ completedAt     nullable
   INDEX (scheduledDate, trackId)   -- < 5ms على أي نطاق

Milestone
├─ id          PK
├─ trackId     FK → Track
├─ title
├─ dayOrder
└─ achievedAt  nullable

Resource
├─ id         PK
├─ userId     FK → User
├─ trackId    FK → Track, nullable
├─ type       enum(pdf, video, link, note)
├─ title
├─ url        -- رابط S3/Cloudinary موقّع مسبقًا أو رابط خارجي (يوتيوب)
├─ content    text, nullable  -- للملاحظات الداخلية فقط
└─ createdAt
```

### 4.3 العادات (Habits)

```
Habit
├─ id             PK
├─ userId         FK → User
├─ name
├─ type           enum(binary, quantitative)
├─ targetValue    nullable  -- للنوع الكمي (مثلاً: عدد الصفحات)
├─ unit           nullable
├─ currentStreak  int   -- محدث ذريًا مع كل POST /log
├─ longestStreak  int
└─ createdAt

HabitLog
├─ id         PK
├─ habitId    FK → Habit
├─ loggedAt   datetime
├─ value      nullable (للنوع الكمي)
└─ note       nullable
   UNIQUE (habitId, date_trunc(loggedAt))  -- idempotent عند التسجيل المتكرر في نفس اليوم
```

### 4.4 التحليلات (Analytics)

```
AnalyticsLog
├─ id             PK
├─ userId         FK → User
├─ trackId        FK → Track
├─ logDate        date
├─ completionRate float   -- لقطة يومية، لا تُعاد حسابها أبدًا
├─ dimension      string  -- لبُعد مخطط الرادار
└─ createdAt
   UNIQUE (userId, trackId, logDate)

Goal
├─ id            PK
├─ userId        FK → User
├─ title
├─ targetValue
├─ currentValue
├─ period         enum(monthly, quarterly, yearly)
└─ deadline
```

### 4.5 منصة العمل الحر (Freelance)

```
FreelanceClient
├─ id         PK
├─ userId     FK → User
├─ name
├─ email
├─ company
└─ createdAt

Proposal
├─ id         PK
├─ clientId   FK → FreelanceClient
├─ title
├─ status     enum(draft, sent, negotiating, accepted, rejected)
├─ amount
└─ sentAt

Project
├─ id               PK
├─ clientId         FK → FreelanceClient
├─ proposalId       FK → Proposal, nullable
├─ title
├─ status
├─ portalToken       unique  -- nanoid عشوائي مشفر؛ هو عنصر التحكم بالوصول الوحيد
├─ progressPercent   -- مُشتق وقت الاستعلام من حالة المهام المرتبطة
├─ startDate
└─ dueDate
```

### 4.6 النظام (System)

```
ConflictRule
├─ id          PK
├─ userId      FK → User
├─ trackAId    FK → Track
├─ trackBId    FK → Track
├─ daysOfWeek  int[]  -- 0-6
├─ startTime
├─ endTime
└─ severity    enum(warning, critical)

PromptEntry
├─ id        PK
├─ userId    FK → User, nullable (يمكن أن تكون عامة)
├─ category
├─ title
├─ content   text
└─ createdAt
```

### 4.7 قرارات تصميم رئيسية
- **جدول مهام واحد فقط** (لا `DailyTasks` منفصل) — نمطا استعلام على نفس الجدول (`trackId+dayOrder` أو `scheduledDate`) لتجنّب مشكلة "انقسام الدماغ" في المزامنة.
- **قيم مُشتقة لا تُخزَّن**: `progressPercent`, `currentDay` تُحسب وقت الاستعلام.
- **قيم مُخزَّنة لأن حسابها متكرر ومكلف**: `scheduledDate`, `completionRate` في `AnalyticsLog`, `currentStreak`.
- كل استعلامات بيانات المستخدم تُطبّق `WHERE userId = authenticatedUser.id` لمنع IDOR.

---

## 5. Site Map

```
/                              → صفحة هبوط (Landing) - غير مسجل
/login                         → تسجيل الدخول
/register                      → إنشاء حساب

── (بعد تسجيل الدخول) ──
/dashboard                     → CEO Dashboard: Radar Chart + Heatmap + Streaks + Time Distribution
/sync-map                      → مخطط التزامن التفاعلي (الميزة الرئيسية)

/tracks                        → قائمة كل المسارات (مرتبة بـ sortOrder)
/tracks/new                    → إنشاء مسار جديد
/tracks/:id                    → تفاصيل مسار: المهام + المعالم + الموارد المرتبطة

/calendar                      → عرض تقويمي لكل المهام من كل المسارات (بحسب scheduledDate)
/calendar/:date                → مهام يوم محدد

/habits                        → قائمة العادات + مؤشرات السلاسل (streaks)
/habits/:id                    → تفاصيل عادة + سجل التسجيلات

/resources                     → مخزن الموارد (فلترة حسب نوع/مسار)
/resources/:id                 → عارض المورد (PDF viewer / رابط يوتيوب بالطابع الزمني)

/freelance                     → لوحة العمل الحر: أهداف الدخل + قائمة العملاء
/freelance/clients/:id         → ملف العميل: العروض + المشاريع
/freelance/proposals/:id       → تفاصيل عرض (مسار الحالة)
/freelance/projects/:id        → تفاصيل مشروع (يشمل رابط بوابة العميل)
/freelance/portal/:portalToken → 🔓 صفحة عامة بدون مصادقة: تقدم المشروع للقراءة فقط (للعميل)

/conflicts                     → عرض تعارضات الجدول المكتشفة (تحذير/حرج)
/conflicts/rules               → إدارة قواعد التعارض

/prompts                       → مكتبة مطالبات الذكاء الاصطناعي (فلترة حسب فئة)

/settings                      → إعدادات المستخدم (الثيم، المنطقة الزمنية، الوضع النشط)
/settings/sessions             → إدارة الجلسات النشطة (إلغاء تسجيل الدخول من جهاز)
```

**ملاحظة معمارية:** أوضاع السياق (Deep Work / Gym / School) لا تُنشئ صفحات منفصلة — بل تُصفّي الوحدات الظاهرة داخل نفس الصفحات (`/dashboard`, `/tracks`, إلخ) حسب `User.activeMode`.

---

## ملخص خارطة الطريق (7 مراحل)

| مرحلة | المحتوى | المدة |
|---|---|---|
| 1 | مصادقة + CRUD المسارات | أسبوع 1 |
| 2 | نظام المهام + التقويم | أسبوع 2 |
| 3 | العادات والسلاسل | أسبوع 3 |
| 4 | مخطط التزامن (الأعلى خطورة تقنية) | أسبوع 4-5 |
| 5 | لوحة التحليلات | أسبوع 6 |
| 6 | العمل الحر + الموارد | أسبوع 7 |
| 7 | PWA + كاشف التعارض + مكتبة المطالبات | أسبوع 8 |
