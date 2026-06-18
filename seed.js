import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma";

// ─── Helpers ────────────────────────────────────────────────────────────────

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

// ─── Main Seed ──────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Starting seed…");

  // ── 1. Clean existing data ────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.medicalFile.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.review.deleteMany();
  await prisma.doctorTimeBlock.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.commonQuestion.deleteMany();
  await prisma.center.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Cleaned existing data");

  // ── 2. Users ─────────────────────────────────────────────────────────────
  const password = await hashPassword("Password123!");

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@clinic.com",
      passwordHash: password,
      role: "admin",
      phone: "+1-555-0100",
      isActive: true,
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      name: "Sara Ahmed",
      email: "reception@clinic.com",
      passwordHash: password,
      role: "receptionist",
      phone: "+1-555-0101",
      isActive: true,
    },
  });

  const doctorUsersData = [
    { name: "Dr. James Carter", email: "james.carter@clinic.com", phone: "+1-555-0201" },
    { name: "Dr. Layla Hassan", email: "layla.hassan@clinic.com", phone: "+1-555-0202" },
    { name: "Dr. Mark Evans",   email: "mark.evans@clinic.com",   phone: "+1-555-0203" },
  ];

  const doctorUsers = await Promise.all(
    doctorUsersData.map((d) =>
      prisma.user.create({ data: { ...d, passwordHash: password, role: "doctor", isActive: true } })
    )
  );

  const patientUsersData = [
    { name: "Alice Johnson",  email: "alice@example.com",  phone: "+1-555-1001" },
    { name: "Bob Smith",      email: "bob@example.com",    phone: "+1-555-1002" },
    { name: "Carol Williams", email: "carol@example.com",  phone: "+1-555-1003" },
    { name: "David Brown",    email: "david@example.com",  phone: "+1-555-1004" },
    { name: "Eva Martinez",   email: "eva@example.com",    phone: "+1-555-1005" },
  ];

  const patientUsers = await Promise.all(
    patientUsersData.map((p) =>
      prisma.user.create({ data: { ...p, passwordHash: password, role: "patient", isActive: true } })
    )
  );

  console.log(`  ✓ Created ${2 + doctorUsers.length + patientUsers.length} users`);

  // ── 3. Doctors ───────────────────────────────────────────────────────────
  const doctorData = [
    { userId: doctorUsers[0].id, specialty: "Cardiology",       licenseNumber: "LIC-CARD-001", bio: "Board-certified cardiologist with 15 years of experience.", consultationFee: 150 },
    { userId: doctorUsers[1].id, specialty: "Dermatology",      licenseNumber: "LIC-DERM-002", bio: "Specialist in medical and cosmetic dermatology.",            consultationFee: 120 },
    { userId: doctorUsers[2].id, specialty: "General Practice", licenseNumber: "LIC-GP-003",   bio: "Family physician focusing on preventive care.",              consultationFee: 80  },
  ];

  const doctors = await Promise.all(
    doctorData.map((d) => prisma.doctor.create({ data: d }))
  );
  console.log(`  ✓ Created ${doctors.length} doctors`);

  // ── 4. Doctor Schedules (Mon–Fri 09:00–17:00) ────────────────────────────
  const startTime = new Date("1970-01-01T09:00:00Z");
  const endTime   = new Date("1970-01-01T17:00:00Z");

  for (const doctor of doctors) {
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSchedule.create({
        data: { doctorId: doctor.id, dayOfWeek: day, startTime, endTime, isActive: true },
      });
    }
  }
  console.log("  ✓ Created doctor schedules");

  // ── 5. Doctor Time Blocks ────────────────────────────────────────────────
  await prisma.doctorTimeBlock.create({
    data: {
      doctorId: doctors[0].id,
      startsAt: new Date("2025-07-10T12:00:00Z"),
      endsAt:   new Date("2025-07-10T14:00:00Z"),
      reason:   "Conference break",
    },
  });
  console.log("  ✓ Created doctor time blocks");

  // ── 6. Patients ──────────────────────────────────────────────────────────
  const patientSeedData = [
    { userId: patientUsers[0].id, patientCode: "PAT-0001", name: patientUsers[0].name, dateOfBirth: new Date("1990-03-15"), gender: "female", phone: patientUsers[0].phone, bloodType: "A+", chronicDiseases: "Hypertension", allergies: "Penicillin" },
    { userId: patientUsers[1].id, patientCode: "PAT-0002", name: patientUsers[1].name, dateOfBirth: new Date("1985-07-22"), gender: "male",   phone: patientUsers[1].phone, bloodType: "O+" },
    { userId: patientUsers[2].id, patientCode: "PAT-0003", name: patientUsers[2].name, dateOfBirth: new Date("1995-11-08"), gender: "female", phone: patientUsers[2].phone, bloodType: "B-",  allergies: "Aspirin" },
    { userId: patientUsers[3].id, patientCode: "PAT-0004", name: patientUsers[3].name, dateOfBirth: new Date("1978-01-30"), gender: "male",   phone: patientUsers[3].phone, bloodType: "AB+", chronicDiseases: "Diabetes Type 2" },
    { userId: patientUsers[4].id, patientCode: "PAT-0005", name: patientUsers[4].name, dateOfBirth: new Date("2000-05-19"), gender: "female", phone: patientUsers[4].phone, bloodType: "O-" },
    {                             patientCode: "PAT-0006", name: "Frank Miller",        dateOfBirth: new Date("1965-09-12"), gender: "male",   phone: "+1-555-1006",         bloodType: "A-" },
  ];

  const patients = await Promise.all(
    patientSeedData.map((p) => prisma.patient.create({ data: p }))
  );
  console.log(`  ✓ Created ${patients.length} patients`);

  // ── 7. Services ──────────────────────────────────────────────────────────
  const servicesData = [
    { name: "General Consultation",    description: "Standard outpatient consultation",  durationMin: 30 },
    { name: "ECG",                     description: "Electrocardiogram test",             durationMin: 20 },
    { name: "Skin Biopsy",             description: "Minor skin biopsy procedure",        durationMin: 45 },
    { name: "Follow-up Consultation",  description: "Post-treatment follow-up visit",     durationMin: 20 },
    { name: "Blood Pressure Monitoring", description: "24-hour ambulatory BP monitoring", durationMin: 15 },
  ];

  const services = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s }))
  );
  console.log(`  ✓ Created ${services.length} services`);

  // ── 8. Doctor Services ───────────────────────────────────────────────────
  await prisma.doctorService.createMany({
    data: [
      { doctorId: doctors[0].id, serviceId: services[0].id, price: 150 },
      { doctorId: doctors[0].id, serviceId: services[1].id, price: 80  },
      { doctorId: doctors[0].id, serviceId: services[4].id, price: 60  },
      { doctorId: doctors[0].id, serviceId: services[3].id, price: 100 },
      { doctorId: doctors[1].id, serviceId: services[0].id, price: 120 },
      { doctorId: doctors[1].id, serviceId: services[2].id, price: 200 },
      { doctorId: doctors[1].id, serviceId: services[3].id, price: 90  },
      { doctorId: doctors[2].id, serviceId: services[0].id, price: 80  },
      { doctorId: doctors[2].id, serviceId: services[3].id, price: 50  },
      { doctorId: doctors[2].id, serviceId: services[4].id, price: 40  },
    ],
  });
  console.log("  ✓ Created doctor services");

  // ── 9. Appointments ──────────────────────────────────────────────────────
  const now = new Date();

  const appointmentsData = [
    { patientId: patients[0].id, doctorId: doctors[0].id, serviceId: services[0].id, scheduledAt: addDays(now, -10), status: "done",        type: "new"       },
    { patientId: patients[1].id, doctorId: doctors[1].id, serviceId: services[2].id, scheduledAt: addDays(now, -7),  status: "done",        type: "new"       },
    { patientId: patients[2].id, doctorId: doctors[2].id, serviceId: services[0].id, scheduledAt: addDays(now, -3),  status: "done",        type: "new"       },
    { patientId: patients[3].id, doctorId: doctors[0].id, serviceId: services[1].id, scheduledAt: addHours(now, -1), status: "in_progress", type: "follow_up" },
    { patientId: patients[4].id, doctorId: doctors[2].id, serviceId: services[4].id, scheduledAt: addHours(now,  1), status: "waiting",     type: "new"       },
    { patientId: patients[0].id, doctorId: doctors[0].id, serviceId: services[3].id, scheduledAt: addDays(now,  5),  status: "scheduled",   type: "follow_up" },
    { patientId: patients[5].id, doctorId: doctors[1].id, serviceId: services[0].id, scheduledAt: addDays(now,  8),  status: "scheduled",   type: "new"       },
    { patientId: patients[1].id, doctorId: doctors[2].id, serviceId: services[3].id, scheduledAt: addDays(now, -5),  status: "cancelled",   type: "follow_up" },
    { patientId: patients[2].id, doctorId: doctors[0].id, serviceId: services[0].id, scheduledAt: addDays(now, -2),  status: "no_show",     type: "new"       },
  ];

  const appointments = await Promise.all(
    appointmentsData.map((a) => prisma.appointment.create({ data: a }))
  );
  console.log(`  ✓ Created ${appointments.length} appointments`);

  // ── 10. Visits ────────────────────────────────────────────────────────────
  const doneAppointments = appointments.filter((a) => a.status === "done");

  const visitDataArr = [
    { appointmentId: doneAppointments[0].id, chiefComplaint: "Chest tightness and shortness of breath", diagnosis: "Stable angina",      notes: "Start low-dose aspirin. Follow-up in 2 weeks.", weightKg: 78.5, heightCm: 172, bloodPressure: "140/90", temperatureC: 36.8 },
    { appointmentId: doneAppointments[1].id, chiefComplaint: "Persistent itchy rash on forearm",        diagnosis: "Contact dermatitis", notes: "Prescribed topical corticosteroid cream.",       weightKg: 68,   heightCm: 165, bloodPressure: "120/80", temperatureC: 36.6 },
    { appointmentId: doneAppointments[2].id, chiefComplaint: "Annual check-up",                         diagnosis: "Healthy",            notes: "All vitals normal. Recommended increased water intake.", weightKg: 60, heightCm: 160, bloodPressure: "118/76", temperatureC: 36.5 },
  ];

  const visits = await Promise.all(
    visitDataArr.map((v) => prisma.visit.create({ data: v }))
  );
  console.log(`  ✓ Created ${visits.length} visits`);

  // ── 11. Prescriptions ────────────────────────────────────────────────────
  await prisma.prescription.create({
    data: {
      visitId: visits[0].id,
      notes: "Take medications as directed. Avoid strenuous activity.",
      items: {
        create: [
          { medicineName: "Aspirin",      dosage: "75 mg", frequency: "Once daily",            duration: "30 days", instructions: "Take with food." },
          { medicineName: "Atorvastatin", dosage: "20 mg", frequency: "Once daily at bedtime", duration: "90 days" },
        ],
      },
    },
  });

  await prisma.prescription.create({
    data: {
      visitId: visits[1].id,
      items: {
        create: [
          { medicineName: "Hydrocortisone 1% Cream", dosage: "Apply thin layer", frequency: "Twice daily", duration: "14 days", instructions: "Apply to affected area only. Do not cover." },
        ],
      },
    },
  });
  console.log("  ✓ Created prescriptions");

  // ── 12. Invoices & Payments ───────────────────────────────────────────────
  const invoiceSeeds = [
    {
      visitId: visits[0].id, patientId: doneAppointments[0].patientId, doctorId: doneAppointments[0].doctorId,
      invoiceNumber: "INV-2025-0001", subtotal: 230, discount: 0,  total: 230, paidAmount: 230, status: "paid",
      items:    [{ description: "General Consultation", quantity: 1, unitPrice: 150, total: 150 }, { description: "ECG", quantity: 1, unitPrice: 80, total: 80 }],
      payments: [{ amount: 230, method: "card" }],
    },
    {
      visitId: visits[1].id, patientId: doneAppointments[1].patientId, doctorId: doneAppointments[1].doctorId,
      invoiceNumber: "INV-2025-0002", subtotal: 200, discount: 10, total: 190, paidAmount: 100, status: "partial",
      items:    [{ description: "Skin Biopsy", quantity: 1, unitPrice: 200, total: 200 }],
      payments: [{ amount: 100, method: "cash" }],
    },
    {
      visitId: visits[2].id, patientId: doneAppointments[2].patientId, doctorId: doneAppointments[2].doctorId,
      invoiceNumber: "INV-2025-0003", subtotal: 80,  discount: 0,  total: 80,  paidAmount: 0,   status: "pending",
      items:    [{ description: "General Consultation", quantity: 1, unitPrice: 80, total: 80 }],
      payments: [],
    },
  ];

  for (const inv of invoiceSeeds) {
    const { items, payments, ...invoiceFields } = inv;
    const invoice = await prisma.invoice.create({ data: invoiceFields });
    await prisma.invoiceItem.createMany({ data: items.map((i) => ({ ...i, invoiceId: invoice.id })) });
    if (payments.length) {
      await prisma.payment.createMany({ data: payments.map((p) => ({ ...p, invoiceId: invoice.id })) });
    }
  }
  console.log("  ✓ Created invoices and payments");

  // ── 13. Medical Files ─────────────────────────────────────────────────────
  await prisma.medicalFile.createMany({
    data: [
      { patientId: patients[0].id, visitId: visits[0].id, sourceType: "visit",      fileType: "report", fileName: "ecg_report_alice.pdf",   fileUrl: "https://storage.clinic.com/files/ecg_report_alice.pdf",   fileSizeBytes: 204800  },
      { patientId: patients[1].id, visitId: visits[1].id, sourceType: "visit",      fileType: "lab",    fileName: "skin_biopsy_bob.pdf",    fileUrl: "https://storage.clinic.com/files/skin_biopsy_bob.pdf",    fileSizeBytes: 512000  },
      { patientId: patients[3].id,                        sourceType: "onboarding", fileType: "xray",   fileName: "chest_xray_david.jpg",   fileUrl: "https://storage.clinic.com/files/chest_xray_david.jpg",   fileSizeBytes: 1048576 },
    ],
  });
  console.log("  ✓ Created medical files");

  // ── 14. Reviews ───────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { patientId: patients[0].id, doctorId: doctors[0].id, type: "doctor", rating: 5, comment: "Dr. Carter is thorough and very caring. Highly recommend!", source: "website",   isApproved: true  },
      { patientId: patients[1].id, doctorId: doctors[1].id, type: "doctor", rating: 4, comment: "Very knowledgeable and professional.",                       source: "website",   isApproved: true  },
      { patientId: patients[2].id,                          type: "center", rating: 5, comment: "The clinic is clean and the staff is friendly.",             source: "reception", isApproved: false },
    ],
  });
  console.log("  ✓ Created reviews");

  // ── 15. Center ────────────────────────────────────────────────────────────
  await prisma.center.create({
    data: { name: "MedCare Clinic", description: "A modern multi-specialty outpatient clinic serving patients since 2010.", basePrice: 50, duration: 30 },
  });
  console.log("  ✓ Created center");

  // ── 16. Common Questions (FAQ) ────────────────────────────────────────────
  await prisma.commonQuestion.createMany({
    data: [
      { question: "How do I book an appointment?",        answer: "You can book an appointment online through our website, call our reception, or visit us in person." },
      { question: "What insurance plans do you accept?",  answer: "We accept most major insurance plans. Please contact our reception team for details." },
      { question: "What are your clinic hours?",          answer: "We are open Monday to Friday, 9:00 AM – 5:00 PM." },
      { question: "Can I get a copy of my medical records?", answer: "Yes, you may request your medical records at the reception desk or through the patient portal." },
    ],
  });
  console.log("  ✓ Created FAQ entries");

  // ── 17. Audit Logs ────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { tableName: "appointments", recordId: appointments[0].id, action: "create", newValue: { status: "scheduled" },                              performedBy: receptionistUser.id },
      { tableName: "appointments", recordId: appointments[0].id, action: "update", oldValue: { status: "scheduled" }, newValue: { status: "done" }, performedBy: doctorUsers[0].id   },
      { tableName: "invoices",     recordId: "00000000-0000-0000-0000-000000000001", action: "create", newValue: { invoiceNumber: "INV-2025-0001" }, performedBy: receptionistUser.id },
    ],
  });
  console.log("  ✓ Created audit logs");

  // ── 18. Password Reset Token ──────────────────────────────────────────────
  await prisma.passwordResetToken.create({
    data: { userId: patientUsers[0].id, token: "sample-reset-token-abc123", expiresAt: addHours(now, 1) },
  });
  console.log("  ✓ Created password reset token sample");

  console.log("\n🎉  Seed completed successfully!");
  console.log("\n📋  Default credentials (all roles): Password123!");
  console.log("    admin@clinic.com        → admin");
  console.log("    reception@clinic.com    → receptionist");
  console.log("    james.carter@clinic.com → doctor");
  console.log("    layla.hassan@clinic.com → doctor");
  console.log("    mark.evans@clinic.com   → doctor");
  console.log("    alice@example.com       → patient");
}

main()
  .catch((e) => { console.error("❌  Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());