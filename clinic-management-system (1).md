# نظام إدارة العيادات الطبية 🏥
### توثيق المشروع الكامل — Clinic Management System

---

## الفهرس

1. [المشكلة والحل](#المشكلة-والحل)
2. [المستخدمون](#المستخدمون)
3. [الميزات الأساسية](#الميزات-الأساسية)
4. [قاعدة البيانات](#قاعدة-البيانات)
5. [الـ API Endpoints](#api-endpoints)
6. [خريطة الموقع Sitemap](#خريطة-الموقع-sitemap)
7. [التقنيات المستخدمة](#التقنيات-المستخدمة)
8. [قرارات التصميم](#قرارات-التصميم)

---

## المشكلة والحل

### المشكلة الحالية

العيادات الطبية في معظمها تعمل بطرق تقليدية تسبب مشاكل متعددة:

| المشكلة | التأثير |
|---|---|
| دفاتر ورقية لتسجيل المواعيد | تضيع وتتلف، لا يمكن البحث فيها |
| لا يوجد نظام انتظار منظم | فوضى في الاستقبال وإزعاج للمرضى |
| ملفات المرضى متناثرة | الطبيب لا يرى التاريخ المرضي بسرعة |
| لا متابعة للمدفوعات | خسارة مالية وعدم وضوح الإيرادات |
| لا تذكيرات للمرضى | غياب كثير عن المواعيد |

### الحل المقترح

نظام ويب متكامل بـ **Next.js** يعمل على الموبايل والكمبيوتر، يربط كل أطراف العيادة في مكان واحد.

**نموذج المشروع الحالي:**
- طبيب واحد مع قابلية التوسع لأطباء متعددين مستقبلاً
- الحجز من موقع العيادة فقط (لا يوجد تطبيق خارجي)

---

## المستخدمون

| المستخدم | الدور | الصلاحيات |
|---|---|---|
| 🧑‍⚕️ **الطبيب** | يدير الكشوفات | جدوله اليومي، ملفات المرضى، كتابة الوصفات |
| 👩‍💼 **موظف الاستقبال** | يدير الواجهة الأمامية | حجز المواعيد، تسجيل المرضى، إدارة الانتظار، الفواتير |
| 🧑‍🦱 **المريض** | يتابع علاجه | حجز موعد، عرض وصفاته وزياراته، استقبال تذكيرات |
| 👨‍💻 **مدير العيادة** | يتابع الأداء | التقارير المالية، الإحصائيات، إعدادات النظام |

---

## الميزات الأساسية

### 1. 📅 إدارة المواعيد
- حجز موعد من الاستقبال أو أونلاين من المريض مباشرة
- تقويم يومي وأسبوعي للطبيب
- تذكير تلقائي بالواتساب أو SMS قبل الموعد
- إلغاء وإعادة جدولة المواعيد
- دعم Walk-in (مرضى بدون موعد مسبق)

### 2. 👤 ملف المريض الطبي
- بيانات شخصية وتاريخ مرضي كامل
- الأمراض المزمنة والحساسيات
- سجل كل الزيارات والتشخيصات
- نتائج التحاليل والأشعة (رفع ملفات)
- رقم مريض فريد لكل مريض (مثال: P-00123)

### 3. 💊 الوصفات الطبية
- كتابة وصفة رقمية داخل النظام
- طباعة الوصفة بشعار العيادة وبيانات الطبيب
- سجل كل الأدوية السابقة للمريض
- تصدير PDF جاهز للطباعة

### 4. 💰 الفواتير والمدفوعات
- إنشاء فاتورة تلقائية بعد كل زيارة
- تتبع المدفوع والمتبقي
- طباعة إيصال للمريض
- دعم الدفع النقدي والبطاقة والتحويل
- تقرير مالي يومي وشهري

### 5. 🏥 إدارة قائمة الانتظار
- شاشة انتظار لموظف الاستقبال
- شاشة عرض للمرضى (TV Mode)
- ترتيب المرضى حسب وقت الوصول
- تغيير الحالة: انتظار ← داخل ← انتهى

### 6. 📊 التقارير والإحصائيات
- عدد المرضى يومياً وشهرياً
- أكثر الأمراض تكراراً
- الإيرادات والمصروفات
- نسبة الحضور والغياب
- تصدير Excel وPDF

### 7. 👥 إدارة الصلاحيات
- حسابات منفصلة لكل دور
- صلاحيات محددة لكل مستخدم
- سجل العمليات (Audit Log)

---
# V1.0
## قاعدة البيانات

### جداول النظام

```sql
-- ============================================
-- 1. المستخدمون والصلاحيات
-- ============================================
users
├── id              UUID        PK
├── name            VARCHAR
├── email           VARCHAR     UNIQUE
├── password_hash   VARCHAR
├── role            ENUM        (admin | doctor | receptionist | patient)
├── phone           VARCHAR
├── is_active       BOOLEAN     DEFAULT true
└── created_at      TIMESTAMP

-- ============================================
-- 2. الأطباء
-- ============================================
doctors
├── id              UUID        PK
├── user_id         UUID        FK → users
├── specialty       VARCHAR
├── license_number  VARCHAR
├── bio             TEXT
├── consultation_fee DECIMAL
├── working_days    JSON        -- ['sun','mon','tue','wed','thu']
└── working_hours   JSON        -- {"start": "09:00", "end": "17:00"}

-- ============================================
-- 3. المرضى
-- ============================================
patients
├── id              UUID        PK
├── user_id         UUID        FK → users (nullable — قد لا يكون له حساب)
├── patient_code    VARCHAR     UNIQUE  -- P-00123
├── name            VARCHAR
├── date_of_birth   DATE
├── gender          ENUM        (male | female)
├── phone           VARCHAR
├── address         TEXT
├── blood_type      VARCHAR
├── chronic_diseases TEXT
├── allergies       TEXT
└── created_at      TIMESTAMP

-- ============================================
-- 4. المواعيد
-- ============================================
appointments
├── id              UUID        PK
├── patient_id      UUID        FK → patients
├── doctor_id       UUID        FK → doctors
├── appointment_date DATE
├── appointment_time TIME
├── status          ENUM        (scheduled | waiting | in_progress | done | cancelled | no_show)
├── type            ENUM        (new | follow_up)
├── notes           TEXT
├── reminder_sent   BOOLEAN     DEFAULT false
└── created_at      TIMESTAMP

-- ============================================
-- 5. الزيارات / الكشوفات
-- ============================================
visits
├── id              UUID        PK
├── appointment_id  UUID        FK → appointments
├── patient_id      UUID        FK → patients
├── doctor_id       UUID        FK → doctors
├── chief_complaint TEXT        -- سبب الزيارة
├── diagnosis       TEXT
├── notes           TEXT
├── weight          DECIMAL     -- كيلوجرام
├── height          DECIMAL     -- سنتيمتر
├── blood_pressure  VARCHAR     -- مثال: 120/80
├── temperature     DECIMAL     -- درجة مئوية
└── visit_date      TIMESTAMP

-- ============================================
-- 6. الوصفات الطبية
-- ============================================
prescriptions
├── id              UUID        PK
├── visit_id        UUID        FK → visits
├── patient_id      UUID        FK → patients
├── doctor_id       UUID        FK → doctors
├── notes           TEXT
└── created_at      TIMESTAMP

-- ============================================
-- 7. أدوية الوصفة
-- ============================================
prescription_items
├── id              UUID        PK
├── prescription_id UUID        FK → prescriptions
├── medicine_name   VARCHAR
├── dosage          VARCHAR     -- مثال: 500mg
├── frequency       VARCHAR     -- مثال: مرتين يومياً
├── duration        VARCHAR     -- مثال: 7 أيام
└── instructions    TEXT        -- تعليمات خاصة

-- ============================================
-- 8. الفواتير
-- ============================================
invoices
├── id              UUID        PK
├── visit_id        UUID        FK → visits
├── patient_id      UUID        FK → patients
├── invoice_number  VARCHAR     UNIQUE
├── subtotal        DECIMAL
├── discount        DECIMAL     DEFAULT 0
├── total           DECIMAL
├── paid_amount     DECIMAL     DEFAULT 0
├── status          ENUM        (pending | partial | paid)
└── created_at      TIMESTAMP

-- ============================================
-- 9. بنود الفاتورة
-- ============================================
invoice_items
├── id              UUID        PK
├── invoice_id      UUID        FK → invoices
├── description     VARCHAR     -- مثال: كشف، تحليل، أشعة
├── quantity        INTEGER
├── unit_price      DECIMAL
└── total           DECIMAL

-- ============================================
-- 10. المدفوعات
-- ============================================
payments
├── id              UUID        PK
├── invoice_id      UUID        FK → invoices
├── amount          DECIMAL
├── method          ENUM        (cash | card | transfer)
├── paid_at         TIMESTAMP
└── notes           TEXT

-- ============================================
-- 11. الملفات والمرفقات
-- ============================================
medical_files
├── id              UUID        PK
├── patient_id      UUID        FK → patients
├── visit_id        UUID        FK → visits (nullable)
├── file_type       ENUM        (lab | xray | report | other)
├── file_name       VARCHAR
├── file_url        VARCHAR
└── uploaded_at     TIMESTAMP
```

---

## API Endpoints

### 🔐 Auth — المصادقة

```
POST   /api/auth/login                  تسجيل الدخول
POST   /api/auth/logout                 تسجيل الخروج
POST   /api/auth/refresh-token          تجديد التوكن
POST   /api/auth/change-password        تغيير كلمة المرور
POST   /api/auth/forgot-password        نسيت كلمة المرور
POST   /api/auth/reset-password         إعادة تعيين كلمة المرور
```

### 👤 Patients — المرضى

```
GET    /api/patients                    قائمة المرضى (بحث + فلترة)
POST   /api/patients                    إضافة مريض جديد
GET    /api/patients/:id                بيانات مريض محدد
PUT    /api/patients/:id                تعديل بيانات المريض
GET    /api/patients/:id/visits         سجل زيارات المريض
GET    /api/patients/:id/prescriptions  وصفات المريض
GET    /api/patients/:id/files          ملفات المريض
GET    /api/patients/:id/invoices       فواتير المريض
```

### 📅 Appointments — المواعيد

```
GET    /api/appointments                كل المواعيد (فلترة بالتاريخ)
POST   /api/appointments                حجز موعد جديد
GET    /api/appointments/:id            تفاصيل موعد
PUT    /api/appointments/:id            تعديل / إلغاء موعد
GET    /api/appointments/today          مواعيد اليوم
GET    /api/appointments/waiting        قائمة الانتظار الحالية
PATCH  /api/appointments/:id/status     تغيير حالة الموعد
```

### 🏥 Visits — الزيارات

```
POST   /api/visits                      بدء كشف جديد
GET    /api/visits/:id                  تفاصيل الكشف
PUT    /api/visits/:id                  تحديث بيانات الكشف
```

### 💊 Prescriptions — الوصفات

```
POST   /api/prescriptions               إنشاء وصفة جديدة
GET    /api/prescriptions/:id           تفاصيل الوصفة
PUT    /api/prescriptions/:id           تعديل الوصفة
GET    /api/prescriptions/:id/pdf       تصدير الوصفة PDF
```

### 💰 Invoices — الفواتير

```
POST   /api/invoices                    إنشاء فاتورة
GET    /api/invoices/:id                تفاصيل الفاتورة
POST   /api/invoices/:id/pay            تسجيل دفعة
GET    /api/invoices/:id/pdf            طباعة الفاتورة PDF
```

### 👨‍⚕️ Doctors — الطبيب

```
GET    /api/doctors/:id/schedule        جدول الطبيب
GET    /api/doctors/:id/slots           المواعيد المتاحة (للحجز)
PUT    /api/doctors/:id/working-hours   تعديل ساعات العمل
```

### 📊 Reports — التقارير

```
GET    /api/reports/daily               تقرير يومي
GET    /api/reports/monthly             تقرير شهري
GET    /api/reports/financial           تقرير مالي تفصيلي
GET    /api/reports/patients            إحصائيات المرضى
GET    /api/reports/appointments        إحصائيات المواعيد
```

---

# V1.1


> **What changed from V1:** Merged split date/time columns, removed redundant FKs, replaced JSON availability columns with a proper schedule table, added audit log + soft deletes, fixed missing UNIQUE constraint, added `doctor_id` to invoices, introduced `doctor_time_blocks` for vacation/out-of-office, and introduced `prescription_items` as a managed sub-resource in the API. All list endpoints now have documented query parameters and pagination. RBAC permissions are documented per endpoint group.

---

## Database Schema

### 1. users

```sql
users
├── id                UUID          PK
├── name              VARCHAR(150)  NOT NULL
├── email             VARCHAR(255)  UNIQUE NOT NULL
├── password_hash     VARCHAR       NOT NULL
├── role              ENUM          (admin | doctor | receptionist | patient) NOT NULL
├── phone             VARCHAR(20)
├── is_active         BOOLEAN       DEFAULT true
├── deleted_at        TIMESTAMPTZ   -- soft delete; NULL = active
└── created_at        TIMESTAMPTZ   DEFAULT now()
```

---

### 2. doctors

```sql
doctors
├── id                UUID          PK
├── user_id           UUID          FK → users NOT NULL
├── specialty         VARCHAR(100)
├── license_number    VARCHAR(100)  UNIQUE
├── bio               TEXT
├── consultation_fee  DECIMAL(10,2)
└── created_at        TIMESTAMPTZ   DEFAULT now()

-- Working days and hours are now in doctor_schedules (see below)
-- Removed: working_days JSON, working_hours JSON
```

---

### 3. doctor_schedules

Replaces the `working_days` and `working_hours` JSON columns in V1. One row per working day, allowing different hours per day and enabling proper SQL-level availability queries.

```sql
doctor_schedules
├── id                UUID          PK
├── doctor_id         UUID          FK → doctors NOT NULL
├── day_of_week       SMALLINT      NOT NULL  -- 0=Sunday … 6=Saturday
├── start_time        TIME          NOT NULL
├── end_time          TIME          NOT NULL
├── is_active         BOOLEAN       DEFAULT true
└── UNIQUE (doctor_id, day_of_week)
```

---

### 4. doctor_time_blocks

Blocks off specific date ranges for vacations, leave, or out-of-office. The slot availability logic must exclude any time within an active block.

```sql
doctor_time_blocks
├── id                UUID          PK
├── doctor_id         UUID          FK → doctors NOT NULL
├── starts_at         TIMESTAMPTZ   NOT NULL
├── ends_at           TIMESTAMPTZ   NOT NULL
├── reason            VARCHAR(255)  -- e.g. "Annual leave"
└── created_at        TIMESTAMPTZ   DEFAULT now()

-- Constraint: ends_at > starts_at
-- CHECK (ends_at > starts_at)
```

---

### 5. patients

```sql
patients
├── id                UUID          PK
├── user_id           UUID          FK → users UNIQUE  -- nullable for walk-in patients; UNIQUE prevents two patients sharing one account
├── patient_code      VARCHAR(20)   UNIQUE NOT NULL    -- e.g. P-00123
├── name              VARCHAR(150)  NOT NULL
├── date_of_birth     DATE
├── gender            ENUM          (male | female | other)
├── phone             VARCHAR(20)
├── address           TEXT
├── blood_type        VARCHAR(5)
├── chronic_diseases  TEXT
├── allergies         TEXT
├── deleted_at        TIMESTAMPTZ   -- soft delete
└── created_at        TIMESTAMPTZ   DEFAULT now()
```

---

### 6. appointments

```sql
appointments
├── id                UUID          PK
├── patient_id        UUID          FK → patients NOT NULL
├── doctor_id         UUID          FK → doctors  NOT NULL
├── scheduled_at      TIMESTAMPTZ   NOT NULL       -- V1 had two columns (appointment_date DATE + appointment_time TIME); merged into one TIMESTAMPTZ
├── status            ENUM          (scheduled | waiting | in_progress | done | cancelled | no_show) DEFAULT 'scheduled'
├── type              ENUM          (new | follow_up) DEFAULT 'new'
├── notes             TEXT
├── reminder_sent     BOOLEAN       DEFAULT false
└── created_at        TIMESTAMPTZ   DEFAULT now()
```

---

### 7. visits

```sql
visits
├── id                UUID          PK
├── appointment_id    UUID          FK → appointments NOT NULL
├── chief_complaint   TEXT
├── diagnosis         TEXT
├── notes             TEXT
├── weight_kg         DECIMAL(5,2)
├── height_cm         DECIMAL(5,2)
├── blood_pressure    VARCHAR(10)   -- e.g. 120/80
├── temperature_c     DECIMAL(4,1)
├── deleted_at        TIMESTAMPTZ   -- soft delete
└── visit_date        TIMESTAMPTZ   DEFAULT now()

-- Removed: patient_id, doctor_id (both are reachable via appointment_id → appointments)
-- Use: JOIN visits v ON v.appointment_id = a.id JOIN appointments a ON a.patient_id / a.doctor_id
```

---

### 8. prescriptions

```sql
prescriptions
├── id                UUID          PK
├── visit_id          UUID          FK → visits NOT NULL
├── notes             TEXT
├── deleted_at        TIMESTAMPTZ   -- soft delete
└── created_at        TIMESTAMPTZ   DEFAULT now()

-- Removed: patient_id, doctor_id (reachable via visit_id → visits → appointments)
```

---

### 9. prescription_items

```sql
prescription_items
├── id                UUID          PK
├── prescription_id   UUID          FK → prescriptions NOT NULL
├── medicine_name     VARCHAR(150)  NOT NULL
├── dosage            VARCHAR(50)   -- e.g. 500mg
├── frequency         VARCHAR(100)  -- e.g. twice daily
├── duration          VARCHAR(50)   -- e.g. 7 days
└── instructions      TEXT
```

---

### 10. invoices

```sql
invoices
├── id                UUID          PK
├── visit_id          UUID          FK → visits NOT NULL
├── patient_id        UUID          FK → patients NOT NULL  -- denormalized intentionally for fast financial queries
├── doctor_id         UUID          FK → doctors NOT NULL   -- added in V2 for per-doctor revenue reports
├── invoice_number    VARCHAR(30)   UNIQUE NOT NULL
├── subtotal          DECIMAL(10,2) NOT NULL
├── discount          DECIMAL(10,2) DEFAULT 0
├── total             DECIMAL(10,2) NOT NULL
├── paid_amount       DECIMAL(10,2) DEFAULT 0
├── status            ENUM          (pending | partial | paid) DEFAULT 'pending'
└── created_at        TIMESTAMPTZ   DEFAULT now()
```

---

### 11. invoice_items

```sql
invoice_items
├── id                UUID          PK
├── invoice_id        UUID          FK → invoices NOT NULL
├── description       VARCHAR(255)  NOT NULL  -- e.g. Consultation, Lab, X-Ray
├── quantity          INTEGER       NOT NULL DEFAULT 1
├── unit_price        DECIMAL(10,2) NOT NULL
└── total             DECIMAL(10,2) NOT NULL  -- quantity × unit_price
```

---

### 12. payments

```sql
payments
├── id                UUID          PK
├── invoice_id        UUID          FK → invoices NOT NULL
├── amount            DECIMAL(10,2) NOT NULL
├── method            ENUM          (cash | card | transfer) NOT NULL
├── paid_at           TIMESTAMPTZ   DEFAULT now()
└── notes             TEXT
```

---

### 13. medical_files

```sql
medical_files
├── id                UUID          PK
├── patient_id        UUID          FK → patients NOT NULL
├── visit_id          UUID          FK → visits   -- nullable; NULL = uploaded outside a visit context
├── source_type       ENUM          (visit | onboarding | manual) NOT NULL DEFAULT 'manual'  -- added in V2 to clarify upload origin
├── file_type         ENUM          (lab | xray | report | other) NOT NULL
├── file_name         VARCHAR(255)  NOT NULL
├── file_url          VARCHAR(1000) NOT NULL
├── file_size_bytes   INTEGER
└── uploaded_at       TIMESTAMPTZ   DEFAULT now()
```

---

### 14. audit_logs

New in V2. Records every create / update / delete action across clinical and financial tables for compliance and traceability.

```sql
audit_logs
├── id                UUID          PK
├── table_name        VARCHAR(100)  NOT NULL  -- e.g. 'appointments'
├── record_id         UUID          NOT NULL  -- PK of the affected row
├── action            ENUM          (create | update | delete) NOT NULL
├── old_value         JSONB         -- NULL for create actions
├── new_value         JSONB         -- NULL for delete actions
├── performed_by      UUID          FK → users NOT NULL
└── performed_at      TIMESTAMPTZ   DEFAULT now()

-- Index: (table_name, record_id) for fast per-record history lookups
-- Index: (performed_by) for per-user activity audits
-- Index: (performed_at) for time-range audit reports
```

---

### Entity Relationship Summary

```
users ──────────────── doctors ─────── doctor_schedules
  │                       │
  │                       └─────────── doctor_time_blocks
  │
  └──── patients
            │
            └─── appointments ──────── visits ─── prescriptions ─── prescription_items
                                          │
                                          └──── invoices ─── invoice_items
                                                    │
                                                    └──── payments
patients ────────────────────────────────────────────────── medical_files
users ──────────────────────────────────────────────────── audit_logs
```

---

## API Documentation

### Base URL

```
/api/v2
```

All requests must include:

```
Authorization: Bearer <token>
Content-Type: application/json
```

All list endpoints support the following common query parameters unless otherwise noted:

| Parameter | Type    | Default | Description                        |
|-----------|---------|---------|------------------------------------|
| `page`    | integer | 1       | Page number                        |
| `limit`   | integer | 20      | Results per page (max 100)         |

All list responses follow this envelope:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 340,
    "total_pages": 17
  }
}
```

---

### RBAC Permission Matrix

| Role          | Patients     | Appointments  | Visits       | Prescriptions | Invoices / Payments | Reports      | Admin        |
|---------------|-------------|---------------|--------------|---------------|---------------------|--------------|--------------|
| admin         | Full         | Full          | Full         | Full          | Full                | Full         | Full         |
| doctor        | Read + Update| Read + Status | Full         | Full          | Read only           | Own data     | None         |
| receptionist  | Full         | Full          | Read only    | Read only     | Full                | Financial    | None         |
| patient       | Own record   | Own records   | Own records  | Own records   | Own records         | None         | None         |

---

### 🔐 Auth

```
POST   /api/v2/auth/login                  Login — returns access_token + refresh_token
POST   /api/v2/auth/logout                 Logout — invalidates current token
POST   /api/v2/auth/refresh-token          Exchange refresh_token for a new access_token
POST   /api/v2/auth/change-password        Change password (authenticated)
POST   /api/v2/auth/forgot-password        Request password reset email
POST   /api/v2/auth/reset-password         Complete reset with token from email
```

---

### 👤 Patients

```
GET    /api/v2/patients                    List patients
POST   /api/v2/patients                    Create patient
GET    /api/v2/patients/:id                Get patient
PUT    /api/v2/patients/:id                Update patient
DELETE /api/v2/patients/:id                Soft-delete patient (sets deleted_at)
GET    /api/v2/patients/:id/visits         Patient visit history
GET    /api/v2/patients/:id/prescriptions  Patient prescriptions
GET    /api/v2/patients/:id/files          Patient medical files
POST   /api/v2/patients/:id/files          Upload a medical file (multipart/form-data)
GET    /api/v2/patients/:id/invoices       Patient invoices
```

#### GET /api/v2/patients — query parameters

| Parameter    | Type    | Description                                       |
|-------------|---------|---------------------------------------------------|
| `search`    | string  | Name, phone, or patient_code (partial match)      |
| `gender`    | string  | `male` / `female` / `other`                       |
| `blood_type`| string  | Filter by blood type                              |
| `created_from`| date  | ISO 8601 date — created on or after              |
| `created_to`| date    | ISO 8601 date — created on or before             |

---

### 📅 Appointments

Removed `/appointments/today` and `/appointments/waiting` as dedicated routes (routing conflict with `/:id`). Use query parameters instead.

```
GET    /api/v2/appointments                List appointments
POST   /api/v2/appointments                Book appointment
GET    /api/v2/appointments/:id            Get appointment
PUT    /api/v2/appointments/:id            Update appointment
DELETE /api/v2/appointments/:id            Cancel appointment (sets status = cancelled)
PATCH  /api/v2/appointments/:id/status     Update status only
```

#### GET /api/v2/appointments — query parameters

| Parameter    | Type     | Description                                                                     |
|-------------|----------|---------------------------------------------------------------------------------|
| `doctor_id` | UUID     | Filter by doctor                                                                |
| `patient_id`| UUID     | Filter by patient                                                               |
| `status`    | string   | `scheduled` / `waiting` / `in_progress` / `done` / `cancelled` / `no_show`    |
| `date`      | date     | Exact date — e.g. `?date=2025-08-01` (replaces `/today` route)                 |
| `from`      | datetime | ISO 8601 — scheduled_at on or after                                            |
| `to`        | datetime | ISO 8601 — scheduled_at on or before                                           |
| `type`      | string   | `new` / `follow_up`                                                             |

**Example — today's waiting list:**
```
GET /api/v2/appointments?date=2025-08-01&status=waiting
```

---

### 🏥 Visits

```
POST   /api/v2/visits                      Start a new visit (linked to an appointment)
GET    /api/v2/visits/:id                  Get visit details
PATCH  /api/v2/visits/:id/vitals           Update vitals (weight, height, blood_pressure, temperature)
PATCH  /api/v2/visits/:id/diagnosis        Update clinical notes and diagnosis
```

`PUT /api/v2/visits/:id` from V1 is split into two PATCH endpoints to allow separate permission scopes — receptionists can update vitals; only doctors can update diagnosis.

---

### 💊 Prescriptions

```
POST   /api/v2/prescriptions                Create prescription (linked to a visit)
GET    /api/v2/prescriptions/:id            Get prescription with items
PATCH  /api/v2/prescriptions/:id            Update prescription notes
GET    /api/v2/prescriptions/:id/pdf        Export prescription as PDF

POST   /api/v2/prescriptions/:id/items      Add medication item
PUT    /api/v2/prescriptions/:id/items/:itemId   Update medication item
DELETE /api/v2/prescriptions/:id/items/:itemId   Remove medication item
```

`prescription_items` are now a managed sub-resource so a doctor can add or remove a single medication without replacing the entire prescription.

---

### 💰 Invoices & Payments

```
POST   /api/v2/invoices                    Create invoice (linked to a visit)
GET    /api/v2/invoices/:id                Get invoice with line items
PUT    /api/v2/invoices/:id                Update invoice (before payment)
GET    /api/v2/invoices/:id/pdf            Print invoice as PDF

POST   /api/v2/invoices/:id/payments       Record a payment   ← renamed from /pay in V1
GET    /api/v2/invoices/:id/payments       List payments on this invoice
```

`POST /invoices/:id/pay` is renamed to `POST /invoices/:id/payments` — creating a payment is a sub-resource creation, not an action verb on the invoice.

---

### 👨‍⚕️ Doctors

```
GET    /api/v2/doctors                     List doctors            ← new in V2
GET    /api/v2/doctors/:id                 Get doctor profile
PUT    /api/v2/doctors/:id                 Update doctor profile (admin only)

GET    /api/v2/doctors/:id/schedule        Get working schedule (doctor_schedules rows)
PUT    /api/v2/doctors/:id/schedule        Replace full weekly schedule
PATCH  /api/v2/doctors/:id/schedule/:dayId Update a single day's hours

GET    /api/v2/doctors/:id/slots           Available booking slots
GET    /api/v2/doctors/:id/time-blocks     List time blocks (vacation / leave)
POST   /api/v2/doctors/:id/time-blocks     Add a time block
DELETE /api/v2/doctors/:id/time-blocks/:blockId   Remove a time block
```

#### GET /api/v2/doctors — query parameters

| Parameter    | Type   | Description                           |
|-------------|--------|---------------------------------------|
| `search`    | string | Name or specialty (partial match)     |
| `specialty` | string | Exact specialty filter                |
| `available` | date   | Return only doctors with open slots on this date |

#### GET /api/v2/doctors/:id/slots — query parameters

| Parameter | Type | Required | Description                                     |
|-----------|------|----------|-------------------------------------------------|
| `date`    | date | Yes      | Date to check availability for                  |
| `duration`| int  | No       | Slot duration in minutes (default: 30)          |

Slot availability logic must exclude:
- Times outside `doctor_schedules` for that day of the week
- Times overlapping any `doctor_time_blocks` record
- Times already taken by an appointment with status `scheduled` / `waiting` / `in_progress`

---

### 📁 Medical Files

```
POST   /api/v2/patients/:id/files          Upload file (multipart/form-data)
GET    /api/v2/patients/:id/files          List files
DELETE /api/v2/patients/:id/files/:fileId  Delete file
```

#### POST /api/v2/patients/:id/files — form fields

| Field         | Type    | Required | Description                                           |
|---------------|---------|----------|-------------------------------------------------------|
| `file`        | binary  | Yes      | File content (max 20 MB)                              |
| `file_type`   | string  | Yes      | `lab` / `xray` / `report` / `other`                  |
| `visit_id`    | UUID    | No       | Associate with a specific visit                       |
| `source_type` | string  | No       | `visit` / `onboarding` / `manual` (default: `manual`)|

#### GET /api/v2/patients/:id/files — query parameters

| Parameter   | Type   | Description                          |
|------------|--------|--------------------------------------|
| `file_type`| string | Filter by type                       |
| `visit_id` | UUID   | Filter by visit                      |
| `from`     | date   | Uploaded on or after                 |
| `to`       | date   | Uploaded on or before                |

---

### 📊 Reports

All report endpoints are restricted to `admin` and `receptionist` roles, except `GET /reports/doctor/:id/*` which is also accessible by the `doctor` for their own ID.

```
GET    /api/v2/reports/daily               Daily summary (appointments, revenue, new patients)
GET    /api/v2/reports/monthly             Monthly summary
GET    /api/v2/reports/financial           Detailed financial report (invoices, payments, outstanding)
GET    /api/v2/reports/patients            Patient statistics (new, returning, demographics)
GET    /api/v2/reports/appointments        Appointment statistics (by status, type, no-shows)
GET    /api/v2/reports/doctor/:id/revenue  Per-doctor revenue breakdown  ← new in V2
```

#### Common report query parameters

| Parameter | Type | Description              |
|-----------|------|--------------------------|
| `from`    | date | Period start (ISO 8601)  |
| `to`      | date | Period end (ISO 8601)    |

---

### 🔍 Audit Log

Restricted to `admin` only.

```
GET    /api/v2/audit-logs                  Query audit log
```

#### GET /api/v2/audit-logs — query parameters

| Parameter      | Type   | Description                              |
|---------------|--------|------------------------------------------|
| `table_name`  | string | Filter by table (e.g. `appointments`)    |
| `record_id`   | UUID   | Filter by specific record                |
| `performed_by`| UUID   | Filter by user who made the change       |
| `action`      | string | `create` / `update` / `delete`           |
| `from`        | date   | performed_at on or after                 |
| `to`          | date   | performed_at on or before                |

---

## Key Changes Summary — V1 → V2

| Area | V1 | V2 |
|------|----|----|
| Appointment date/time | Two columns: `appointment_date DATE` + `appointment_time TIME` | Single `scheduled_at TIMESTAMPTZ` |
| Doctor availability | `working_days JSON` + `working_hours JSON` on `doctors` | Separate `doctor_schedules` table (one row per day) |
| Vacation / leave | Not modelled | `doctor_time_blocks` table |
| Redundant FKs | `visits` + `prescriptions` carried `patient_id` + `doctor_id` | Removed; traversed via `appointment_id` / `visit_id` |
| `patients.user_id` | No UNIQUE constraint | `UNIQUE` (nullable) |
| Invoices | No `doctor_id` | `doctor_id FK` added |
| Soft deletes | None | `deleted_at TIMESTAMPTZ` on patients, visits, prescriptions |
| Audit trail | None | `audit_logs` table |
| Today's appointments | Dedicated route `/appointments/today` | Query param `?date=2025-08-01` |
| Waiting list | Dedicated route `/appointments/waiting` | Query param `?status=waiting` |
| Doctor list | No endpoint | `GET /api/v2/doctors` |
| Patient deactivation | No endpoint | `DELETE /api/v2/patients/:id` (soft delete) |
| Payment recording | `POST /invoices/:id/pay` | `POST /invoices/:id/payments` |
| Prescription items | No sub-resource endpoints | `POST/PUT/DELETE /prescriptions/:id/items/:itemId` |
| Visit update | Single `PUT /visits/:id` | Split into `PATCH /visits/:id/vitals` + `PATCH /visits/:id/diagnosis` |
| File uploads | No upload endpoint | `POST /patients/:id/files` (multipart) |
| Pagination | Undocumented | Documented on all list endpoints |
| RBAC | Undocumented | Documented per endpoint group |

## خريطة الموقع Sitemap

### 🌐 صفحات عامة — Public (بدون تسجيل دخول)

```
/                           الصفحة الرئيسية
├── Hero + CTA "احجز الآن"
├── عرض الخدمات الرئيسية
├── آراء المرضى
└── معلومات التواصل + الخريطة

/about                      عن الطبيب
├── السيرة الذاتية
└── التخصص والشهادات

/services                   الخدمات والأسعار

/book                       حجز موعد ← أهم صفحة
├── Step 1: اختيار الخدمة
├── Step 2: اختيار التاريخ والوقت
├── Step 3: بيانات المريض
└── Step 4: تأكيد + إرسال SMS/Email

/contact                    تواصل معنا
```

### 🔐 صفحات المصادقة — Auth

```
/auth/login                 تسجيل الدخول
/auth/register              إنشاء حساب (للمريض فقط)
/auth/forgot-password       نسيت كلمة المرور
/auth/reset-password        إعادة تعيين كلمة المرور
```

### 🧑‍🦱 بوابة المريض — Patient Portal

```
/patient/dashboard          لوحة المريض
├── الموعد القادم مع عداد تنازلي
├── آخر زيارة وملخصها
└── إشعارات غير مقروءة

/patient/appointments       مواعيدي
/patient/records            سجلي الطبي
/patient/prescriptions      وصفاتي
/patient/profile            ملفي الشخصي
```

### 👩‍💼 لوحة الاستقبال — Reception

```
/reception/dashboard        لوحة التحكم

/reception/queue            قائمة الانتظار (Live)
├── قائمة المرضى الحاضرين بالترتيب
├── تغيير الحالة: انتظار → داخل → انتهى
├── إضافة Walk-in
└── TV Mode للشاشة الخارجية

/reception/appointments     إدارة المواعيد
/reception/appointments/new حجز موعد جديد

/reception/patients         قائمة المرضى
/reception/patients/new     تسجيل مريض جديد
/reception/patients/[id]    ملف مريض محدد

/reception/invoices         الفواتير
/reception/invoices/[id]    تفاصيل فاتورة
```

### 🧑‍⚕️ لوحة الطبيب — Doctor

```
/doctor/dashboard           لوحة التحكم
├── مواعيد اليوم
├── عدد المرضى الأسبوع والشهر
└── تنبيهات ومتابعات

/doctor/schedule            جدول اليوم

/doctor/patients/[id]       ملف مريض
├── التاريخ المرضي الكامل
├── كل الزيارات السابقة
└── الوصفات والملفات

/doctor/visits/[id]         كشف جديد / تفاصيل كشف
├── Vitals: ضغط، وزن، حرارة
├── الشكوى الرئيسية والتشخيص
├── ملاحظات الطبيب
└── إنشاء وصفة مباشرة

/doctor/prescriptions/new   إنشاء وصفة
```

### 📊 لوحة المدير — Admin

```
/admin/dashboard            الإحصائيات العامة

/admin/reports              التقارير
├── /admin/reports/financial    المالي
├── /admin/reports/patients     إحصائيات المرضى
└── /admin/reports/appointments إحصائيات المواعيد

/admin/users                إدارة المستخدمين
/admin/users/new            إضافة موظف جديد

/admin/settings             إعدادات النظام
├── مواعيد العمل (أيام + ساعات)
├── مدة الكشف الافتراضية
└── إعداد SMS/Email

/admin/clinic               إعدادات العيادة
├── اسم العيادة + اللوجو
├── بيانات الطبيب للوصفات
└── الرقم الترخيصي
```

### 🖨️ صفحات الطباعة — Print Routes

```
/print/prescription/[id]    طباعة وصفة
/print/invoice/[id]         طباعة فاتورة
/print/patient-report/[id]  تقرير مريض
```

### 📺 شاشة الانتظار — TV Display

```
/display/queue              شاشة العيادة الخارجية للمرضى
```

---

## التقنيات المستخدمة

```
الفئة               التقنية
──────────────────────────────────────
Frontend            Next.js 14 (App Router)
Database            PostgreSQL
ORM                 Prisma
Auth                NextAuth.js
UI Components       Shadcn/ui + Tailwind CSS
File Upload         Uploadthing أو Cloudinary
PDF Generation      React-PDF
Notifications       Twilio (SMS) أو WhatsApp Business API
Charts              Recharts
Deployment          Vercel + Railway (DB)
```

---

## قرارات التصميم

### طبيب واحد الآن

- صفحة `/book` لا تحتوي على اختيار طبيب — التقويم مباشر
- لوحة `/doctor/dashboard` مخصصة لشخص واحد
- جدول العمل يُدار من `/admin/settings` مباشرة

### قابلية التوسع مستقبلاً

- جدول `doctors` موجود مسبقاً في الـ Database
- كل الـ routes مبنية على `[id]` ديناميكي
- عند إضافة طبيب ثانٍ: إضافة `/book?doctor=[id]` فقط بدون تعديل Schema

### أولويات الـ MVP

```
المرحلة 1 (الأساسي)
├── نظام المواعيد والحجز
├── ملفات المرضى الأساسية
├── قائمة الانتظار
└── الفواتير البسيطة

المرحلة 2 (التوسع)
├── الوصفات الرقمية + PDF
├── التقارير والإحصائيات
├── التذكيرات التلقائية SMS
└── بوابة المريض الأونلاين

المرحلة 3 (المتقدم)
├── شاشة الانتظار TV Mode
├── رفع ملفات التحاليل
├── تصدير Excel للتقارير
└── دعم أطباء متعددين
```

---

> **آخر تحديث:** يونيو 2025
> **الحالة:** قيد التصميم — Pre-development
> **المطور:** Full Stack — Next.js


<!-- /contact
/reception/patients
/reception/queue
/reception/invoices
/doctor/dashboard -->

<!-- /admin/dashboard
/admin/settings -->

/print/prescription/[id]
/display/queue