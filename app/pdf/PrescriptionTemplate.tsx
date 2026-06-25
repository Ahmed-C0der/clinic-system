// src/pdf/PrescriptionTemplate.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// ===================== REGISTER ARABIC FONT =====================
Font.register({
  family: 'Cairo',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpcWmhzfH5lWWgcQyyYwpYLQ.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/cairo/v28/SLXfc1nY6HkvangtZmpQdkhzfH5lWWgcQyyYwpYLQ.ttf',
      fontWeight: 'bold',
    },
  ],
});

// ===================== TYPES =====================
type PrescriptionItem = {
  id: string;
  medicationName: string;
  dosage: string;           // ✅ مش null — بنعمل fallback في الـ service
  frequency: string;
  duration: string;
  instructions?: string | null;
};

type Props = {
  patient: {
    name: string;
    dateOfBirth: Date | string;   // ✅ مش null — بنعمل fallback في الـ service
  };
  doctor: {
    name: string;
    specialty: string;            // ✅ مش null — بنعمل fallback في الـ service
  };
  visit: {
    id: string;
    date: Date | string;
    diagnosis: string;            // ✅ مش null — بنعمل fallback في الـ service
    notes?: string | null;
  };
  items: PrescriptionItem[];
};

// ===================== HELPERS =====================
function calculateAge(dateOfBirth: Date | string): number {
  const dob = new Date(dateOfBirth);
  const diff = Date.now() - dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Cairo',
    color: '#2c3e50',
    backgroundColor: '#fff',
    direction: 'rtl',
  },

  // --- Header ---
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1a5276',
    marginBottom: 20,
  },
  clinicName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a5276',
    textAlign: 'right',
  },
  clinicSub: {
    fontSize: 9,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  prescriptionNo: {
    fontSize: 10,
    color: '#555',
    textAlign: 'left',
  },
  dateText: {
    fontSize: 10,
    color: '#555',
    marginTop: 3,
    textAlign: 'left',
  },

  // --- Info Box ---
  infoBox: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#eaf4fb',
    borderRadius: 5,
    padding: 12,
  },
  infoCardTitle: {
    fontSize: 10,
    color: '#1a5276',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    marginBottom: 5,
    gap: 6,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'right',
    flex: 1,
  },

  // --- Diagnosis ---
  diagnosisBox: {
    borderRightWidth: 4,
    borderRightColor: '#1a5276',
    paddingRight: 12,
    paddingLeft: 8,
    paddingVertical: 10,
    backgroundColor: '#fdfefe',
    marginBottom: 20,
  },
  diagnosisTitle: {
    fontSize: 10,
    color: '#1a5276',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'right',
  },
  diagnosisText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  notesText: {
    fontSize: 10,
    color: '#555',
    marginTop: 6,
    textAlign: 'right',
    fontStyle: 'italic',
  },

  // --- Medications ---
  rxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a5276',
    marginBottom: 12,
    textAlign: 'right',
  },
  medicationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    borderRightWidth: 3,
    borderRightColor: '#2e86c1',
  },
  medicationName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a5276',
    marginBottom: 8,
    textAlign: 'right',
  },
  medicationRow: {
    flexDirection: 'row-reverse',
    marginBottom: 4,
    gap: 8,
  },
  medicationLabel: {
    fontSize: 10,
    color: '#777',
    width: 70,
    textAlign: 'right',
  },
  medicationValue: {
    fontSize: 10,
    flex: 1,
    textAlign: 'right',
  },
  instructionBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 3,
    padding: 7,
    marginTop: 7,
  },
  instructionText: {
    fontSize: 10,
    color: '#7d6608',
    textAlign: 'right',
  },

  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerNote: {
    fontSize: 8,
    color: '#aaa',
    textAlign: 'right',
  },
  signatureArea: {
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#555',
    width: 130,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#555',
    textAlign: 'center',
  },
});

// ===================== COMPONENT =====================
export const PrescriptionTemplate = ({ patient, doctor, visit, items }: Props) => {
  const age = calculateAge(patient.dateOfBirth);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── الهيدر ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.clinicName}>وصفة طبية</Text>
            <Text style={styles.clinicSub}>نظام إدارة العيادة</Text>z
          </View>
          <View style={styles.headerLeft}>
            <Text style={styles.prescriptionNo}>
              رقم الزيارة: {visit.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text style={styles.dateText}>
              التاريخ: {formatDate(visit.date)}
            </Text>
          </View>
        </View>

        {/* ── بيانات المريض والطبيب ── */}
        <View style={styles.infoBox}>

          {/* المريض */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>بيانات المريض</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>{patient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>العمر:</Text>
              <Text style={styles.infoValue}>{age} سنة</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تاريخ الميلاد:</Text>
              <Text style={styles.infoValue}>{formatDate(patient.dateOfBirth)}</Text>
            </View>
          </View>

          {/* الطبيب */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>بيانات الطبيب</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>د. {doctor.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>التخصص:</Text>
              <Text style={styles.infoValue}>{doctor.specialty}</Text>
            </View>
          </View>

        </View>

        {/* ── التشخيص والملاحظات ── */}
        <View style={styles.diagnosisBox}>
          <Text style={styles.diagnosisTitle}>التشخيص</Text>
          <Text style={styles.diagnosisText}>{visit.diagnosis}</Text>
          {visit.notes && (
            <Text style={styles.notesText}>ملاحظات: {visit.notes}</Text>
          )}
        </View>

        {/* ── الأدوية الموصوفة ── */}
        <Text style={styles.rxTitle}>
          ℞ الأدوية الموصوفة ({items.length})
        </Text>

        {items.map((item, index) => (
          <View key={item.id} style={styles.medicationCard}>
            <Text style={styles.medicationName}>
              {index + 1}. {item.medicationName}
            </Text>

            <View style={styles.medicationRow}>
              <Text style={styles.medicationLabel}>الجرعة:</Text>
              <Text style={styles.medicationValue}>{item.dosage}</Text>
            </View>

            <View style={styles.medicationRow}>
              <Text style={styles.medicationLabel}>التكرار:</Text>
              <Text style={styles.medicationValue}>{item.frequency}</Text>
            </View>

            <View style={styles.medicationRow}>
              <Text style={styles.medicationLabel}>المدة:</Text>
              <Text style={styles.medicationValue}>{item.duration}</Text>
            </View>

            {item.instructions && (
              <View style={styles.instructionBox}>
                <Text style={styles.instructionText}>
                  تعليمات: {item.instructions}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* ── الفوتر ── */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            هذه الوصفة صالحة لمدة 30 يوماً من تاريخ الإصدار
          </Text>
          <View style={styles.signatureArea}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>د. {doctor.name}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};