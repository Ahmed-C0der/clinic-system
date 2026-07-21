// src/app/pdf/InvoiceTemplate.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpcWmhzfH5lWWgcQyyYwpYLQ.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/cairo/v28/SLXfc1nY6HkvangtZmpQdkhzfH5lWWgcQyyYwpYLQ.ttf', fontWeight: 'bold' },
  ],
});

const s = StyleSheet.create({
  page:          { padding: 40, fontFamily: 'Cairo', fontSize: 12, color: '#2c3e50' },
  header:        { flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#1e8449', paddingBottom: 15, marginBottom: 20 },
  title:         { fontSize: 22, fontWeight: 'bold', color: '#1e8449', textAlign: 'right' },
  subtitle:      { fontSize: 9, color: '#888', marginTop: 4, textAlign: 'right' },
  metaText:      { fontSize: 10, color: '#555', textAlign: 'left', marginBottom: 3 },
  infoBox:       { flexDirection: 'row-reverse', gap: 12, marginBottom: 20 },
  infoCard:      { flex: 1, backgroundColor: '#eafaf1', borderRadius: 5, padding: 12 },
  infoCardTitle: { fontSize: 10, color: '#1e8449', fontWeight: 'bold', marginBottom: 8, textAlign: 'right' },
  infoRow:       { flexDirection: 'row-reverse', marginBottom: 5, gap: 6 },
  infoLabel:     { fontSize: 10, color: '#666', textAlign: 'right' },
  infoValue:     { fontSize: 10, fontWeight: 'bold', textAlign: 'right', flex: 1 },
  tableHeader:   { flexDirection: 'row-reverse', backgroundColor: '#1e8449', padding: 8, borderRadius: 4, marginBottom: 4 },
  tableHeaderTxt:{ color: 'white', fontWeight: 'bold', fontSize: 11, textAlign: 'right' },
  tableRow:      { flexDirection: 'row-reverse', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tableRowAlt:   { flexDirection: 'row-reverse', paddingVertical: 8, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  col1:          { flex: 3, textAlign: 'right' },
  col2:          { flex: 1, textAlign: 'center' },
  col3:          { flex: 1, textAlign: 'center' },
  col4:          { flex: 1, textAlign: 'left' },
  totalSection:  { marginTop: 15, alignItems: 'flex-start' },
  totalRow:      { flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 20, marginBottom: 6 },
  totalLabel:    { fontSize: 11, color: '#666', width: 100, textAlign: 'right' },
  totalValue:    { fontSize: 11, textAlign: 'left', width: 80 },
  grandTotalRow: { flexDirection: 'row-reverse', justifyContent: 'flex-start', gap: 20, borderTopWidth: 2, borderTopColor: '#1e8449', paddingTop: 8, marginTop: 4 },
  grandLabel:    { fontSize: 13, fontWeight: 'bold', color: '#1e8449', width: 100, textAlign: 'right' },
  grandValue:    { fontSize: 13, fontWeight: 'bold', color: '#1e8449', textAlign: 'left', width: 80 },
  statusBadge:   { padding: 6, borderRadius: 4, marginTop: 15, alignSelf: 'flex-end' },
  statusText:    { fontSize: 11, fontWeight: 'bold', textAlign: 'right' },
  footer:        { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10, textAlign: 'center' },
  footerText:    { fontSize: 8, color: '#aaa', textAlign: 'center' },
});

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTemplateProps = {
  invoiceNo:   string;
  date:        Date | string;
  patient:     { name: string; phone?: string | null };
  doctor:      { name: string; specialty: string };
  items:       InvoiceItem[];
  discount?:   number;
  tax?:        number;
  status:      'paid' | 'pending' | 'cancelled';
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

export const InvoiceTemplate = ({ invoiceNo, date, patient, doctor, items, discount = 0, tax = 0, status }: InvoiceTemplateProps) => {
  const subtotal   = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountAmt = (subtotal * discount) / 100;
  const taxAmt     = ((subtotal - discountAmt) * tax) / 100;
  const total      = subtotal - discountAmt + taxAmt;

  const statusConfig = {
    paid:      { bg: '#eafaf1', color: '#1e8449', label: '✓ مدفوع' },
    pending:   { bg: '#fef9e7', color: '#d4ac0d', label: '⏳ معلق' },
    cancelled: { bg: '#fdedec', color: '#c0392b', label: '✕ ملغي' },
  }[status];

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>فاتورة</Text>
            <Text style={s.subtitle}>نظام إدارة العيادة</Text>
          </View>
          <View>
            <Text style={s.metaText}>رقم الفاتورة: {invoiceNo}</Text>
            <Text style={s.metaText}>التاريخ: {fmtDate(date)}</Text>
          </View>
        </View>

        {/* Patient & Doctor */}
        <View style={s.infoBox}>
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>بيانات المريض</Text>
            {[['الاسم', patient.name], ...(patient.phone ? [['الهاتف', patient.phone]] : [])].map(([l, v]) => (
              <View key={l} style={s.infoRow}><Text style={s.infoLabel}>{l}:</Text><Text style={s.infoValue}>{v}</Text></View>
            ))}
          </View>
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>بيانات الطبيب</Text>
            {[['الاسم', `د. ${doctor.name}`], ['التخصص', doctor.specialty]].map(([l, v]) => (
              <View key={l} style={s.infoRow}><Text style={s.infoLabel}>{l}:</Text><Text style={s.infoValue}>{v}</Text></View>
            ))}
          </View>
        </View>

        {/* Table Header */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderTxt, s.col1]}>الخدمة / المنتج</Text>
          <Text style={[s.tableHeaderTxt, s.col2]}>الكمية</Text>
          <Text style={[s.tableHeaderTxt, s.col3]}>سعر الوحدة</Text>
          <Text style={[s.tableHeaderTxt, s.col4]}>الإجمالي</Text>
        </View>

        {/* Table Rows */}
        {items.map((item, i) => (
          <View key={item.id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={s.col1}>{item.description}</Text>
            <Text style={s.col2}>{item.quantity}</Text>
            <Text style={s.col3}>{item.unitPrice.toFixed(2)} ج.م</Text>
            <Text style={s.col4}>{(item.quantity * item.unitPrice).toFixed(2)} ج.م</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={s.totalSection}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>المجموع الفرعي:</Text>
            <Text style={s.totalValue}>{subtotal.toFixed(2)} ج.م</Text>
          </View>
          {discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>خصم ({discount}%):</Text>
              <Text style={s.totalValue}>- {discountAmt.toFixed(2)} ج.م</Text>
            </View>
          )}
          {tax > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>ضريبة ({tax}%):</Text>
              <Text style={s.totalValue}>{taxAmt.toFixed(2)} ج.م</Text>
            </View>
          )}
          <View style={s.grandTotalRow}>
            <Text style={s.grandLabel}>الإجمالي:</Text>
            <Text style={s.grandValue}>{total.toFixed(2)} ج.م</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[s.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[s.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>شكراً لثقتكم • جميع الأسعار بالجنيه المصري</Text>
        </View>

      </Page>
    </Document>
  );
};