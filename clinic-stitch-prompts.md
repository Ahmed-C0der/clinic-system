# 🎨 Google Stitch Prompts — Clinic Management System

### نسخة مُحسَّنة لـ Google Stitch

---

## 🎨 Design Token (أضفه في بداية كل prompt)

```
RTL Arabic UI. Colors: primary #1A6B5A, accent #2DBFA0, bg #F9FAFB, text #1C1C1E.
Fonts: Noto Kufi Arabic (headings), IBM Plex Arabic (body), Tajawal (UI/buttons).
Cards: white, 12px radius, soft shadow. All labels and content in Arabic.
```

---

## 🌐 Public Pages

---

### 1. `/` — الصفحة الرئيسية

```
RTL Arabic medical clinic homepage sketch.
Use the provided doctor photo in the hero section.

- Navbar: logo right, links center, "احجز موعد" accent button left
- Hero: right side headline + 2 buttons, left side doctor photo in rounded card
- Stats bar: dark green bg, 3 white numbers (مرضى / سنوات / رضا)
- Services: 3 white cards with icon + title + description
- How to book: 3 steps connected with dashed line
- Testimonials: 3 quote cards with star rating
- Footer: dark bg, 3 columns

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 2. `/about` — عن الطبيب

```
RTL Arabic "About the Doctor" page sketch.
Use the provided doctor photo as the main hero image.

- Hero: doctor photo left (large rounded), right side name + specialty badge + bio + 3 stats
- Specialties: 2-column checklist with accent checkmarks
- Timeline: vertical RTL timeline, education and experience entries
- Certifications: horizontal scrollable cards
- CTA: dark green banner, white headline, accent button

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 3. `/services` — الخدمات

```
RTL Arabic medical services page sketch.

- Page header: light green bg, centered title "خدماتنا الطبية", breadcrumb
- Services grid: 3 columns, each card has icon + name + description + price badge + book link
- Pricing table: clean rows, service | duration | price | button
- FAQ: accordion style, 5 questions
- CTA banner: dark green, centered button

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 4. `/book` — حجز موعد ⭐

```
RTL Arabic appointment booking page sketch. Most important page.
Use the provided doctor photo as a small trust element in the sidebar.

- 4-step progress bar at top: اختر الخدمة | اختر الموعد | بياناتك | التأكيد
- Left 60%: multi-step form
  Step 1: 2x2 service selection cards with icon + name + price
  Step 2: calendar (available days green, unavailable gray) + time slot pills below
  Step 3: form fields (name, phone, email, notes) + returning patient toggle
  Step 4: summary card + confirm button
- Right 40%: sticky sidebar with doctor photo + booking summary

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

### 5. `/contact` — تواصل معنا

```
RTL Arabic contact page sketch.

- Page header: centered title "تواصل معنا"
- 2 columns:
  Right: 4 info cards (address, phone, email, hours) with accent icons + working hours card
  Left: contact form (name, phone, subject, message, submit button)
- Full-width map placeholder at bottom with clinic marker

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

## 🔐 Auth Pages

---

### 6. `/auth/login` — تسجيل الدخول

```
RTL Arabic login page sketch.
Use the provided doctor photo as a small circular image on the green panel.

- Split layout full screen:
  Left 45%: dark green panel, clinic logo, doctor circular photo, tagline in white
  Right 55%: white card centered, title "تسجيل الدخول", email field, password field with show/hide, remember me checkbox, forgot password link, full-width accent login button, register link below

Colors: #1A6B5A #2DBFA0 white. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

### 7. `/auth/register` — إنشاء حساب

```
RTL Arabic patient registration page sketch.
Use the provided doctor photo as a small circular image on the green panel.

- Same split layout as login page
- Right side white card: title "إنشاء حساب مريض"
- 2-step indicator at top of form
- Step 1 fields: full name, date of birth, gender radio, phone
- Step 2 fields: email, password, confirm password, password strength bar, terms checkbox
- Full-width accent register button, login link below

Colors: #1A6B5A #2DBFA0 white. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

## 🧑‍🦱 Patient Portal

---

### 8. `/patient/dashboard` — لوحة المريض

```
RTL Arabic patient dashboard sketch.

- Right sidebar: patient avatar + name, nav links (الرئيسية / مواعيدي / سجلي / وصفاتي / ملفي), active link accent pill
- Main content:
  Top: greeting "مرحباً [الاسم]"
  Next appointment card: dark green bg, doctor name, date/time large, countdown badge, 2 buttons
  Stats row: 3 small cards (visits count, last visit, active prescriptions)
  Last visit summary card with diagnosis + "عرض التفاصيل" link
  Quick actions: 4 icon buttons row

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 9. `/patient/appointments` — مواعيدي

```
RTL Arabic patient appointments page sketch.

- Same sidebar as patient dashboard
- Main content:
  Top bar: title "مواعيدي" + "احجز موعداً +" accent button
  Tabs: المواعيد القادمة | السابقة (accent underline on active)
  Appointment cards list:
    Each card: date badge (dark green) | service + doctor + time | status pill | action buttons
  Upcoming: "مؤكد" green pill, cancel + reschedule buttons
  Past: "مكتمل" gray pill, view details + rebook buttons

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 10. `/patient/records` — السجل الطبي

```
RTL Arabic patient medical records page sketch.

- Same sidebar as patient dashboard
- Main content:
  Title: "سجلي الطبي الكامل"
  Vertical timeline (RTL right-aligned):
    Each entry: date circle | card with visit reason + diagnosis + vitals pills (وزن/ضغط/حرارة) + view prescription link
  Medical files section below:
    Grid of file cards: file icon + name + date + download button

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

## 👩‍💼 Reception

---

### 11. `/reception/dashboard` — لوحة الاستقبال

```
RTL Arabic reception dashboard sketch.

- Top navbar only (no sidebar): logo, today's date, receptionist name + avatar, notifications bell
- 3-column layout:
  Left 30%: today's appointments list, scrollable, each row: time + name + status dot, "إضافة حجز +" button
  Middle 40%: live waiting queue, large numbered cards, #1 card accent colored "داخل الكشف", others white with wait timer, "استدعاء التالي" button
  Right 30%: stats cards (revenue, patients, avg wait) + quick action buttons

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

### 12. `/reception/patients` — المرضى

```
RTL Arabic patient management page sketch.

- Top navbar (same reception style)
- Top bar: title "سجلات المرضى" + large search input + "إضافة مريض +" accent button
- Filter row: dropdown filters + sort options
- Data table:
  Columns: رقم المريض | الاسم | الهاتف | آخر زيارة | عدد الزيارات | الحالة | إجراءات
  Status badges: "نشط" green / "جديد" blue
  Row actions: view icon + calendar icon
  Alternating row colors

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

### 13. `/reception/queue` — قائمة الانتظار

```
RTL Arabic live waiting queue page sketch. Designed for real-time use.

- Top bar: "قائمة الانتظار المباشرة" + live green pulsing dot + current time + "TV Mode" button + "إضافة Walk-in +" button
- Large queue cards 3 states:
  "داخل الكشف": one large accent green card, patient name huge white text
  "في الانتظار": numbered white cards with left accent border, name + wait time counter + "استدعاء" button
  "منتهى": faded gray cards with checkmark
- Side panel: today's remaining appointments mini list + daily stats

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

### 14. `/reception/invoices` — الفواتير

```
RTL Arabic invoices management page sketch.

- Top bar: title "الفواتير" + date filter + "فاتورة جديدة +" accent button
- Summary row: 3 cards (إجمالي اليوم gray | مدفوع green | متبقي orange)
- Data table:
  Columns: رقم الفاتورة | المريض | التاريخ | الإجمالي | المدفوع | الحالة | إجراءات
  Status: "مدفوع" green / "جزئي" orange / "معلق" red badges
  Actions: print + payment + view icons

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

## 🧑‍⚕️ Doctor

---

### 15. `/doctor/dashboard` — لوحة الطبيب

```
RTL Arabic doctor dashboard sketch.
Use the provided doctor photo as circular avatar in the sidebar.

- Right sidebar: doctor photo circle + name + specialty, nav links (لوحتي / جدول اليوم / المرضى / الوصفات)
- Main content:
  Greeting: "صباح الخير د. [الاسم]" large + today's date + "لديك ٨ مرضى اليوم"
  Today's schedule: vertical list, current patient card accent highlighted with "بدء الكشف" button
  Stats row: 4 cards (مرضى اليوم / الأسبوع / وصفات / متابعات)
  Recent patients: mini list, last 5, name + diagnosis + date

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 16. `/doctor/visits/[id]` — صفحة الكشف

```
RTL Arabic medical examination page sketch. Full-width, no sidebar.

- Top patient bar: name large + age + gender + blood type badge + patient code + visit history link
- 2 columns:
  Left 65%: visit form
    Vitals row: 4 inputs (وزن / طول / ضغط / حرارة) with icons
    Chief complaint textarea
    Diagnosis field with quick-add tag chips
    Doctor notes rich textarea
    Prescription section: medicine search + dosage + frequency + duration row, add more button
    File upload drag-drop zone
  Right 35%: previous visits condensed timeline, last 5 visits
- Sticky bottom bar: "حفظ وإنهاء الكشف" accent button + "حفظ مؤقت" outlined + "طباعة الوصفة"

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

## 📊 Admin

---

### 17. `/admin/dashboard` — لوحة المدير

```
RTL Arabic admin analytics dashboard sketch.

- Right sidebar: nav (الإحصائيات / التقارير / المستخدمون / الإعدادات)
- Main content:
  Top: title + date range picker
  KPI row: 4 cards with % change arrows (إيرادات / مرضى جدد / نسبة حضور / متوسط وقت)
  Revenue line chart: 30 days, accent color line, light green area fill
  2 charts side by side: pie chart (توزيع الخدمات) + bar chart (أيام الأسبوع)
  Recent activity table: last 10 rows, date + patient + service + status badge

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + IBM Plex Arabic. RTL.
```

---

### 18. `/admin/settings` — الإعدادات

```
RTL Arabic clinic settings page sketch.

- Right settings sidebar: معلومات العيادة | أوقات العمل | الإشعارات | المستخدمون | الأسعار
- Main area showing "أوقات العمل" active:
  7-row days table: day name | ON/OFF toggle | start time | end time | break start | break end
  Off days: grayed out row
  Appointment duration stepper below table
  Max appointments per day slider
  Save button full-width accent at bottom

Colors: #1A6B5A #2DBFA0 #F9FAFB. Fonts: Noto Kufi Arabic + Tajawal. RTL.
```

---

## 🖨️ Print

---

### 19. `/print/prescription/[id]` — طباعة الوصفة

```
RTL Arabic printable prescription sketch. A4 size, clean medical layout.

- Screen view: white A4 card on gray bg, "طباعة" + "PDF" buttons above
- Prescription card:
  Header: clinic logo right + name + doctor name + specialty + license number, green divider line
  Patient bar: name | age | date | prescription number in 2x2 grid
  Body: large Rx symbol, numbered medicine list (name bold + dosage + frequency + duration per row)
  Diagnosis section: label + text
  Notes section: label + text
  Footer: doctor signature area right + clinic stamp area left + validity disclaimer

Colors: #1A6B5A for headers/borders, black text, white bg. Fonts: Noto Kufi Arabic. RTL.
```

---

## 📺 TV Display

---

### 20. `/display/queue` — شاشة الانتظار

```
RTL Arabic waiting room TV display sketch. Full screen, readable from 4 meters away.

- Dark green full background #1A6B5A
- Top bar: clinic logo + name right (white), large digital clock + date left (white)
- 2 columns main area:
  Left 35%: "يُكشف الآن" box in accent #2DBFA0 bg, patient name in 64px+ white bold, stethoscope icon above
  Right 65%: "قائمة الانتظار" title white, numbered rows (large text): number circle + patient name + estimated wait, first row slightly highlighted
- Bottom ticker: dark banner, scrolling Arabic text with clinic info or health tip

All text minimum 28px. Colors: #1A6B5A bg, #2DBFA0 accent, white text. Font: Noto Kufi Arabic.
```

---

## 💡 Stitch Tips

> نصائح عند الاستخدام في Google Stitch

```
1. ابدأ بـ Design Token الموجود في الأعلى كـ "Style Reference"
2. كل prompt يشتغل لوحده — مش محتاج تحط كل الـ 20 مرة واحدة
3. لو الناتج مش RTL صح، أضف في البداية: "Strictly RTL, Arabic text flows right to left"
4. لو حابب تضيف صورة الطبيب: ارفع الصورة أولاً في Stitch قبل الـ prompt
5. أهم 3 صفحات تبدأ بيهم: /book ثم /reception/dashboard ثم /doctor/visits/[id]
```

<!-- TODO : generate these pages as prompt  -->

/contact
/reception/patients
/reception/queue
/reception/invoices
/doctor/dashboard
/admin/dashboard
/admin/settings
/print/prescription/[id]
/display/queue
