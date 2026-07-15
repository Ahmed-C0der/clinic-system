import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma";

// ─── الدوال المساعدة ──────────────────────────────────────────────────────────

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function atTime(date, h, m = 0) {
  const d = new Date(date);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

// ─── الدالة الرئيسية ──────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  بدء عملية البذر...");

  // ── 1. حذف البيانات الموجودة ──────────────────────────────────────────────
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
  console.log("  ✓ تم حذف البيانات الموجودة");

  // ── 2. المستخدمون ──────────────────────────────────────────────────────────
  const password = await hashPassword("Password123!");

  const adminUser = await prisma.user.create({
    data: {
      name: "مدير النظام",
      email: "admin@clinic.com",
      passwordHash: password,
      role: "admin",
      gender: "male",
      phone: "+966-50-0000100",
      isActive: true,
    },
  });

  const receptionistUser = await prisma.user.create({
    data: {
      name: "سارة أحمد",
      email: "reception@clinic.com",
      passwordHash: password,
      role: "receptionist",
      gender: "female",
      phone: "+966-50-0000101",
      isActive: true,
    },
  });

  const doctorUsersData = [
    { name: "د. خالد العمري",  email: "khaled.omari@clinic.com",  phone: "+966-50-0000201", gender: "male"   },
    { name: "د. نورة الشمري",  email: "noura.shammari@clinic.com", phone: "+966-50-0000202", gender: "female" },
    { name: "د. أحمد السالم",  email: "ahmed.salem@clinic.com",    phone: "+966-50-0000203", gender: "male"   },
  ];

  const doctorUsers = await Promise.all(
    doctorUsersData.map((d) =>
      prisma.user.create({
        data: { ...d, passwordHash: password, role: "doctor", isActive: true },
      })
    )
  );

  // 10 مرضى لتغطية مواعيد أكثر
  const patientUsersData = [
    { name: "فاطمة الزهراء",  email: "fatima@example.com",   phone: "+966-50-0001001", gender: "female" },
    { name: "محمد علي",       email: "mohammed@example.com", phone: "+966-50-0001002", gender: "male"   },
    { name: "هنادي عبدالله",  email: "hanadi@example.com",   phone: "+966-50-0001003", gender: "female" },
    { name: "عمر الرشيد",     email: "omar@example.com",     phone: "+966-50-0001004", gender: "male"   },
    { name: "ريم المنصور",    email: "reem@example.com",     phone: "+966-50-0001005", gender: "female" },
    { name: "يوسف الحربي",    email: "yousef@example.com",   phone: "+966-50-0001006", gender: "male"   },
    { name: "لينا القحطاني",  email: "lina@example.com",     phone: "+966-50-0001007", gender: "female" },
    { name: "بدر الشهري",     email: "badr@example.com",     phone: "+966-50-0001008", gender: "male"   },
    { name: "نوف العتيبي",    email: "nouf@example.com",     phone: "+966-50-0001009", gender: "female" },
    { name: "تركي الدوسري",   email: "turki@example.com",    phone: "+966-50-0001010", gender: "male"   },
  ];

  const patientUsers = await Promise.all(
    patientUsersData.map((p) =>
      prisma.user.create({
        data: { ...p, passwordHash: password, role: "patient", isActive: true },
      })
    )
  );

  console.log(`  ✓ تم إنشاء ${2 + doctorUsers.length + patientUsers.length} مستخدم`);

  // ── 3. الأطباء ─────────────────────────────────────────────────────────────
  const doctorData = [
    {
      userId: doctorUsers[0].id,
      specialty: "أمراض القلب والأوعية الدموية",
      licenseNumber: "LIC-CARD-001",
      bio: "طبيب قلب معتمد بخبرة تزيد على 15 عامًا في تشخيص وعلاج أمراض القلب.",
      consultationFee: 300,
      slotDuration: 30,
    },
    {
      userId: doctorUsers[1].id,
      specialty: "الأمراض الجلدية والتجميل",
      licenseNumber: "LIC-DERM-002",
      bio: "متخصصة في الأمراض الجلدية الطبية والتجميلية بخبرة أكثر من 10 سنوات.",
      consultationFee: 250,
      slotDuration: 30,
    },
    {
      userId: doctorUsers[2].id,
      specialty: "الطب العام والأسري",
      licenseNumber: "LIC-GP-003",
      bio: "طبيب أسرة يركز على الرعاية الوقائية وتعزيز الصحة العامة للمريض وأسرته.",
      consultationFee: 150,
      slotDuration: 20,
    },
  ];

  const doctors = await Promise.all(
    doctorData.map((d) => prisma.doctor.create({ data: d }))
  );
  console.log(`  ✓ تم إنشاء ${doctors.length} أطباء`);

  // ── 4. جداول مواعيد الأطباء (الأحد–الخميس 09:00–17:00) ────────────────────
  const startTime = new Date("1970-01-01T09:00:00Z");
  const endTime   = new Date("1970-01-01T17:00:00Z");

  for (const doctor of doctors) {
    for (let day = 0; day <= 4; day++) {
      await prisma.doctorSchedule.create({
        data: { doctorId: doctor.id, dayOfWeek: day, startTime, endTime, isActive: true },
      });
    }
  }
  console.log("  ✓ تم إنشاء جداول الأطباء");

  // ── 5. فترات الحجب ──────────────────────────────────────────────────────────
  await prisma.doctorTimeBlock.create({
    data: {
      doctorId: doctors[0].id,
      startsAt: new Date("2025-07-10T12:00:00Z"),
      endsAt:   new Date("2025-07-10T14:00:00Z"),
      reason:   "استراحة مؤتمر القلب السنوي",
    },
  });
  await prisma.doctorTimeBlock.create({
    data: {
      doctorId: doctors[1].id,
      startsAt: new Date("2025-07-15T08:00:00Z"),
      endsAt:   new Date("2025-07-15T10:00:00Z"),
      reason:   "ورشة عمل تدريبية",
    },
  });
  console.log("  ✓ تم إنشاء فترات الحجب");

  // ── 6. المرضى ──────────────────────────────────────────────────────────────
  const patientSeedData = [
    {
      userId: patientUsers[0].id, patientCode: "PAT-0001",
      name: patientUsers[0].name, dateOfBirth: new Date("1990-03-15"),
      gender: "female", phone: patientUsers[0].phone,
      address: "الرياض، حي النزهة، شارع الأمير سلطان",
      bloodType: "A+", chronicDiseases: "ارتفاع ضغط الدم", allergies: "البنسلين",
    },
    {
      userId: patientUsers[1].id, patientCode: "PAT-0002",
      name: patientUsers[1].name, dateOfBirth: new Date("1985-07-22"),
      gender: "male", phone: patientUsers[1].phone,
      address: "جدة، حي الروضة، شارع التحلية", bloodType: "O+",
    },
    {
      userId: patientUsers[2].id, patientCode: "PAT-0003",
      name: patientUsers[2].name, dateOfBirth: new Date("1995-11-08"),
      gender: "female", phone: patientUsers[2].phone,
      address: "الدمام، حي الفيصلية", bloodType: "B-", allergies: "الأسبرين",
    },
    {
      userId: patientUsers[3].id, patientCode: "PAT-0004",
      name: patientUsers[3].name, dateOfBirth: new Date("1978-01-30"),
      gender: "male", phone: patientUsers[3].phone,
      address: "مكة المكرمة، حي العزيزية", bloodType: "AB+",
      chronicDiseases: "داء السكري من النوع الثاني، ارتفاع الكوليسترول",
    },
    {
      userId: patientUsers[4].id, patientCode: "PAT-0005",
      name: patientUsers[4].name, dateOfBirth: new Date("2000-05-19"),
      gender: "female", phone: patientUsers[4].phone,
      address: "المدينة المنورة، حي قباء", bloodType: "O-",
    },
    {
      userId: patientUsers[5].id, patientCode: "PAT-0006",
      name: patientUsers[5].name, dateOfBirth: new Date("1992-08-14"),
      gender: "male", phone: patientUsers[5].phone,
      address: "الرياض، حي الملقا", bloodType: "B+",
      chronicDiseases: "الربو",
    },
    {
      userId: patientUsers[6].id, patientCode: "PAT-0007",
      name: patientUsers[6].name, dateOfBirth: new Date("1998-02-28"),
      gender: "female", phone: patientUsers[6].phone,
      address: "جدة، حي الزهراء", bloodType: "A-",
    },
    {
      userId: patientUsers[7].id, patientCode: "PAT-0008",
      name: patientUsers[7].name, dateOfBirth: new Date("1975-12-05"),
      gender: "male", phone: patientUsers[7].phone,
      address: "الرياض، حي العليا", bloodType: "O+",
      chronicDiseases: "ارتفاع ضغط الدم، أمراض القلب",
    },
    {
      userId: patientUsers[8].id, patientCode: "PAT-0009",
      name: patientUsers[8].name, dateOfBirth: new Date("2003-06-17"),
      gender: "female", phone: patientUsers[8].phone,
      address: "الدمام، حي الشاطئ", bloodType: "AB-",
    },
    {
      userId: patientUsers[9].id, patientCode: "PAT-0010",
      name: patientUsers[9].name, dateOfBirth: new Date("1969-09-30"),
      gender: "male", phone: patientUsers[9].phone,
      address: "الطائف، حي الشهداء", bloodType: "A+",
      chronicDiseases: "داء السكري، ضغط الدم",
    },
    // Walk-in — بدون حساب
    {
      patientCode: "PAT-0011", name: "سعد الغامدي",
      dateOfBirth: new Date("1965-09-12"), gender: "male",
      phone: "+966-50-0001011", address: "الطائف، حي الشهداء", bloodType: "A-",
    },
  ];

  const patients = await Promise.all(
    patientSeedData.map((p) => prisma.patient.create({ data: p }))
  );
  console.log(`  ✓ تم إنشاء ${patients.length} مرضى`);

  // ── 7. الخدمات ─────────────────────────────────────────────────────────────
  const servicesData = [
    { name: "استشارة عامة",            description: "كشف خارجي يشمل الفحص السريري والتقييم الطبي",            durationMin: 30, basePrice: 150 },
    { name: "تخطيط القلب الكهربائي",   description: "فحص ECG لتقييم النشاط الكهربائي للقلب",                  durationMin: 20, basePrice: 80  },
    { name: "خزعة جلدية",              description: "أخذ عينة جلدية بسيطة لتحليلها مخبريًا",                  durationMin: 45, basePrice: 200 },
    { name: "زيارة متابعة",            description: "متابعة ما بعد العلاج أو الإجراء الطبي",                   durationMin: 20, basePrice: 100 },
    { name: "مراقبة ضغط الدم المتنقلة",description: "مراقبة ضغط الدم بصورة مستمرة لمدة 24 ساعة",              durationMin: 15, basePrice: 120 },
    { name: "اختبار السكر التراكمي",   description: "قياس نسبة HbA1c لمتابعة مرضى السكري",                    durationMin: 10, basePrice: 60  },
    { name: "فحص الجلد الشامل",        description: "فحص جلدي كامل للكشف المبكر عن الأمراض الجلدية",           durationMin: 40, basePrice: 180 },
    { name: "إيكو القلب",              description: "تصوير بالموجات فوق الصوتية لعضلة القلب والصمامات",         durationMin: 45, basePrice: 350 },
  ];

  const services = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s }))
  );
  console.log(`  ✓ تم إنشاء ${services.length} خدمات`);

  // ── 8. خدمات الأطباء ──────────────────────────────────────────────────────
  await prisma.doctorService.createMany({
    data: [
      // د. خالد — أمراض القلب
      { doctorId: doctors[0].id, serviceId: services[0].id, price: 300 },
      { doctorId: doctors[0].id, serviceId: services[1].id, price: 150 },
      { doctorId: doctors[0].id, serviceId: services[3].id, price: 200 },
      { doctorId: doctors[0].id, serviceId: services[4].id, price: 200 },
      { doctorId: doctors[0].id, serviceId: services[7].id, price: 500 },
      // د. نورة — الأمراض الجلدية
      { doctorId: doctors[1].id, serviceId: services[0].id, price: 250 },
      { doctorId: doctors[1].id, serviceId: services[2].id, price: 400 },
      { doctorId: doctors[1].id, serviceId: services[3].id, price: 180 },
      { doctorId: doctors[1].id, serviceId: services[6].id, price: 300 },
      // د. أحمد — الطب العام
      { doctorId: doctors[2].id, serviceId: services[0].id, price: 150 },
      { doctorId: doctors[2].id, serviceId: services[3].id, price: 100 },
      { doctorId: doctors[2].id, serviceId: services[4].id, price: 120 },
      { doctorId: doctors[2].id, serviceId: services[5].id, price: 60  },
    ],
  });
  console.log("  ✓ تم إنشاء خدمات الأطباء");

  // ── 9. المواعيد ────────────────────────────────────────────────────────────
  const now = new Date();

  // ─────────────────────────────────────────────────────────────────────────
  // د. خالد العمري — طبيب القلب — 12 موعد
  // ─────────────────────────────────────────────────────────────────────────
  const khaledAppointments = [
    // ماضي — done (6 مواعيد منتهية)
    { patientId: patients[0].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-30), 9),  status:"done",        type:"new",       notes:"مريضة مُحالة بسبب ألم في الصدر" },
    { patientId: patients[1].id, serviceId: services[1].id, scheduledAt: atTime(addDays(now,-25), 10), status:"done",        type:"new",       notes:"تخطيط قلب دوري" },
    { patientId: patients[7].id, serviceId: services[7].id, scheduledAt: atTime(addDays(now,-20), 11), status:"done",        type:"new",       notes:"إيكو قلب — ضيق في التنفس" },
    { patientId: patients[0].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now,-14), 9),  status:"done",        type:"follow_up", notes:"متابعة نتائج التخطيط" },
    { patientId: patients[3].id, serviceId: services[1].id, scheduledAt: atTime(addDays(now,-10), 10), status:"done",        type:"new",       notes:"خفقان القلب" },
    { patientId: patients[8].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-5),  11), status:"done",        type:"new",       notes:"فحص عام" },
    // اليوم — in_progress + waiting
    { patientId: patients[3].id, serviceId: services[1].id, scheduledAt: atTime(now,              9),  status:"in_progress", type:"follow_up", notes:"متابعة خفقان القلب" },
    { patientId: patients[9].id, serviceId: services[4].id, scheduledAt: atTime(now,              10), status:"waiting",     type:"new",       notes:"قياس ضغط الدم المستمر" },
    // مستقبل — scheduled (4 مواعيد قادمة)
    { patientId: patients[0].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now, 3),  9),  status:"scheduled",   type:"follow_up", notes:"متابعة 3 أسابيع" },
    { patientId: patients[7].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now, 5),  10), status:"scheduled",   type:"follow_up", notes:"متابعة الإيكو" },
    { patientId: patients[1].id, serviceId: services[7].id, scheduledAt: atTime(addDays(now, 8),  11), status:"scheduled",   type:"new",       notes:"طلب إيكو من طبيب الأسرة" },
    { patientId: patients[4].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now, 12), 9),  status:"scheduled",   type:"new",       notes:"كشف لأول مرة" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // د. نورة الشمري — طبيبة الجلدية — 11 موعد
  // ─────────────────────────────────────────────────────────────────────────
  const nouraAppointments = [
    // ماضي — done (5 مواعيد)
    { patientId: patients[2].id, serviceId: services[2].id, scheduledAt: atTime(addDays(now,-28), 9),  status:"done",        type:"new",       notes:"طفح جلدي على الساعد" },
    { patientId: patients[4].id, serviceId: services[6].id, scheduledAt: atTime(addDays(now,-21), 10), status:"done",        type:"new",       notes:"فحص جلد شامل دوري" },
    { patientId: patients[6].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-15), 11), status:"done",        type:"new",       notes:"بقع بيضاء على الجلد" },
    { patientId: patients[2].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now,-7),  9),  status:"done",        type:"follow_up", notes:"متابعة الخزعة" },
    { patientId: patients[8].id, serviceId: services[6].id, scheduledAt: atTime(addDays(now,-3),  10), status:"done",        type:"new",       notes:"حساسية جلدية" },
    // اليوم
    { patientId: patients[5].id, serviceId: services[0].id, scheduledAt: atTime(now,              11), status:"waiting",     type:"new",       notes:"حب الشباب الحاد" },
    // مستقبل (5 مواعيد)
    { patientId: patients[2].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now, 4),  9),  status:"scheduled",   type:"follow_up", notes:"متابعة شهر" },
    { patientId: patients[6].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now, 6),  10), status:"scheduled",   type:"follow_up", notes:"متابعة العلاج" },
    { patientId: patients[9].id, serviceId: services[6].id, scheduledAt: atTime(addDays(now, 9),  11), status:"scheduled",   type:"new",       notes:"فحص شامل" },
    { patientId: patients[0].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now, 11), 9),  status:"scheduled",   type:"new",       notes:"تشقق الجلد الشتوي" },
    // ملغي + غياب
    { patientId: patients[1].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now,-4),  11), status:"cancelled",   type:"follow_up", notes:"إلغاء بسبب سفر" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // د. أحمد السالم — الطب العام — 13 موعد
  // ─────────────────────────────────────────────────────────────────────────
  const ahmedAppointments = [
    // ماضي — done (7 مواعيد)
    { patientId: patients[1].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-35), 9),  status:"done",        type:"new",       notes:"زكام وحرارة" },
    { patientId: patients[3].id, serviceId: services[5].id, scheduledAt: atTime(addDays(now,-28), 10), status:"done",        type:"new",       notes:"متابعة السكر التراكمي" },
    { patientId: patients[5].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-21), 9),  status:"done",        type:"new",       notes:"ضيق في التنفس — ربو" },
    { patientId: patients[6].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now,-18), 11), status:"done",        type:"follow_up", notes:"متابعة نزلة البرد" },
    { patientId: patients[4].id, serviceId: services[4].id, scheduledAt: atTime(addDays(now,-14), 10), status:"done",        type:"new",       notes:"ارتفاع ضغط الدم" },
    { patientId: patients[9].id, serviceId: services[5].id, scheduledAt: atTime(addDays(now,-8),  9),  status:"done",        type:"follow_up", notes:"متابعة السكري الشهرية" },
    { patientId: patients[10].id,serviceId: services[0].id, scheduledAt: atTime(addDays(now,-3),  10), status:"done",        type:"new",       notes:"Walk-in — آلام في البطن" },
    // اليوم (2 مواعيد)
    { patientId: patients[2].id, serviceId: services[0].id, scheduledAt: atTime(now,              9),  status:"in_progress", type:"new",       notes:"التهاب في الحلق" },
    { patientId: patients[8].id, serviceId: services[3].id, scheduledAt: atTime(now,              10), status:"waiting",     type:"follow_up", notes:"متابعة" },
    // مستقبل (4 مواعيد)
    { patientId: patients[3].id, serviceId: services[5].id, scheduledAt: atTime(addDays(now, 2),  9),  status:"scheduled",   type:"follow_up", notes:"متابعة HbA1c 3 أشهر" },
    { patientId: patients[5].id, serviceId: services[3].id, scheduledAt: atTime(addDays(now, 5),  10), status:"scheduled",   type:"follow_up", notes:"متابعة الربو" },
    { patientId: patients[7].id, serviceId: services[4].id, scheduledAt: atTime(addDays(now, 9),  11), status:"scheduled",   type:"new",       notes:"مراقبة ضغط الدم 24 ساعة" },
    // غياب بدون إشعار
    { patientId: patients[1].id, serviceId: services[0].id, scheduledAt: atTime(addDays(now,-1),  9),  status:"no_show",     type:"new" },
  ];

  const allAppointmentsData = [
    ...khaledAppointments.map(a => ({ ...a, doctorId: doctors[0].id })),
    ...nouraAppointments.map(a  => ({ ...a, doctorId: doctors[1].id })),
    ...ahmedAppointments.map(a  => ({ ...a, doctorId: doctors[2].id })),
  ];

  const appointments = await Promise.all(
    allAppointmentsData.map((a) => prisma.appointment.create({ data: a }))
  );
  console.log(`  ✓ تم إنشاء ${appointments.length} موعداً`);

  // ── 10. الزيارات ───────────────────────────────────────────────────────────
  const doneAppts = appointments.filter((a) => a.status === "done");

  const visitsDataArr = [
    // زيارات د. خالد
    { appointmentId: doneAppts[0].id,  chiefComplaint: "ضيق في الصدر وضيق في التنفس عند المجهود",   diagnosis: "ذبحة صدرية مستقرة",              notes: "بدء الأسبرين. طلب تخطيط قلب. متابعة أسبوعين.",         weightKg:72.5, heightCm:163, bloodPressure:"140/90", temperatureC:36.8 },
    { appointmentId: doneAppts[1].id,  chiefComplaint: "خفقان متكرر وتعب سريع",                     diagnosis: "اضطراب في نظم القلب — حميد",      notes: "مراقبة وتجنب الكافيين. مراجعة إذا اشتد.",             weightKg:80,   heightCm:175, bloodPressure:"130/85", temperatureC:36.6 },
    { appointmentId: doneAppts[2].id,  chiefComplaint: "ضيق شديد في التنفس ووذمة في الساقين",       diagnosis: "قصور خفيف في القلب",              notes: "بدء مدر البول. تقليل الملح. إيكو القلب خلال أسبوع.",   weightKg:95,   heightCm:178, bloodPressure:"155/95", temperatureC:36.9 },
    { appointmentId: doneAppts[3].id,  chiefComplaint: "متابعة نتائج التخطيط السابق",               diagnosis: "تحسن ملحوظ — الذبحة مستقرة",      notes: "الاستمرار على الأدوية. متابعة شهر آخر.",               weightKg:72,   heightCm:163, bloodPressure:"135/85", temperatureC:36.7 },
    { appointmentId: doneAppts[4].id,  chiefComplaint: "خفقان عند الراحة وعند المجهود",              diagnosis: "تسرع القلب الجيبي",               notes: "تحليل وظائف الغدة الدرقية. تجنب القهوة.",              weightKg:88,   heightCm:180, bloodPressure:"128/82", temperatureC:37.0 },
    { appointmentId: doneAppts[5].id,  chiefComplaint: "فحص عام دوري — بدون شكاوى",                 diagnosis: "بصحة جيدة من ناحية القلب",         notes: "العلامات الحيوية طبيعية. متابعة سنوية.",               weightKg:70,   heightCm:165, bloodPressure:"120/78", temperatureC:36.5 },
    // زيارات د. نورة
    { appointmentId: doneAppts[6].id,  chiefComplaint: "طفح جلدي أحمر مثير للحكة على الساعد",       diagnosis: "التهاب جلد تماسي",                 notes: "كريم كورتيكوستيرويد. تجنب مسببات التحسس.",            weightKg:58,   heightCm:160, bloodPressure:"118/76", temperatureC:36.5 },
    { appointmentId: doneAppts[7].id,  chiefComplaint: "فحص جلد شامل — لا شكاوى",                   diagnosis: "جلد طبيعي — لا يوجد ما يستدعي القلق", notes: "استخدام واقي الشمس يوميًا. ترطيب منتظم.",           weightKg:65,   heightCm:165, bloodPressure:"115/75", temperatureC:36.4 },
    { appointmentId: doneAppts[8].id,  chiefComplaint: "بقع بيضاء على ظهر اليدين منذ 6 أشهر",       diagnosis: "بهاق (vitiligo) — بداية المرحلة",   notes: "فحص مناعة. كريم تاكروليموس. حماية من الشمس.",         weightKg:55,   heightCm:162, bloodPressure:"110/70", temperatureC:36.6 },
    { appointmentId: doneAppts[9].id,  chiefComplaint: "متابعة نتيجة خزعة الساعد",                  diagnosis: "التهاب جلد تماسي — تحسن جيد",      notes: "خفض جرعة الكريم تدريجياً.",                           weightKg:58,   heightCm:160, bloodPressure:"116/74", temperatureC:36.5 },
    { appointmentId: doneAppts[10].id, chiefComplaint: "حساسية جلدية حادة مع حكة شديدة",            diagnosis: "أكزيما تأتبية — نوبة حادة",         notes: "كريم كورتيكوستيرويد قوي. مضاد حساسية فموي.",          weightKg:52,   heightCm:158, bloodPressure:"112/72", temperatureC:36.7 },
    // زيارات د. أحمد
    { appointmentId: doneAppts[11].id, chiefComplaint: "سيلان أنف وسعال وحرارة 38",                  diagnosis: "التهاب الجهاز التنفسي العلوي",      notes: "راحة وسوائل. خافض حرارة. مراجعة إذا زادت الحرارة.",   weightKg:80,   heightCm:175, bloodPressure:"122/80", temperatureC:38.1 },
    { appointmentId: doneAppts[12].id, chiefComplaint: "متابعة تحليل السكر التراكمي",                diagnosis: "داء السكري منضبط — HbA1c 7.2%",   notes: "الاستمرار على الميتفورمين. ممارسة الرياضة 30 دقيقة.",  weightKg:92,   heightCm:172, bloodPressure:"135/88", temperatureC:36.8 },
    { appointmentId: doneAppts[13].id, chiefComplaint: "نوبة ضيق تنفس مفاجئة",                      diagnosis: "الربو القصبي — نوبة خفيفة إلى متوسطة", notes: "بخاخ Salbutamol عند الحاجة. تجنب مثيرات الربو.",    weightKg:73,   heightCm:177, bloodPressure:"125/82", temperatureC:36.9 },
    { appointmentId: doneAppts[14].id, chiefComplaint: "متابعة نزلة البرد السابقة",                  diagnosis: "تعافٍ تام — لا توجد مضاعفات",       notes: "لا حاجة لأدوية. الاستمرار بالراحة.",                  weightKg:55,   heightCm:162, bloodPressure:"110/70", temperatureC:36.5 },
    { appointmentId: doneAppts[15].id, chiefComplaint: "ارتفاع ضغط الدم — 150/100 في المنزل",        diagnosis: "ارتفاع ضغط الدم — الدرجة الأولى",   notes: "بدء أملوديبين 5mg. تقليل الملح. متابعة أسبوعين.",     weightKg:68,   heightCm:168, bloodPressure:"150/100",temperatureC:36.6 },
    { appointmentId: doneAppts[16].id, chiefComplaint: "متابعة السكري الشهرية",                      diagnosis: "تحسن نسبي — HbA1c 7.8%",           notes: "مراجعة الجرعة. إضافة السيتاجليبتين.",                 weightKg:93,   heightCm:172, bloodPressure:"138/90", temperatureC:36.7 },
    { appointmentId: doneAppts[17].id, chiefComplaint: "آلام حادة في البطن منذ يومين",               diagnosis: "قولون هيوج — متهيج",               notes: "ربيبرازول + بوسكوبان. حمية خفيفة. ابتعد عن الحار.",   weightKg:76,   heightCm:173, bloodPressure:"120/78", temperatureC:37.2 },
  ];

  const visits = await Promise.all(
    visitsDataArr.map((v) => prisma.visit.create({ data: v }))
  );
  console.log(`  ✓ تم إنشاء ${visits.length} زيارة`);

  // ── 11. الوصفات الطبية ─────────────────────────────────────────────────────

  // زيارة 1 — ذبحة صدرية
  await prisma.prescription.create({
    data: {
      visitId: visits[0].id,
      notes: "تناول الأدوية بانتظام. تجنب المجهود الشديد. عد فوراً عند اشتداد الألم.",
      items: { create: [
        { medicineName:"أسبرين",               dosage:"75 ملغ",  frequency:"مرة يوميًا",          duration:"30 يومًا",  instructions:"مع الطعام"          },
        { medicineName:"أتورفاستاتين",          dosage:"20 ملغ",  frequency:"مرة يوميًا قبل النوم", duration:"90 يومًا",  instructions:"يمكن بمعزل عن الطعام" },
        { medicineName:"إيزوسوربيد مونونيترات", dosage:"20 ملغ",  frequency:"مرتان يوميًا",         duration:"30 يومًا",  instructions:"لا مع أدوية الضغط"  },
      ]},
    },
  });

  // زيارة 2 — اضطراب نظم القلب
  await prisma.prescription.create({
    data: {
      visitId: visits[1].id,
      notes: "تجنب الكافيين والإجهاد. مراجعة فورية عند تكرار الخفقان.",
      items: { create: [
        { medicineName:"ميتوبرولول",  dosage:"25 ملغ", frequency:"مرة يوميًا", duration:"30 يومًا", instructions:"مع الطعام صباحًا" },
      ]},
    },
  });

  // زيارة 3 — قصور خفيف في القلب
  await prisma.prescription.create({
    data: {
      visitId: visits[2].id,
      notes: "تحديد كمية الملح والسوائل. وزن يومي. عد إذا زاد الوزن 2 كغ خلال يومين.",
      items: { create: [
        { medicineName:"فوروسيميد",   dosage:"40 ملغ",  frequency:"مرة صباحًا",  duration:"30 يومًا", instructions:"راقب مستوى البوتاسيوم" },
        { medicineName:"إيناباريل",   dosage:"5 ملغ",   frequency:"مرة يوميًا",  duration:"90 يومًا", instructions:"مراقبة ضغط الدم"       },
        { medicineName:"كارفيديلول", dosage:"3.125 ملغ",frequency:"مرتان يوميًا",duration:"30 يومًا", instructions:"لا تتوقف فجأة"          },
      ]},
    },
  });

  // زيارة 7 — التهاب جلد تماسي
  await prisma.prescription.create({
    data: {
      visitId: visits[6].id,
      notes: "عدم تغطية المنطقة إلا عند الضرورة.",
      items: { create: [
        { medicineName:"كريم هيدروكورتيزون 1%", dosage:"طبقة رقيقة", frequency:"مرتان يوميًا",         duration:"14 يومًا", instructions:"على المنطقة المصابة فقط" },
        { medicineName:"سيتريزين",               dosage:"10 ملغ",     frequency:"مرة يوميًا عند الحاجة", duration:"7 أيام",   instructions:"قد يسبب النعاس"          },
      ]},
    },
  });

  // زيارة 9 — بهاق
  await prisma.prescription.create({
    data: {
      visitId: visits[8].id,
      notes: "حماية المناطق المصابة من الشمس. صبر في العلاج.",
      items: { create: [
        { medicineName:"تاكروليموس 0.1%", dosage:"طبقة رقيقة", frequency:"مرتان يوميًا", duration:"90 يومًا", instructions:"تجنب الشمس المباشرة"    },
        { medicineName:"واقي شمس SPF 50+",dosage:"كمية كافية",  frequency:"يوميًا",        duration:"دائم",     instructions:"قبل الخروج بـ 30 دقيقة" },
      ]},
    },
  });

  // زيارة 12 — التهاب الجهاز التنفسي
  await prisma.prescription.create({
    data: {
      visitId: visits[11].id,
      notes: "راحة تامة وسوائل وفيرة.",
      items: { create: [
        { medicineName:"باراسيتامول",   dosage:"500 ملغ", frequency:"كل 6 ساعات عند الحاجة", duration:"5 أيام", instructions:"لا تتجاوز 4 جرعات يوميًا" },
        { medicineName:"لوراتادين",     dosage:"10 ملغ",  frequency:"مرة يوميًا",             duration:"5 أيام", instructions:"يفضل مساءً"               },
      ]},
    },
  });

  // زيارة 13 — السكر التراكمي
  await prisma.prescription.create({
    data: {
      visitId: visits[12].id,
      notes: "قياس السكر يوميًا. نظام غذائي صارم.",
      items: { create: [
        { medicineName:"ميتفورمين",  dosage:"1000 ملغ", frequency:"مرتان يوميًا مع الطعام", duration:"90 يومًا", instructions:"مع وجبة الغداء والعشاء" },
        { medicineName:"سيتاجليبتين",dosage:"100 ملغ",  frequency:"مرة يوميًا",             duration:"90 يومًا", instructions:"يمكن مع أو بدون طعام"   },
      ]},
    },
  });

  // زيارة 14 — الربو
  await prisma.prescription.create({
    data: {
      visitId: visits[13].id,
      notes: "احمل البخاخ معك دائمًا. تجنب الغبار والتدخين.",
      items: { create: [
        { medicineName:"سالبوتامول بخاخ", dosage:"جرعتان",   frequency:"عند الحاجة",  duration:"مستمر",    instructions:"2-4 نفخات عند الأزمة"    },
        { medicineName:"فلوتيكازون بخاخ", dosage:"250 ميكغ", frequency:"مرتان يوميًا",duration:"90 يومًا", instructions:"اشطف فمك بعد الاستخدام" },
      ]},
    },
  });

  // زيارة 16 — ضغط الدم
  await prisma.prescription.create({
    data: {
      visitId: visits[15].id,
      notes: "قياس الضغط يوميًا وتسجيله. تقليل الملح والتوتر.",
      items: { create: [
        { medicineName:"أملوديبين", dosage:"5 ملغ", frequency:"مرة يوميًا صباحًا", duration:"30 يومًا", instructions:"يمكن مع أو بدون طعام" },
      ]},
    },
  });

  console.log("  ✓ تم إنشاء الوصفات الطبية");

  // ── 12. الفواتير والمدفوعات ────────────────────────────────────────────────
  const invoiceSeeds = [
    {
      visitId: visits[0].id, patientId: doneAppts[0].patientId, doctorId: doneAppts[0].doctorId,
      invoiceNumber:"INV-2025-0001", subtotal:450, discount:0,   total:450, paidAmount:450, status:"paid",
      items:[ { description:"استشارة عامة",         quantity:1, unitPrice:300, total:300 },
              { description:"تخطيط القلب ECG",      quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:450, method:"card" } ],
    },
    {
      visitId: visits[1].id, patientId: doneAppts[1].patientId, doctorId: doneAppts[1].doctorId,
      invoiceNumber:"INV-2025-0002", subtotal:300, discount:0,   total:300, paidAmount:300, status:"paid",
      items:[ { description:"استشارة عامة",         quantity:1, unitPrice:300, total:300 } ],
      payments:[ { amount:150, method:"cash" }, { amount:150, method:"card" } ],
    },
    {
      visitId: visits[2].id, patientId: doneAppts[2].patientId, doctorId: doneAppts[2].doctorId,
      invoiceNumber:"INV-2025-0003", subtotal:850, discount:50, total:800, paidAmount:400, status:"partial",
      items:[ { description:"إيكو القلب",            quantity:1, unitPrice:500, total:500 },
              { description:"استشارة عامة",          quantity:1, unitPrice:300, total:300 },
              { description:"رسوم إدارية",            quantity:1, unitPrice:50,  total:50  } ],
      payments:[ { amount:400, method:"cash" } ],
    },
    {
      visitId: visits[3].id, patientId: doneAppts[3].patientId, doctorId: doneAppts[3].doctorId,
      invoiceNumber:"INV-2025-0004", subtotal:200, discount:0,   total:200, paidAmount:200, status:"paid",
      items:[ { description:"زيارة متابعة",          quantity:1, unitPrice:200, total:200 } ],
      payments:[ { amount:200, method:"transfer" } ],
    },
    {
      visitId: visits[4].id, patientId: doneAppts[4].patientId, doctorId: doneAppts[4].doctorId,
      invoiceNumber:"INV-2025-0005", subtotal:300, discount:0,   total:300, paidAmount:300, status:"paid",
      items:[ { description:"استشارة عامة",          quantity:1, unitPrice:300, total:300 } ],
      payments:[ { amount:300, method:"card" } ],
    },
    {
      visitId: visits[5].id, patientId: doneAppts[5].patientId, doctorId: doneAppts[5].doctorId,
      invoiceNumber:"INV-2025-0006", subtotal:300, discount:30,  total:270, paidAmount:0,   status:"pending",
      items:[ { description:"استشارة عامة",          quantity:1, unitPrice:300, total:300 } ],
      payments:[],
    },
    {
      visitId: visits[6].id, patientId: doneAppts[6].patientId, doctorId: doneAppts[6].doctorId,
      invoiceNumber:"INV-2025-0007", subtotal:400, discount:0,   total:400, paidAmount:200, status:"partial",
      items:[ { description:"خزعة جلدية",             quantity:1, unitPrice:400, total:400 } ],
      payments:[ { amount:200, method:"cash" } ],
    },
    {
      visitId: visits[7].id, patientId: doneAppts[7].patientId, doctorId: doneAppts[7].doctorId,
      invoiceNumber:"INV-2025-0008", subtotal:300, discount:0,   total:300, paidAmount:300, status:"paid",
      items:[ { description:"فحص الجلد الشامل",       quantity:1, unitPrice:300, total:300 } ],
      payments:[ { amount:300, method:"card" } ],
    },
    {
      visitId: visits[8].id, patientId: doneAppts[8].patientId, doctorId: doneAppts[8].doctorId,
      invoiceNumber:"INV-2025-0009", subtotal:250, discount:0,   total:250, paidAmount:250, status:"paid",
      items:[ { description:"استشارة عامة",           quantity:1, unitPrice:250, total:250 } ],
      payments:[ { amount:250, method:"cash" } ],
    },
    {
      visitId: visits[9].id, patientId: doneAppts[9].patientId, doctorId: doneAppts[9].doctorId,
      invoiceNumber:"INV-2025-0010", subtotal:180, discount:0,   total:180, paidAmount:180, status:"paid",
      items:[ { description:"زيارة متابعة",           quantity:1, unitPrice:180, total:180 } ],
      payments:[ { amount:180, method:"card" } ],
    },
    {
      visitId: visits[10].id, patientId: doneAppts[10].patientId, doctorId: doneAppts[10].doctorId,
      invoiceNumber:"INV-2025-0011", subtotal:250, discount:0,  total:250, paidAmount:250, status:"paid",
      items:[ { description:"استشارة جلدية",          quantity:1, unitPrice:250, total:250 } ],
      payments:[ { amount:250, method:"transfer" } ],
    },
    {
      visitId: visits[11].id, patientId: doneAppts[11].patientId, doctorId: doneAppts[11].doctorId,
      invoiceNumber:"INV-2025-0012", subtotal:150, discount:0,  total:150, paidAmount:150, status:"paid",
      items:[ { description:"استشارة عامة",           quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:150, method:"cash" } ],
    },
    {
      visitId: visits[12].id, patientId: doneAppts[12].patientId, doctorId: doneAppts[12].doctorId,
      invoiceNumber:"INV-2025-0013", subtotal:210, discount:0,  total:210, paidAmount:210, status:"paid",
      items:[ { description:"اختبار السكر التراكمي",  quantity:1, unitPrice:60,  total:60  },
              { description:"استشارة عامة",           quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:210, method:"card" } ],
    },
    {
      visitId: visits[13].id, patientId: doneAppts[13].patientId, doctorId: doneAppts[13].doctorId,
      invoiceNumber:"INV-2025-0014", subtotal:150, discount:0,  total:150, paidAmount:150, status:"paid",
      items:[ { description:"استشارة عامة — حالة طارئة", quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:150, method:"cash" } ],
    },
    {
      visitId: visits[14].id, patientId: doneAppts[14].patientId, doctorId: doneAppts[14].doctorId,
      invoiceNumber:"INV-2025-0015", subtotal:100, discount:0,  total:100, paidAmount:100, status:"paid",
      items:[ { description:"زيارة متابعة",            quantity:1, unitPrice:100, total:100 } ],
      payments:[ { amount:100, method:"cash" } ],
    },
    {
      visitId: visits[15].id, patientId: doneAppts[15].patientId, doctorId: doneAppts[15].doctorId,
      invoiceNumber:"INV-2025-0016", subtotal:270, discount:0,  total:270, paidAmount:0,   status:"pending",
      items:[ { description:"مراقبة ضغط الدم المتنقلة", quantity:1, unitPrice:120, total:120 },
              { description:"استشارة عامة",             quantity:1, unitPrice:150, total:150 } ],
      payments:[],
    },
    {
      visitId: visits[16].id, patientId: doneAppts[16].patientId, doctorId: doneAppts[16].doctorId,
      invoiceNumber:"INV-2025-0017", subtotal:210, discount:0,  total:210, paidAmount:100, status:"partial",
      items:[ { description:"اختبار السكر التراكمي",    quantity:1, unitPrice:60,  total:60  },
              { description:"زيارة متابعة",              quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:100, method:"cash" } ],
    },
    {
      visitId: visits[17].id, patientId: doneAppts[17].patientId, doctorId: doneAppts[17].doctorId,
      invoiceNumber:"INV-2025-0018", subtotal:150, discount:0,  total:150, paidAmount:150, status:"paid",
      items:[ { description:"استشارة عامة",              quantity:1, unitPrice:150, total:150 } ],
      payments:[ { amount:150, method:"card" } ],
    },
  ];

  for (const inv of invoiceSeeds) {
    const { items, payments, ...fields } = inv;
    const invoice = await prisma.invoice.create({ data: fields });
    await prisma.invoiceItem.createMany({
      data: items.map((i) => ({ ...i, invoiceId: invoice.id })),
    });
    if (payments.length) {
      await prisma.payment.createMany({
        data: payments.map((p) => ({ ...p, invoiceId: invoice.id })),
      });
    }
  }
  console.log(`  ✓ تم إنشاء ${invoiceSeeds.length} فاتورة`);

  // ── 13. الملفات الطبية ─────────────────────────────────────────────────────
  await prisma.medicalFile.createMany({
    data: [
      { patientId:patients[0].id, visitId:visits[0].id,  sourceType:"visit",       fileType:"report", fileName:"ecg_report_fatima.pdf",          fileUrl:"https://storage.clinic.com/files/ecg_report_fatima.pdf",          fileSizeBytes:204800  },
      { patientId:patients[0].id, visitId:visits[3].id,  sourceType:"visit",       fileType:"report", fileName:"ecg_followup_fatima.pdf",         fileUrl:"https://storage.clinic.com/files/ecg_followup_fatima.pdf",         fileSizeBytes:189000  },
      { patientId:patients[1].id, visitId:visits[1].id,  sourceType:"visit",       fileType:"report", fileName:"holter_monitor_mohammed.pdf",     fileUrl:"https://storage.clinic.com/files/holter_monitor_mohammed.pdf",     fileSizeBytes:320000  },
      { patientId:patients[2].id, visitId:visits[6].id,  sourceType:"visit",       fileType:"lab",    fileName:"skin_biopsy_hanadi.pdf",          fileUrl:"https://storage.clinic.com/files/skin_biopsy_hanadi.pdf",          fileSizeBytes:512000  },
      { patientId:patients[3].id, sourceType:"onboarding",                          fileType:"xray",   fileName:"chest_xray_omar.jpg",             fileUrl:"https://storage.clinic.com/files/chest_xray_omar.jpg",             fileSizeBytes:1048576 },
      { patientId:patients[3].id, visitId:visits[12].id, sourceType:"visit",       fileType:"lab",    fileName:"hba1c_result_omar_jan.pdf",       fileUrl:"https://storage.clinic.com/files/hba1c_result_omar_jan.pdf",       fileSizeBytes:98000   },
      { patientId:patients[3].id, visitId:visits[16].id, sourceType:"visit",       fileType:"lab",    fileName:"hba1c_result_omar_apr.pdf",       fileUrl:"https://storage.clinic.com/files/hba1c_result_omar_apr.pdf",       fileSizeBytes:102000  },
      { patientId:patients[3].id, sourceType:"manual",                              fileType:"report", fileName:"diabetes_history_omar.pdf",       fileUrl:"https://storage.clinic.com/files/diabetes_history_omar.pdf",       fileSizeBytes:307200  },
      { patientId:patients[5].id, visitId:visits[13].id, sourceType:"visit",       fileType:"report", fileName:"spirometry_yousef.pdf",           fileUrl:"https://storage.clinic.com/files/spirometry_yousef.pdf",           fileSizeBytes:256000  },
      { patientId:patients[7].id, visitId:visits[2].id,  sourceType:"visit",       fileType:"report", fileName:"echo_report_badr.pdf",            fileUrl:"https://storage.clinic.com/files/echo_report_badr.pdf",            fileSizeBytes:870000  },
      { patientId:patients[7].id, sourceType:"onboarding",                          fileType:"report", fileName:"previous_cardiac_records_badr.pdf",fileUrl:"https://storage.clinic.com/files/previous_cardiac_records_badr.pdf",fileSizeBytes:450000 },
      { patientId:patients[9].id, visitId:visits[15].id, sourceType:"visit",       fileType:"report", fileName:"bp_monitor_turki.pdf",            fileUrl:"https://storage.clinic.com/files/bp_monitor_turki.pdf",            fileSizeBytes:134000  },
    ],
  });
  console.log("  ✓ تم إنشاء الملفات الطبية");

  // ── 14. التقييمات ──────────────────────────────────────────────────────────
  await prisma.review.createMany({
    data: [
      { patientId:patients[0].id, doctorId:doctors[0].id, type:"doctor",  rating:5, comment:"د. خالد متمكن جدًا من تخصصه ويمنح مريضه الوقت الكافي. أنصح به بشدة!",           source:"website",   isApproved:true  },
      { patientId:patients[1].id, doctorId:doctors[0].id, type:"doctor",  rating:4, comment:"طبيب محترف وواضح في شرح الحالة. المواعيد منتظمة والانتظار معقول.",                source:"website",   isApproved:true  },
      { patientId:patients[7].id, doctorId:doctors[0].id, type:"doctor",  rating:5, comment:"أفضل طبيب قلب زرته. شرح لي وضعي بكل وضوح وطمأنني تمامًا.",                       source:"reception", isApproved:true  },
      { patientId:patients[2].id, doctorId:doctors[1].id, type:"doctor",  rating:5, comment:"د. نورة متخصصة ودقيقة في التشخيص. علاجها فعّال جدًا.",                           source:"website",   isApproved:true  },
      { patientId:patients[4].id, doctorId:doctors[1].id, type:"doctor",  rating:4, comment:"طبيبة ممتازة ومتفهمة. أوصت بالعلاج الصحيح من أول زيارة.",                        source:"website",   isApproved:true  },
      { patientId:patients[6].id, doctorId:doctors[1].id, type:"doctor",  rating:5, comment:"تعاملها راقٍ جدًا وصبور مع المريض. شكرًا د. نورة!",                              source:"reception", isApproved:true  },
      { patientId:patients[1].id, doctorId:doctors[2].id, type:"doctor",  rating:5, comment:"د. أحمد طبيب ممتاز، تعامله راقٍ ودقيق في التشخيص.",                              source:"reception", isApproved:true  },
      { patientId:patients[5].id, doctorId:doctors[2].id, type:"doctor",  rating:4, comment:"طبيب متعاون ويستمع لك جيدًا. أنصح به للعائلة.",                                  source:"website",   isApproved:true  },
      { patientId:patients[9].id, doctorId:doctors[2].id, type:"doctor",  rating:5, comment:"متابع معه منذ سنوات. دائمًا دقيق في التشخيص والمتابعة.",                          source:"website",   isApproved:true  },
      { patientId:patients[4].id,                         type:"center",  rating:5, comment:"العيادة نظيفة ومرتبة والموظفون متعاونون جدًا. تجربة ممتازة.",                     source:"reception", isApproved:true  },
      { patientId:patients[8].id,                         type:"center",  rating:4, comment:"المكان مريح وهادئ ووقت الانتظار معقول. الاستقبال محترف.",                         source:"website",   isApproved:true  },
      { patientId:patients[3].id, doctorId:doctors[0].id, type:"doctor",  rating:3, comment:"وقت الانتظار طويل نسبيًا لكن الطبيب ممتاز وشرح لي كل شيء.",                      source:"website",   isApproved:false },
      { patientId:patients[0].id,                         type:"center",  rating:4, comment:"نظام الحجز الإلكتروني ممتاز وسهل الاستخدام. أتمنى تطوير موقف السيارات.",          source:"website",   isApproved:false },
    ],
  });
  console.log("  ✓ تم إنشاء التقييمات");

  // ── 15. بيانات المركز ──────────────────────────────────────────────────────
  await prisma.center.create({
    data: {
      name:        "عيادة الشفاء التخصصية",
      description: "مجمع طبي متعدد التخصصات يقدم خدمات صحية متكاملة للمرضى منذ عام 2010، ويضم نخبة من الأطباء المعتمدين.",
      basePrice:   100,
      duration:    30,
    },
  });
  console.log("  ✓ تم إنشاء بيانات المركز");

  // ── 16. الأسئلة الشائعة ────────────────────────────────────────────────────
  await prisma.commonQuestion.createMany({
    data: [
      { question:"كيف يمكنني حجز موعد؟",                        answer:"يمكنك حجز موعد عبر الموقع الإلكتروني أو بالاتصال بمكتب الاستقبال أو بالزيارة الشخصية للعيادة." },
      { question:"ما شركات التأمين الطبي التي تتعاملون معها؟", answer:"نتعاون مع معظم شركات التأمين الكبرى. يُرجى التواصل مع الاستقبال للتحقق من شمول وثيقتك." },
      { question:"ما أوقات عمل العيادة؟",                       answer:"نعمل من الأحد إلى الخميس من 9:00 صباحًا حتى 5:00 مساءً. مغلق الجمعة والسبت." },
      { question:"هل يمكنني الحصول على سجلاتي الطبية؟",        answer:"نعم، يمكنك طلب سجلاتك من مكتب الاستقبال أو تحميلها مباشرةً عبر بوابة المريض الإلكترونية." },
      { question:"كيف أُلغي موعدي أو أُعيد جدولته؟",           answer:"يمكنك الإلغاء أو إعادة الجدولة عبر الموقع أو الاتصال بنا قبل 24 ساعة من الموعد." },
      { question:"هل تتوفر استشارات عبر الإنترنت؟",             answer:"نعم، نوفر خدمة الاستشارات الطبية عن بُعد. تواصل معنا لمعرفة التخصصات المتاحة." },
    ],
  });
  console.log("  ✓ تم إنشاء الأسئلة الشائعة");

  // ── 17. سجلات التدقيق ──────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { tableName:"appointments", recordId:appointments[0].id, action:"create", newValue:{ status:"scheduled" },  performedBy:receptionistUser.id },
      { tableName:"appointments", recordId:appointments[0].id, action:"update", oldValue:{ status:"scheduled" }, newValue:{ status:"done" },       performedBy:doctorUsers[0].id   },
      { tableName:"patients",     recordId:patients[10].id,    action:"create", newValue:{ patientCode:"PAT-0011", name:"سعد الغامدي" },           performedBy:receptionistUser.id },
      { tableName:"invoices",     recordId:appointments[2].id, action:"create", newValue:{ invoiceNumber:"INV-2025-0003", total:800 },              performedBy:receptionistUser.id },
      { tableName:"appointments", recordId:appointments[6].id, action:"update", oldValue:{ status:"scheduled" }, newValue:{ status:"in_progress" }, performedBy:doctorUsers[0].id   },
    ],
  });
  console.log("  ✓ تم إنشاء سجلات التدقيق");

  // ── 18. رموز إعادة تعيين كلمة المرور ──────────────────────────────────────
  await prisma.passwordResetToken.create({
    data: { userId:patientUsers[0].id, token:"sample-reset-token-abc123", expiresAt:addHours(now, 1) },
  });
  console.log("  ✓ تم إنشاء رموز إعادة تعيين كلمة المرور");

  // ── ملخص نهائي ──────────────────────────────────────────────────────────────
  console.log("\n🎉  اكتمل البذر بنجاح!");
  console.log("\n📊  إحصائيات البذر:");
  console.log(`  المستخدمون:    ${2 + doctorUsers.length + patientUsers.length}`);
  console.log(`  الأطباء:       ${doctors.length}`);
  console.log(`  المرضى:        ${patients.length}`);
  console.log(`  المواعيد:      ${appointments.length}`);
  console.log(`  الزيارات:      ${visits.length}`);
  console.log(`  الفواتير:      ${invoiceSeeds.length}`);
  console.log("\n📋  بيانات الدخول (كلمة المرور لجميع الحسابات: Password123!):");
  console.log("  الدور              | البريد الإلكتروني");
  console.log("  ───────────────── | ──────────────────────────────");
  console.log("  مدير النظام        | admin@clinic.com");
  console.log("  موظف الاستقبال     | reception@clinic.com");
  console.log("  طبيب قلب (12 موعد) | khaled.omari@clinic.com");
  console.log("  طبيبة جلدية (11)   | noura.shammari@clinic.com");
  console.log("  طبيب عام (13 موعد) | ahmed.salem@clinic.com");
  console.log("  مريضة              | fatima@example.com");
  console.log("  مريض               | mohammed@example.com");
}

main()
  .catch((e) => { console.error("❌  فشل البذر:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());