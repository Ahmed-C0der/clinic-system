export type DateRangeKey = "today" | "week" | "month" | "year" | "all";

export interface ResolvedRange {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  label: string;
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function toArabicDigits(input: string | number): string {
  const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/**
 * Resolves a UI date-range key into concrete start/end bounds, plus the
 * equivalent "previous period" bounds (used to compute the +/-% KPI deltas).
 */
export function resolveDateRange(key: DateRangeKey, now: Date = new Date()): ResolvedRange {
  const end = new Date(now);
  let start: Date;

  switch (key) {
    case "today": {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    }
    case "month": {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    }
    case "year": {
      start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      break;
    }
    case "all": {
      start = new Date("2000-01-01T00:00:00.000Z");
      break;
    }
  }

  const spanMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  const prevStart = new Date(start.getTime() - spanMs);

  const label =
    key === "all"
      ? "كل الوقت"
      : `${toArabicDigits(start.getDate())} ${AR_MONTHS[start.getMonth()]} — ${toArabicDigits(
          end.getDate()
        )} ${AR_MONTHS[end.getMonth()]}`;

  return { start, end, prevStart, prevEnd, label };
}
