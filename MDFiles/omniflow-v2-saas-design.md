# OmniFlow V2 — System Design
> **V2 وليس V1.3** — لأنه توسّع منتجي كامل (Major Update)، مش تحسين تدريجي.
> V1 يبقى كما هو (مُخصَّص للطلاب فقط). V2 يُبنى **فوق** V1 دون كسره، ويفتح المنتج ليصبح **منصة SaaS عامة** لأي شخص/فريق يدير مسارات حياة أو عمل متعددة.

---

## 0. علاقة V2 بـ V1

| | V1 (الحالي) | V2 (الجديد) |
|---|---|---|
| الجمهور | طالب فردي فقط | أي فرد محترف، فريلانسر، مدرّب/كوتش، فريق صغير |
| نموذج الحساب | حساب فردي واحد (`User`) | حساب فردي **أو** مساحة عمل جماعية (`Organization`) |
| نموذج الدخل | لا يوجد (منتج مجاني/شخصي) | اشتراكات مدفوعة (Freemium → Pro → Team) |
| الأدوار | مستخدم واحد يملك كل بياناته | Owner / Admin / Member / Viewer داخل نفس الـ Organization |
| بوابة العميل | ثابتة التصميم (freelance portal) | قابلة للتخصيص (white-label: شعار، ألوان، دومين) |
| كل ميزات V1 (§3 في وثيقة V1) | ✅ تبقى كما هي كأساس | ✅ تُورَّث بالكامل، وتصبح متاحة **لكل مستخدم** بغض النظر عن كونه طالب أو لا |

**قاعدة أساسية:** أي مستخدم V1 (طالب) يفتح حسابه في V2 يجد نفسه تلقائيًا داخل **Organization شخصية (Personal Workspace)** بها seat واحد وخطة `Free` — لا يحس بأي كسر أو تغيير إجباري.

---

## 1. المشكلة وكيفية حلها (نطاق أوسع)

### المشكلة (الموسّعة)
V1 حل مشكلة "الطالب اللي بيدير مسارات حياة متوازية". لكن نفس المشكلة موجودة عند:
- **المحترف/الموظف** اللي بيوازن بين شغل، تعلّم مهارة جديدة، رياضة، ومشاريع جانبية.
- **الفريلانسر بدوام كامل** اللي عنده أكتر من عميل ومحتاج لوحة تحكم احترافية مش بوابة عميل بسيطة.
- **الكوتش/المدرّب/المعلّم الخصوصي** اللي بيدير **عدة عملاء أو طلاب في نفس الوقت**، وكل واحد منهم عنده مساراته الخاصة، والكوتش عايز يشوفهم كلهم من مكان واحد.
- **الفريق الصغير** (ستارت أب، وكالة صغيرة) اللي عايز يستخدم نفس منطق "المسارات + التزامن" على مستوى الفريق مش الفرد بس.

### الحل (V2)
نفس المحرك الأساسي (Tracks + Sync Map + Habits + Analytics) يبقى كما هو، لكن نضيف طبقة **Multi-tenancy**:
- **Organization (مساحة عمل)** بدل ما البيانات تبقى مربوطة بـ `User` بس.
- **اشتراكات وخطط** تفتح قدرات أكبر (عدد مسارات، عدد أعضاء، تخصيص العلامة التجارية، API).
- **بوابة عميل قابلة للتخصيص بالكامل (White-label)** — تخيل كوتش عايز يبعت لعميله بوابة بشعاره هو مش شعار OmniFlow.
- **قوالب مسارات جاهزة (Track Templates)** — الكوتش يعمل قالب "برنامج تدريب 90 يوم" مرة واحدة، ويطبّقه على كل عملائه.

---

## 2. من سيستخدمه (V2 Personas)

| الشريحة | الوصف | حالة الاستخدام | الخطة المتوقعة |
|---|---|---|---|
| **Individual Free** | طالب (كل مستخدمي V1) أو أي فرد يجرّب المنتج | نفس ميزات V1 كاملة، بحد أقصى لعدد المسارات | Free |
| **Individual Pro** | محترف/فريلانسر فردي يريد حدود أعلى + تخصيص بوابة العميل | مسارات غير محدودة، white-label بسيط، تحليلات متقدمة | Pro (شهري/سنوي) |
| **Coach / Team Owner** | مدرّب، معلّم خصوصي، مستشار يدير عدة عملاء كـ "أعضاء" داخل مساحة عمله | لوحة تحكم موحّدة لكل عملائه، قوالب مسارات، صلاحيات | Team |
| **Team Member** | عضو مدعو داخل Organization (عميل الكوتش، أو زميل في فريق صغير) | يشوف/يدير مساراته الخاصة فقط، أو حسب صلاحيته | يرث خطة الـ Organization |
| **مطوّر/Integrator** | شخص تقني عايز يربط OmniFlow بأدوات تانية (Zapier, تقويم خارجي) | API Keys + Public API | Pro/Team (مطلوب لفتح الـ API) |

---

## 3. الميزات الجديدة (V2 — SaaS Enablement)

### 3.1 مساحات العمل (Organizations / Workspaces) — P0
- كل حساب جديد يبدأ بـ Organization شخصية تلقائيًا (اسمها = اسم المستخدم، `type: personal`).
- يمكن للمستخدم إنشاء Organization إضافية من نوع `team`، ودعوة أعضاء لها.
- كل الكيانات الأساسية (`Track`, `Habit`, `Resource`, ...) تحمل `organizationId` بدل الارتباط المباشر بـ `User` فقط — البيانات "مملوكة" للـ Organization، والمستخدم يصل لها عبر عضويته (`Membership`).

### 3.2 الأدوار والصلاحيات (Roles & Permissions) — P0
| الدور | الصلاحيات |
|---|---|
| **Owner** | كل شيء + الفوترة + حذف الـ Organization |
| **Admin** | إدارة الأعضاء + كل بيانات الـ Organization، بدون الفوترة |
| **Member** | يدير مساراته/بياناته الخاصة فقط داخل الـ Organization |
| **Viewer** | قراءة فقط (مفيد لولي أمر يشوف تقدم ابنه، أو مدير يشوف تقدم الفريق) |

### 3.3 الاشتراكات والفوترة (Billing & Plans) — P0
- تكامل مع **Stripe** (Subscriptions + Customer Portal الجاهز منهم لتقليل العمل).
- 3 خطط:

| الخطة | السعر | الحدود |
|---|---|---|
| **Free** | $0 | حتى 3 مسارات نشطة، عضو واحد، بدون white-label، بدون API |
| **Pro** | شهري/سنوي | مسارات غير محدودة، عضو واحد، white-label بسيط (شعار + لون واحد)، Weekly Digest متقدم |
| **Team** | لكل seat/شهر | كل ميزات Pro + أعضاء متعددون + قوالب مسارات + white-label كامل (دومين مخصص) + API |

- **Feature gating** يتم فحصه على مستوى الـ middleware في الـ API (`checkPlanLimit(organizationId, feature)`) قبل تنفيذ أي عملية تتخطى حدود الخطة.

### 3.4 بوابة عميل قابلة للتخصيص (White-label Client Portal) — P1
توسيع لميزة V1 §3.7:
- الـ Organization (خصوصًا Coach/Team) يقدر يرفع شعاره الخاص، يختار لون accent، ويربط دومين فرعي مخصص (`clientname.omniflow.app` أو دومين خاص بيه بالكامل عبر CNAME).
- بوابة العميل (`/freelance/portal/:portalToken`) تقرأ إعدادات الـ branding من الـ Organization وتُطبّقها بدل الهوية البصرية الافتراضية لـ OmniFlow.

### 3.5 قوالب المسارات (Track Templates) — P1
- الكوتش/Owner يقدر يحوّل أي `Track` قائم إلى **Template** (اسم، فئة، مدة، قائمة مهام افتراضية، معالم).
- يطبّق القالب على أي عضو جديد بضغطة واحدة → ينشئ `Track` + `Task`s مطابقة، بس بـ `startDate` مختلف حسب تاريخ انضمام العضو.
- يفتح الباب لاحقًا لـ **Template Marketplace** (كوتشات يبيعوا قوالبهم لبعض) — خارج نطاق V2 الأولي لكن المخطط يدعمه.

### 3.6 API عام + مفاتيح API — P2
- `POST /api-keys` لإنشاء مفتاح API (متاح لخطط Pro/Team فقط).
- Endpoints عامة موثّقة (REST، نفس الـ `/v1` الحالي) بحد معدل (rate limit) أعلى حسب الخطة.
- يفتح تكاملات زي Zapier/Make لسحب بيانات المسارات أو التحليلات لأنظمة خارجية.

### 3.7 لوحة تحكم Owner/Admin على مستوى Organization — P0
- `/[org]/dashboard` نسخة موسّعة من CEO Dashboard تعرض **كل الأعضاء** مجمّعين: متوسط نسبة الإنجاز، عدد المسارات النشطة لكل عضو، تنبيهات (عضو متعثر/streak انقطعت).

### 3.8 تدفّق تسجيل/onboarding جديد — P0
- عند التسجيل، يُسأل المستخدم: "هل تستخدم OmniFlow لنفسك، أم لإدارة عملاء/فريق؟" → يحدد نوع الـ Organization الأولى (`personal` أو `team`) ويوجّهه لتدفق onboarding مختلف (اختيار قالب أول لنفسه، أو دعوة أول عضو).

---

## 4. DB Schema — التغييرات على V1

### 4.1 نماذج جديدة

```
Organization
├─ id            PK
├─ name
├─ type          enum(personal, team)
├─ logoUrl        nullable   -- white-label
├─ brandColor     nullable   -- white-label (hex)
├─ customDomain   nullable, unique
├─ createdAt
└─ ownerId        FK → User

Membership
├─ id             PK
├─ userId         FK → User
├─ organizationId FK → Organization
├─ role           enum(owner, admin, member, viewer)
├─ invitedAt
├─ joinedAt        nullable
└─ status          enum(invited, active, suspended)
   UNIQUE (userId, organizationId)

Plan
├─ id           PK
├─ name         enum(free, pro, team)
├─ maxTracks    int, nullable      -- null = غير محدود
├─ maxSeats     int
├─ hasWhitelabel boolean
├─ hasApiAccess  boolean
└─ pricePerSeat  decimal, nullable

Subscription
├─ id                   PK
├─ organizationId       FK → Organization, unique
├─ planId               FK → Plan
├─ stripeCustomerId
├─ stripeSubscriptionId
├─ status               enum(active, trialing, past_due, canceled)
├─ seatsPurchased        int
├─ currentPeriodEnd
└─ createdAt

Invoice
├─ id               PK
├─ subscriptionId   FK → Subscription
├─ stripeInvoiceId
├─ amount
├─ status           enum(paid, open, failed)
└─ issuedAt

ApiKey
├─ id                PK
├─ organizationId     FK → Organization
├─ key                unique (مُشفَّر/hashed في التخزين)
├─ label
├─ lastUsedAt         nullable
├─ createdAt
└─ revokedAt          nullable

TrackTemplate
├─ id             PK
├─ organizationId FK → Organization
├─ name
├─ category
├─ durationDays
├─ taskBlueprint  json   -- قائمة مهام افتراضية بـ dayOrder نسبي
└─ createdAt
```

### 4.2 تعديلات على نماذج V1 الموجودة
كل النماذج التالية تكتسب عمود `organizationId` (FK → Organization)، بينما `userId` يبقى موجودًا للدلالة على "من أنشأ/يملك هذا العنصر تحديدًا" داخل الـ Organization:

```
Track            + organizationId
Task             (بدون تغيير — يتبع Track)
Habit            + organizationId
Resource         + organizationId
FreelanceClient  + organizationId
ConflictRule     + organizationId
```

> **ملاحظة migration:** عند ترقية مستخدم V1 قديم، يتم إنشاء `Organization(type=personal)` تلقائيًا له، و`Membership(role=owner)`، ثم تُملأ كل صفوفه القديمة بـ `organizationId` الجديد هذا في migration واحدة — بدون فقد أي بيانات.

### 4.3 قاعدة أمان جديدة
كل استعلامات V1 كانت: `WHERE userId = authenticatedUser.id`
تصبح في V2: `WHERE organizationId = currentMembership.organizationId AND organizationId IN (SELECT organizationId FROM Membership WHERE userId = authenticatedUser.id)`
— يُطبَّق كـ middleware مركزي (`requireOrgAccess`) بدل تكراره في كل route، لتفادي أخطاء IDOR عبر الـ Organizations.

---

## 5. Site Map — إضافات V2

```
/pricing                          → 🆕 صفحة تسعير عامة (Free/Pro/Team) - غير مسجل
/onboarding                       → 🆕 تدفق ما بعد التسجيل: شخصي أم فريق؟

── مساحة العمل (org-scoped routing) ──
/[org]/dashboard                  → 🆕 نسخة موسّعة من CEO Dashboard تجمّع كل الأعضاء
/[org]/members                    → 🆕 قائمة الأعضاء + دعوة عضو جديد + إدارة الأدوار
/[org]/members/:id                → 🆕 عرض بيانات عضو محدد (حسب صلاحية العارض)
/[org]/templates                  → 🆕 قوالب المسارات + إنشاء/تطبيق قالب
/[org]/settings                   → 🆕 إعدادات الـ Organization (اسم، شعار، لون، دومين مخصص)
/[org]/billing                    → 🆕 الفوترة: الخطة الحالية، الفواتير، ترقية/إلغاء (Stripe Customer Portal)
/[org]/api-keys                   → 🆕 إدارة مفاتيح الـ API (Pro/Team فقط)

/freelance/portal/:portalToken    → مطوّرة: تقرأ الآن branding (شعار/لون/دومين) من الـ Organization
```

> باقي كل مسارات V1 (`/tracks`, `/habits`, `/lectures`, `/todos`, `/digest`, `/calendar`, ...) **تبقى كما هي بدون تغيير في المسار نفسه**، لكنها تصبح ضمنيًا "org-scoped" — أي بيانات تُعرض فيها الآن تُفلتَر بحسب `organizationId` النشطة للمستخدم (اللي يقدر يبدّل بينها لو هو عضو في أكتر من Organization، عبر Org Switcher في الـ top bar).

---

## 6. ملخص مراحل تسليم V2 (مقترح)

| مرحلة | المحتوى | ملاحظة |
|---|---|---|
| 1 | `Organization` + `Membership` + migration لمستخدمي V1 | لا تغيير محسوس عند المستخدم القديم |
| 2 | الأدوار والصلاحيات + middleware أمان الـ Org | أساس لكل حاجة بعد كده |
| 3 | `Plan` + `Subscription` + تكامل Stripe + Feature gating | أول نقطة دخل فعلي كـ SaaS مدفوع |
| 4 | `/[org]/dashboard` + `/[org]/members` + دعوات الأعضاء | تفعيل استخدام الفرق/الكوتشات |
| 5 | White-label (شعار/لون/دومين) على بوابة العميل | قيمة مباشرة لشريحة Coach |
| 6 | `TrackTemplate` + تطبيق القوالب على أعضاء جدد | يوفر وقت الكوتش الفعلي |
| 7 | `ApiKey` + Public API + rate limiting حسب الخطة | يفتح التكاملات الخارجية |
