import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma";

// ─── الدوال المساعدة ─────────────────────────────────────────────────────────

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

// ─── الدالة الرئيسية للبذر ───────────────────────────────────────────────────

async function main() {
  console.log("🌱  بدء عملية البذر…");

  // ── 1. حذف البيانات الموجودة (بالترتيب الصحيح لتجنب أخطاء المفاتيح الخارجية) ──
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

  // ── 2. المستخدمون ─────────────────────────────────────────────────────────
  const password = await hashPassword("Password123!");

  // مدير النظام
  const adminUser = await prisma.user.create({
    data: {
      name: "مدير النظام",
      email: "admin@clinic.com",
      passwordHash: password,
      role: "admin",
      phone: "+966-50-0000100",
      isActive: true,
    },
  });

  // موظف الاستقبال
  const receptionistUser = await prisma.user.create({
    data: {
      name: "سارة أحمد",
      email: "reception@clinic.com",
      passwordHash: password,
      role: "receptionist",
      phone: "+966-50-0000101",
      isActive: true,
    },
  });

  // مستخدمو الأطباء
  const doctorUsersData = [
    { name: "د. خالد العمري",  email: "khaled.omari@clinic.com",  phone: "+966-50-0000201" },
    { name: "د. نورة الشمري",  email: "noura.shammari@clinic.com", phone: "+966-50-0000202" },
    { name: "د. أحمد السالم",  email: "ahmed.salem@clinic.com",    phone: "+966-50-0000203" },
  ];

  const doctorUsers = await Promise.all(
    doctorUsersData.map((d) =>
      prisma.user.create({
        data: { ...d, passwordHash: password, role: "doctor", isActive: true },
      })
    )
  );

  // مستخدمو المرضى
  const patientUsersData = [
    { name: "فاطمة الزهراء", email: "fatima@example.com", phone: "+966-50-0001001" },
    { name: "محمد علي",      email: "mohammed@example.com", phone: "+966-50-0001002" },
    { name: "هنادي عبدالله", email: "hanadi@example.com",  phone: "+966-50-0001003" },
    { name: "عمر الرشيد",   email: "omar@example.com",    phone: "+966-50-0001004" },
    { name: "ريم المنصور",  email: "reem@example.com",    phone: "+966-50-0001005" },
  ];

  const patientUsers = await Promise.all(
    patientUsersData.map((p) =>
      prisma.user.create({
        data: { ...p, passwordHash: password, role: "patient", isActive: true },
      })
    )
  );

  console.log(`  ✓ تم إنشاء ${2 + doctorUsers.length + patientUsers.length} مستخدم`);

  // ── 3. الأطباء ────────────────────────────────────────────────────────────
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

  // ── 4. جداول مواعيد الأطباء (الأحد–الخميس 09:00–17:00) ──────────────────
  const startTime = new Date("1970-01-01T09:00:00Z");
  const endTime   = new Date("1970-01-01T17:00:00Z");

  // أيام العمل: 0=الأحد، 1=الاثنين، ... 4=الخميس
  for (const doctor of doctors) {
    for (let day = 0; day <= 4; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime,
          endTime,
          isActive: true,
        },
      });
    }
  }
  console.log("  ✓ تم إنشاء جداول الأطباء");

  // ── 5. فترات الحجب لدى الأطباء ──────────────────────────────────────────
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

  // ── 6. المرضى ─────────────────────────────────────────────────────────────
  const patientSeedData = [
    {
      userId: patientUsers[0].id,
      patientCode: "PAT-0001",
      name: patientUsers[0].name,
      dateOfBirth: new Date("1990-03-15"),
      gender: "female",
      phone: patientUsers[0].phone,
      address: "الرياض، حي النزهة، شارع الأمير سلطان",
      bloodType: "A+",
      chronicDiseases: "ارتفاع ضغط الدم",
      allergies: "البنسلين",
    },
    {
      userId: patientUsers[1].id,
      patientCode: "PAT-0002",
      name: patientUsers[1].name,
      dateOfBirth: new Date("1985-07-22"),
      gender: "male",
      phone: patientUsers[1].phone,
      address: "جدة، حي الروضة، شارع التحلية",
      bloodType: "O+",
    },
    {
      userId: patientUsers[2].id,
      patientCode: "PAT-0003",
      name: patientUsers[2].name,
      dateOfBirth: new Date("1995-11-08"),
      gender: "female",
      phone: patientUsers[2].phone,
      address: "الدمام، حي الفيصلية",
      bloodType: "B-",
      allergies: "الأسبرين",
    },
    {
      userId: patientUsers[3].id,
      patientCode: "PAT-0004",
      name: patientUsers[3].name,
      dateOfBirth: new Date("1978-01-30"),
      gender: "male",
      phone: patientUsers[3].phone,
      address: "مكة المكرمة، حي العزيزية",
      bloodType: "AB+",
      chronicDiseases: "داء السكري من النوع الثاني، ارتفاع الكوليسترول",
    },
    {
      userId: patientUsers[4].id,
      patientCode: "PAT-0005",
      name: patientUsers[4].name,
      dateOfBirth: new Date("2000-05-19"),
      gender: "female",
      phone: patientUsers[4].phone,
      address: "المدينة المنورة، حي قباء",
      bloodType: "O-",
    },
    // مريض بدون حساب مستخدم (زيارة مباشرة)
    {
      patientCode: "PAT-0006",
      name: "سعد الغامدي",
      dateOfBirth: new Date("1965-09-12"),
      gender: "male",
      phone: "+966-50-0001006",
      address: "الطائف، حي الشهداء",
      bloodType: "A-",
    },
  ];

  const patients = await Promise.all(
    patientSeedData.map((p) => prisma.patient.create({ data: p }))
  );
  console.log(`  ✓ تم إنشاء ${patients.length} مرضى`);

  // ── 7. الخدمات ────────────────────────────────────────────────────────────
  const servicesData = [
    {
      name: "استشارة عامة",
      description: "كشف خارجي قياسي يشمل الفحص السريري والتقييم الطبي",
      durationMin: 30,
      basePrice: 150,
    },
    {
      name: "تخطيط القلب الكهربائي",
      description: "فحص تخطيط القلب ECG لتقييم النشاط الكهربائي للقلب",
      durationMin: 20,
      basePrice: 80,
    },
    {
      name: "خزعة جلدية",
      description: "إجراء أخذ عينة جلدية بسيطة لتحليلها مخبريًا",
      durationMin: 45,
      basePrice: 200,
    },
    {
      name: "زيارة متابعة",
      description: "زيارة متابعة ما بعد العلاج أو الإجراء الطبي",
      durationMin: 20,
      basePrice: 100,
    },
    {
      name: "مراقبة ضغط الدم المتنقلة",
      description: "مراقبة ضغط الدم بصورة مستمرة لمدة 24 ساعة",
      durationMin: 15,
      basePrice: 120,
    },
    {
      name: "اختبار السكر التراكمي",
      description: "قياس نسبة HbA1c لمتابعة مرضى السكري",
      durationMin: 10,
      basePrice: 60,
    },
  ];

  const services = await Promise.all(
    servicesData.map((s) => prisma.service.create({ data: s }))
  );
  console.log(`  ✓ تم إنشاء ${services.length} خدمات`);

  // ── 8. خدمات الأطباء (الأسعار الخاصة بكل طبيب) ─────────────────────────
  await prisma.doctorService.createMany({
    data: [
      // د. خالد — أمراض القلب
      { doctorId: doctors[0].id, serviceId: services[0].id, price: 300 }, // استشارة عامة
      { doctorId: doctors[0].id, serviceId: services[1].id, price: 150 }, // تخطيط القلب
      { doctorId: doctors[0].id, serviceId: services[4].id, price: 200 }, // مراقبة ضغط الدم
      { doctorId: doctors[0].id, serviceId: services[3].id, price: 200 }, // زيارة متابعة
      // د. نورة — الأمراض الجلدية
      { doctorId: doctors[1].id, serviceId: services[0].id, price: 250 }, // استشارة عامة
      { doctorId: doctors[1].id, serviceId: services[2].id, price: 400 }, // خزعة جلدية
      { doctorId: doctors[1].id, serviceId: services[3].id, price: 180 }, // زيارة متابعة
      // د. أحمد — الطب العام
      { doctorId: doctors[2].id, serviceId: services[0].id, price: 150 }, // استشارة عامة
      { doctorId: doctors[2].id, serviceId: services[3].id, price: 100 }, // زيارة متابعة
      { doctorId: doctors[2].id, serviceId: services[4].id, price: 120 }, // مراقبة ضغط الدم
      { doctorId: doctors[2].id, serviceId: services[5].id, price: 60  }, // اختبار السكر التراكمي
    ],
  });
  console.log("  ✓ تم إنشاء خدمات الأطباء");

  // ── 9. المواعيد ───────────────────────────────────────────────────────────
  const now = new Date();

  const appointmentsData = [
    // مواعيد منتهية (done) — ستُنشأ لها زيارات
    {
      patientId: patients[0].id,
      doctorId:  doctors[0].id,
      serviceId: services[0].id,
      scheduledAt: addDays(now, -10),
      status: "done",
      type:   "new",
      notes:  "مريضة مُحالة من طبيب الأسرة بسبب ألم في الصدر.",
    },
    {
      patientId: patients[1].id,
      doctorId:  doctors[1].id,
      serviceId: services[2].id,
      scheduledAt: addDays(now, -7),
      status: "done",
      type:   "new",
    },
    {
      patientId: patients[2].id,
      doctorId:  doctors[2].id,
      serviceId: services[0].id,
      scheduledAt: addDays(now, -3),
      status: "done",
      type:   "new",
    },
    // موعد جارٍ الآن
    {
      patientId: patients[3].id,
      doctorId:  doctors[0].id,
      serviceId: services[1].id,
      scheduledAt: addHours(now, -1),
      status: "in_progress",
      type:   "follow_up",
    },
    // موعد في الانتظار
    {
      patientId: patients[4].id,
      doctorId:  doctors[2].id,
      serviceId: services[4].id,
      scheduledAt: addHours(now, 1),
      status: "waiting",
      type:   "new",
    },
    // مواعيد مجدولة مستقبلًا
    {
      patientId: patients[0].id,
      doctorId:  doctors[0].id,
      serviceId: services[3].id,
      scheduledAt: addDays(now, 5),
      status: "scheduled",
      type:   "follow_up",
      notes:  "متابعة نتائج تخطيط القلب.",
    },
    {
      patientId: patients[5].id,
      doctorId:  doctors[1].id,
      serviceId: services[0].id,
      scheduledAt: addDays(now, 8),
      status: "scheduled",
      type:   "new",
    },
    {
      patientId: patients[3].id,
      doctorId:  doctors[2].id,
      serviceId: services[5].id,
      scheduledAt: addDays(now, 12),
      status: "scheduled",
      type:   "follow_up",
      notes:  "متابعة قياس السكر التراكمي.",
    },
    // موعد ملغى
    {
      patientId: patients[1].id,
      doctorId:  doctors[2].id,
      serviceId: services[3].id,
      scheduledAt: addDays(now, -5),
      status: "cancelled",
      type:   "follow_up",
    },
    // غياب بدون إشعار
    {
      patientId: patients[2].id,
      doctorId:  doctors[0].id,
      serviceId: services[0].id,
      scheduledAt: addDays(now, -2),
      status: "no_show",
      type:   "new",
    },
  ];

  const appointments = await Promise.all(
    appointmentsData.map((a) => prisma.appointment.create({ data: a }))
  );
  console.log(`  ✓ تم إنشاء ${appointments.length} مواعيد`);

  // ── 10. الزيارات ──────────────────────────────────────────────────────────
  const doneAppointments = appointments.filter((a) => a.status === "done");

  const visitDataArr = [
    {
      appointmentId: doneAppointments[0].id,
      chiefComplaint: "ضيق في الصدر وضيق في التنفس عند المجهود",
      diagnosis: "ذبحة صدرية مستقرة",
      notes: "بدء جرعة منخفضة من الأسبرين. طلب تخطيط قلب. متابعة خلال أسبوعين.",
      weightKg: 72.5,
      heightCm: 163,
      bloodPressure: "140/90",
      temperatureC: 36.8,
    },
    {
      appointmentId: doneAppointments[1].id,
      chiefComplaint: "طفح جلدي أحمر مثير للحكة على منطقة الساعد الأيسر",
      diagnosis: "التهاب جلد تماسي",
      notes: "وصف كريم كورتيكوستيرويد موضعي. تجنب مسببات التحسس. مراجعة عند الحاجة.",
      weightKg: 80,
      heightCm: 175,
      bloodPressure: "120/80",
      temperatureC: 36.6,
    },
    {
      appointmentId: doneAppointments[2].id,
      chiefComplaint: "فحص دوري سنوي — لا شكاوى محددة",
      diagnosis: "بصحة جيدة — لا يوجد ما يستدعي القلق",
      notes: "جميع العلامات الحيوية طبيعية. يُنصح بزيادة شرب الماء وممارسة الرياضة.",
      weightKg: 58,
      heightCm: 162,
      bloodPressure: "118/76",
      temperatureC: 36.5,
    },
  ];

  const visits = await Promise.all(
    visitDataArr.map((v) => prisma.visit.create({ data: v }))
  );
  console.log(`  ✓ تم إنشاء ${visits.length} زيارات`);

  // ── 11. الوصفات الطبية ────────────────────────────────────────────────────
  // وصفة الزيارة الأولى — أمراض القلب
  await prisma.prescription.create({
    data: {
      visitId: visits[0].id,
      notes: "تناول جميع الأدوية بانتظام. تجنب المجهود البدني الشديد. العودة فورًا عند اشتداد الألم.",
      items: {
        create: [
          {
            medicineName: "أسبرين",
            dosage: "75 ملغ",
            frequency: "مرة واحدة يوميًا",
            duration: "30 يومًا",
            instructions: "تناول مع الطعام أو بعده مباشرة.",
          },
          {
            medicineName: "أتورفاستاتين",
            dosage: "20 ملغ",
            frequency: "مرة واحدة يوميًا قبل النوم",
            duration: "90 يومًا",
            instructions: "يمكن تناوله بمعزل عن الطعام.",
          },
          {
            medicineName: "إيزوسوربيد مونونيترات",
            dosage: "20 ملغ",
            frequency: "مرتان يوميًا",
            duration: "30 يومًا",
            instructions: "لا تأخذ مع أدوية ضغط الدم.",
          },
        ],
      },
    },
  });

  // وصفة الزيارة الثانية — الأمراض الجلدية
  await prisma.prescription.create({
    data: {
      visitId: visits[1].id,
      notes: "عدم تغطية المنطقة المصابة بضمادة إلا عند نصيحة الطبيب.",
      items: {
        create: [
          {
            medicineName: "كريم هيدروكورتيزون 1%",
            dosage: "طبقة رقيقة",
            frequency: "مرتان يوميًا",
            duration: "14 يومًا",
            instructions: "يوضع على المنطقة المصابة فقط. تجنب ملامسة العين.",
          },
          {
            medicineName: "سيتريزين",
            dosage: "10 ملغ",
            frequency: "مرة واحدة يوميًا عند الحاجة",
            duration: "7 أيام",
            instructions: "يُعطى لتخفيف الحكة. قد يسبب النعاس.",
          },
        ],
      },
    },
  });
  console.log("  ✓ تم إنشاء الوصفات الطبية");

  // ── 12. الفواتير والمدفوعات ───────────────────────────────────────────────
  const invoiceSeeds = [
    {
      visitId:   visits[0].id,
      patientId: doneAppointments[0].patientId,
      doctorId:  doneAppointments[0].doctorId,
      invoiceNumber: "INV-2025-0001",
      subtotal:   450,
      discount:    0,
      total:      450,
      paidAmount: 450,
      status: "paid",
      items: [
        { description: "استشارة عامة — د. خالد العمري", quantity: 1, unitPrice: 300, total: 300 },
        { description: "تخطيط القلب الكهربائي",          quantity: 1, unitPrice: 150, total: 150 },
      ],
      payments: [{ amount: 450, method: "card" }],
    },
    {
      visitId:   visits[1].id,
      patientId: doneAppointments[1].patientId,
      doctorId:  doneAppointments[1].doctorId,
      invoiceNumber: "INV-2025-0002",
      subtotal:   400,
      discount:    20,
      total:      380,
      paidAmount: 200,
      status: "partial",
      items: [
        { description: "خزعة جلدية — د. نورة الشمري", quantity: 1, unitPrice: 400, total: 400 },
      ],
      payments: [{ amount: 200, method: "cash" }],
    },
    {
      visitId:   visits[2].id,
      patientId: doneAppointments[2].patientId,
      doctorId:  doneAppointments[2].doctorId,
      invoiceNumber: "INV-2025-0003",
      subtotal:   150,
      discount:    0,
      total:      150,
      paidAmount:   0,
      status: "pending",
      items: [
        { description: "استشارة عامة — د. أحمد السالم", quantity: 1, unitPrice: 150, total: 150 },
      ],
      payments: [],
    },
  ];

  for (const inv of invoiceSeeds) {
    const { items, payments, ...invoiceFields } = inv;
    const invoice = await prisma.invoice.create({ data: invoiceFields });
    await prisma.invoiceItem.createMany({
      data: items.map((i) => ({ ...i, invoiceId: invoice.id })),
    });
    if (payments.length) {
      await prisma.payment.createMany({
        data: payments.map((p) => ({ ...p, invoiceId: invoice.id })),
      });
    }
  }
  console.log("  ✓ تم إنشاء الفواتير والمدفوعات");

  // ── 13. الملفات الطبية ────────────────────────────────────────────────────
  await prisma.medicalFile.createMany({
    data: [
      {
        patientId:     patients[0].id,
        visitId:       visits[0].id,
        sourceType:    "visit",
        fileType:      "report",
        fileName:      "ecg_report_fatima.pdf",
        fileUrl:       "https://storage.clinic.com/files/ecg_report_fatima.pdf",
        fileSizeBytes: 204800,
      },
      {
        patientId:     patients[1].id,
        visitId:       visits[1].id,
        sourceType:    "visit",
        fileType:      "lab",
        fileName:      "skin_biopsy_mohammed.pdf",
        fileUrl:       "https://storage.clinic.com/files/skin_biopsy_mohammed.pdf",
        fileSizeBytes: 512000,
      },
      {
        patientId:     patients[3].id,
        sourceType:    "onboarding",
        fileType:      "xray",
        fileName:      "chest_xray_omar.jpg",
        fileUrl:       "https://storage.clinic.com/files/chest_xray_omar.jpg",
        fileSizeBytes: 1048576,
      },
      {
        patientId:     patients[3].id,
        sourceType:    "manual",
        fileType:      "report",
        fileName:      "diabetes_report_omar.pdf",
        fileUrl:       "https://storage.clinic.com/files/diabetes_report_omar.pdf",
        fileSizeBytes: 307200,
      },
    ],
  });
  console.log("  ✓ تم إنشاء الملفات الطبية");

  // ── 14. التقييمات ─────────────────────────────────────────────────────────
  // ملاحظة: type = "doctor" | "center" — ReviewType enum
  //         source = "website" | "reception" — ReviewSource enum
  await prisma.review.createMany({
    data: [
      {
        patientId:  patients[0].id,
        doctorId:   doctors[0].id,
        type:       "doctor",
        rating:     5,
        comment:    "د. خالد متمكن جدًا من تخصصه ويمنح مريضه الوقت الكافي. أنصح به بشدة!",
        source:     "website",
        isApproved: true,
      },
      {
        patientId:  patients[1].id,
        doctorId:   doctors[1].id,
        type:       "doctor",
        rating:     4,
        comment:    "د. نورة ذات خبرة عالية وتشرح الحالة بوضوح. شكرًا جزيلًا.",
        source:     "website",
        isApproved: true,
      },
      {
        patientId:  patients[2].id,
        doctorId:   doctors[2].id,
        type:       "doctor",
        rating:     5,
        comment:    "د. أحمد طبيب ممتاز، تعامله راقٍ ودقيق في التشخيص.",
        source:     "reception",
        isApproved: true,
      },
      {
        // تقييم للمركز بدون ربط بطبيب معين
        patientId:  patients[4].id,
        type:       "center",
        rating:     5,
        comment:    "العيادة نظيفة ومرتبة والموظفون متعاونون جدًا. تجربة ممتازة.",
        source:     "reception",
        isApproved: false,
      },
      {
        patientId:  patients[3].id,
        doctorId:   doctors[0].id,
        type:       "doctor",
        rating:     3,
        comment:    "وقت الانتظار طويل نسبيًا لكن الطبيب ممتاز.",
        source:     "website",
        isApproved: false,
      },
    ],
  });
  console.log("  ✓ تم إنشاء التقييمات");

  // ── 15. بيانات المركز ─────────────────────────────────────────────────────
  await prisma.center.create({
    data: {
      name:        "عيادة الشفاء التخصصية",
      description: "مجمع طبي متعدد التخصصات يقدم خدمات صحية متكاملة للمرضى منذ عام 2010، ويضم نخبة من الأطباء المعتمدين.",
      basePrice:   100,
      duration:    30,
    },
  });
  console.log("  ✓ تم إنشاء بيانات المركز");

  // ── 16. الأسئلة الشائعة (FAQ) ────────────────────────────────────────────
  await prisma.commonQuestion.createMany({
    data: [
      {
        question: "كيف يمكنني حجز موعد؟",
        answer:   "يمكنك حجز موعد عبر الموقع الإلكتروني، أو تطبيق الجوال، أو بالاتصال بمكتب الاستقبال، أو بالزيارة الشخصية للعيادة.",
      },
      {
        question: "ما شركات التأمين الطبي التي تتعاملون معها؟",
        answer:   "نتعاون مع معظم شركات التأمين الطبي الكبرى. يُرجى التواصل مع الاستقبال للتحقق من شمول وثيقتك.",
      },
      {
        question: "ما أوقات عمل العيادة؟",
        answer:   "نعمل من الأحد إلى الخميس من الساعة 9:00 صباحًا حتى 5:00 مساءً. مغلق الجمعة والسبت.",
      },
      {
        question: "هل يمكنني الحصول على نسخة من سجلاتي الطبية؟",
        answer:   "نعم، يمكنك طلب سجلاتك الطبية من مكتب الاستقبال أو تحميلها مباشرةً عبر بوابة المريض الإلكترونية.",
      },
      {
        question: "كيف أُلغي موعدي أو أُعيد جدولته؟",
        answer:   "يمكنك الإلغاء أو إعادة الجدولة عبر الموقع الإلكتروني أو الاتصال بنا قبل 24 ساعة على الأقل من الموعد.",
      },
      {
        question: "هل تتوفر استشارات عبر الإنترنت (أونلاين)؟",
        answer:   "نعم، نوفر خدمة الاستشارات الطبية عن بُعد عبر تطبيق العيادة. تواصل معنا لمعرفة التخصصات المتاحة.",
      },
    ],
  });
  console.log("  ✓ تم إنشاء الأسئلة الشائعة");

  // ── 17. سجلات التدقيق ────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        tableName:   "appointments",
        recordId:    appointments[0].id,
        action:      "create",
        newValue:    { status: "scheduled" },
        performedBy: receptionistUser.id,
      },
      {
        tableName:   "appointments",
        recordId:    appointments[0].id,
        action:      "update",
        oldValue:    { status: "scheduled" },
        newValue:    { status: "done" },
        performedBy: doctorUsers[0].id,
      },
      {
        tableName:   "appointments",
        recordId:    appointments[3].id,
        action:      "update",
        oldValue:    { status: "scheduled" },
        newValue:    { status: "in_progress" },
        performedBy: doctorUsers[0].id,
      },
      {
        tableName:   "invoices",
        recordId:    "00000000-0000-0000-0000-000000000001",
        action:      "create",
        newValue:    { invoiceNumber: "INV-2025-0001", total: 450 },
        performedBy: receptionistUser.id,
      },
      {
        tableName:   "patients",
        recordId:    patients[0].id,
        action:      "create",
        newValue:    { patientCode: "PAT-0001", name: "فاطمة الزهراء" },
        performedBy: receptionistUser.id,
      },
    ],
  });
  console.log("  ✓ تم إنشاء سجلات التدقيق");

  // ── 18. رموز إعادة تعيين كلمة المرور ────────────────────────────────────
  await prisma.passwordResetToken.create({
    data: {
      userId:    patientUsers[0].id,
      token:     "sample-reset-token-abc123",
      expiresAt: addHours(now, 1),
    },
  });
  await prisma.passwordResetToken.create({
    data: {
      userId:    patientUsers[2].id,
      token:     "sample-reset-token-xyz789",
      expiresAt: addHours(now, 2),
    },
  });
  console.log("  ✓ تم إنشاء رموز إعادة تعيين كلمة المرور");

  // ── ملخص نهائي ───────────────────────────────────────────────────────────
  console.log("\n🎉  اكتمل البذر بنجاح!");
  console.log("\n📋  بيانات الدخول الافتراضية (كلمة المرور لجميع الحسابات): Password123!");
  console.log("\n  الدور           | البريد الإلكتروني");
  console.log("  ─────────────── | ──────────────────────────────");
  console.log("  مدير النظام     | admin@clinic.com");
  console.log("  موظف الاستقبال  | reception@clinic.com");
  console.log("  طبيب قلب        | khaled.omari@clinic.com");
  console.log("  طبيبة جلدية     | noura.shammari@clinic.com");
  console.log("  طبيب عام        | ahmed.salem@clinic.com");
  console.log("  مريضة           | fatima@example.com");
  console.log("  مريض            | mohammed@example.com");
  console.log("  مريضة           | hanadi@example.com");
  console.log("  مريض            | omar@example.com");
  console.log("  مريضة           | reem@example.com");
}

main()
  .catch((e) => {
    console.error("❌  فشل البذر:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
