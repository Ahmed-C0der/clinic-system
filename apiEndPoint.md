# API Documentation

## Base URL

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

## RBAC Permission Matrix

| Role          | Patients     | Appointments  | Visits       | Prescriptions | Invoices / Payments | Reports      | Admin        |
|---------------|-------------|---------------|--------------|---------------|---------------------|--------------|--------------|
| admin         | Full         | Full          | Full         | Full          | Full                | Full         | Full         |
| doctor        | Read + Update| Read + Status | Full         | Full          | Read only           | Own data     | None         |
| receptionist  | Full         | Full          | Read only    | Read only     | Full                | Financial    | None         |
| patient       | Own record   | Own records   | Own records  | Own records   | Own records         | None         | None         |

---

## 🔐 Auth

```
POST   /api/v2/auth/login                  Login — returns access_token + refresh_token
Response 
{
  "access_token": "<token>",
  "refresh_token": "<token>",
  "expires_in": 3600,
  "user": {
    "id": "<id>",
    "email": "[EMAIL_ADDRESS]",
    "role": "doctor",
    "is_active": true,
    "profile": {
      "id": "f11d0c62-d3e9-4f58-83f8-a6be95e7e67e",
      "full_name": "Dr. Ahmed Ali",
      "specialty": "Cardiology",
      "phone": "+201012345678",
      "avatar_url": null
    }
  }
}
POST   /api/v2/auth/logout                 Logout — invalidates current token
POST   /api/v2/auth/refresh-token          Exchange refresh_token for a new access_token
POST   /api/v2/auth/change-password        Change password (authenticated)
POST   /api/v2/auth/forgot-password        Request password reset email
POST   /api/v2/auth/reset-password         Complete reset with token from email
```

---

## 👤 Patients

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

### GET /api/v2/patients — query parameters

| Parameter    | Type    | Description                                       |
|-------------|---------|---------------------------------------------------|
| `search`    | string  | Name, phone, or patient_code (partial match)      |
| `gender`    | string  | `male` / `female` / `other`                       |
| `blood_type`| string  | Filter by blood type                              |
| `created_from`| date  | ISO 8601 date — created on or after              |
| `created_to`| date    | ISO 8601 date — created on or before             |

---

## 📅 Appointments

Removed `/appointments/today` and `/appointments/waiting` as dedicated routes (routing conflict with `/:id`). Use query parameters instead.

```
GET    /api/v2/appointments                List appointments
POST   /api/v2/appointments                Book appointment
GET    /api/v2/appointments/:id            Get appointment
PUT    /api/v2/appointments/:id            Update appointment
DELETE /api/v2/appointments/:id            Cancel appointment (sets status = cancelled)
PATCH  /api/v2/appointments/:id/status     Update status only
```

### GET /api/v2/appointments — query parameters

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

## 🏥 Visits

```
POST   /api/v2/visits                      Start a new visit (linked to an appointment)
GET    /api/v2/visits/:id                  Get visit details
PATCH  /api/v2/visits/:id/vitals           Update vitals (weight, height, blood_pressure, temperature)
PATCH  /api/v2/visits/:id/diagnosis        Update clinical notes and diagnosis
```

`PUT /api/v2/visits/:id` from V1 is split into two PATCH endpoints to allow separate permission scopes — receptionists can update vitals; only doctors can update diagnosis.

---

## 💊 Prescriptions

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

## 💰 Invoices & Payments

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

## 👨‍⚕️ Doctors

```
GET    /api/v2/doctors                     List doctors            ← new in V2
GET    /api/v2/doctors/:id                 Get doctor profile
PUT    /api/v2/doctors/:id                 Update doctor profile (admin  or doctor only)

GET    /api/v2/doctors/:id/schedule        there is no need for authanticate here Get working schedule (doctor_schedules rows)
PUT    /api/v2/doctors/:id/schedule        Replace full weekly schedule

PATCH  /api/v2/doctors/:id/schedule/:dayId Update a single day's hours

GET    /api/v2/doctors/:id/slots           Available booking slots

GET    /api/v2/doctors/:id/time-blocks     List time blocks (vacation / leave)
POST   /api/v2/doctors/:id/time-blocks     Add a time block

DELETE /api/v2/doctors/:id/time-blocks/:blockId   Remove a time block
```

### GET /api/v2/doctors — query parameters

| Parameter    | Type   | Description                           |
|-------------|--------|---------------------------------------|
| `search`    | string | Name or specialty (partial match)     |
| `specialty` | string | Exact specialty filter                |
| `available` | date   | Return only doctors with open slots on this date |

### GET /api/v2/doctors/:id/slots — query parameters

| Parameter | Type | Required | Description                                     |
|-----------|------|----------|-------------------------------------------------|
| `date`    | date | Yes      | Date to check availability for                  |
| `duration`| int  | No       | Slot duration in minutes (default: 30)          |

Slot availability logic must exclude:
- Times outside `doctor_schedules` for that day of the week
- Times overlapping any `doctor_time_blocks` record
- Times already taken by an appointment with status `scheduled` / `waiting` / `in_progress`

---

## 📁 Medical Files

```
POST   /api/v2/patients/:id/files          Upload file (multipart/form-data)
GET    /api/v2/patients/:id/files          List files
DELETE /api/v2/patients/:id/files/:fileId  Delete file
```

### POST /api/v2/patients/:id/files — form fields

| Field         | Type    | Required | Description                                           |
|---------------|---------|----------|-------------------------------------------------------|
| `file`        | binary  | Yes      | File content (max 20 MB)                              |
| `file_type`   | string  | Yes      | `lab` / `xray` / `report` / `other`                  |
| `visit_id`    | UUID    | No       | Associate with a specific visit                       |
| `source_type` | string  | No       | `visit` / `onboarding` / `manual` (default: `manual`)|

### GET /api/v2/patients/:id/files — query parameters

| Parameter   | Type   | Description                          |
|------------|--------|--------------------------------------|
| `file_type`| string | Filter by type                       |
| `visit_id` | UUID   | Filter by visit                      |
| `from`     | date   | Uploaded on or after                 |
| `to`       | date   | Uploaded on or before                |

---

## 📊 Reports

All report endpoints are restricted to `admin` and `receptionist` roles, except `GET /reports/doctor/:id/*` which is also accessible by the `doctor` for their own ID.

```
GET    /api/v2/reports/daily               Daily summary (appointments, revenue, new patients)
GET    /api/v2/reports/monthly             Monthly summary
GET    /api/v2/reports/financial           Detailed financial report (invoices, payments, outstanding)
GET    /api/v2/reports/patients            Patient statistics (new, returning, demographics)
GET    /api/v2/reports/appointments        Appointment statistics (by status, type, no-shows)
GET    /api/v2/reports/doctor/:id/revenue  Per-doctor revenue breakdown  ← new in V2
```

### Common report query parameters

| Parameter | Type | Description              |
|-----------|------|--------------------------|
| `from`    | date | Period start (ISO 8601)  |
| `to`      | date | Period end (ISO 8601)    |

---

## 🔍 Audit Log

Restricted to `admin` only.

```
GET    /api/v2/audit-logs                  Query audit log
```

### GET /api/v2/audit-logs — query parameters

| Parameter      | Type   | Description                              |
|---------------|--------|------------------------------------------|
| `table_name`  | string | Filter by table (e.g. `appointments`)    |
| `record_id`   | UUID   | Filter by specific record                |
| `performed_by`| UUID   | Filter by user who made the change       |
| `action`      | string | `create` / `update` / `delete`           |
| `from`        | date   | performed_at on or after                 |
| `to`          | date   | performed_at on or before                |

---
