// Converts Western digits to Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩)
const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

export function formatNumberAr(value: number): string {
  // Adds thousands separators, then converts to Arabic-Indic digits
  const formatted = new Intl.NumberFormat("en-US").format(Math.round(value));
  return toArabicDigits(formatted);
}

export function formatCurrencyAr(value: number): string {
  return `${formatNumberAr(value)} ر.س`;
}

export function formatPercentAr(value: number, opts?: { signed?: boolean; decimals?: number }): string {
  const decimals = opts?.decimals ?? 1;
  const rounded = Number(value.toFixed(decimals));
  const sign = opts?.signed && rounded > 0 ? "+" : "";
  return `${sign}${toArabicDigits(rounded.toFixed(decimals))}%`;
}

export function formatChangeAr(current: number, previous: number): { change: string; up: boolean } {
  if (previous === 0) {
    // Avoid divide-by-zero: treat any positive current value as a full increase
    const up = current > 0;
    return { change: up ? "+١٠٠%" : "٠%", up };
  }
  const pct = ((current - previous) / previous) * 100;
  return { change: formatPercentAr(pct, { signed: true }), up: pct >= 0 };
}

// Arabic-Hijri-agnostic Gregorian day/month label, e.g. "١٧ يونيو"
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatShortDateAr(date: Date): string {
  return `${toArabicDigits(date.getDate())} ${AR_MONTHS[date.getMonth()]}`;
}
