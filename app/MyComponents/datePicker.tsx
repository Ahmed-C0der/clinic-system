// "use client"

// import * as React from "react"
// import { format } from "date-fns"
// import { arSA, he } from "date-fns/locale"
// import { ChevronDownIcon } from "lucide-react"
// import {
//   arSA as arSADayPicker,
//   he as heDayPicker,
// } from "react-day-picker/locale"

// import {
//   useTranslation,
//   type Translations,
// } from "@/components/language-selector"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// const translations: Translations = {
//   en: {
//     dir: "ltr",
//     values: {
//       placeholder: "Pick a date",
//     },
//   },
//   ar: {
//     dir: "rtl",
//     values: {
//       placeholder: "اختر تاريخًا",
//     },
//   },
//   he: {
//     dir: "rtl",
//     values: {
//       placeholder: "בחר תאריך",
//     },
//   },
// }

// const dayPickerLocales = {
//   ar: arSADayPicker,
//   he: heDayPicker,
// } as const

// const dateFnsLocales = {
//   ar: arSA,
//   he: he,
// } as const

// export function DatePickerRtl({date,setDate}:{
//   date:Date,
//   setDate:React.Dispatch<React.SetStateAction<Date>>
// }) {
//   const { dir, t, language } = useTranslation(translations, "ar")
//   const dateFnsLocale =
//     dir === "rtl"
//       ? dateFnsLocales[language as keyof typeof dateFnsLocales]
//       : undefined
//   const dayPickerLocale =
//     dir === "rtl"
//       ? dayPickerLocales[language as keyof typeof dayPickerLocales]
//       : undefined

//   return (
//     <Popover>
//       <PopoverTrigger render={<Button variant={"outline"} data-empty={!date} className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground" dir={dir}>{date ? (
//           format(date, "PPP", { locale: dateFnsLocale })
//         ) : (
//           <span>{t.placeholder}</span>
//         )}<ChevronDownIcon data-icon="inline-end" /></Button>} />
//       <PopoverContent className="w-auto p-0" align="start" dir={dir}>
//         <Calendar
//           mode="single"
//           name="date"
//           selected={date}
//           onSelect={setDate}
//           defaultMonth={date}
//           dir={dir}
//           locale={dayPickerLocale}
//         />
//       </PopoverContent>
//     </Popover>
//   )
// }

"use client"

import * as React from "react"
import { format } from "date-fns"
import { arSA, he } from "date-fns/locale"
import { ChevronDownIcon } from "lucide-react"
import {
  arSA as arSADayPicker,
  he as heDayPicker,
} from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// نصوص الترجمة محلياً داخل الملف لتجنب خطأ استيراد الموديل المفقود
const translations = {
  en: { dir: "ltr", placeholder: "Pick a date" },
  ar: { dir: "rtl", placeholder: "اختر تاريخًا" },
  he: { dir: "rtl", placeholder: "בחר תאריך" },
} as const

const dayPickerLocales = {
  ar: arSADayPicker,
  he: heDayPicker,
} as const

const dateFnsLocales = {
  ar: arSA,
  he: he,
} as const

interface DatePickerRtlProps {
  date: Date | undefined
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
  language?: "ar" | "en" | "he"
  // disabled?: { dayOfWeek?: number[], before?: Date | boolean }
  disabled?: unknown[]
}

export function DatePickerRtl({ date, setDate, language = "ar", disabled }: DatePickerRtlProps) {
  const currentTranslation = translations[language]
  const dir = currentTranslation.dir
 const disableDate:any = []
 if (disabled){
  disableDate.push(...disabled)
 }
  const dateFnsLocale =
    language !== "en" ? dateFnsLocales[language as keyof typeof dateFnsLocales] : undefined
  
  const dayPickerLocale =
    language !== "en" ? dayPickerLocales[language as keyof typeof dayPickerLocales] : undefined

  return (
    <Popover>
      {/* حل مشكلة التابع render عبر استخدام asChild ووضع الـ Button كإبن مباشر */}
      <PopoverTrigger asChild>
        <Button 
          variant={"outline"} 
          className="w-[212px] justify-between text-left font-normal text-muted-foreground" 
          dir={dir}
        >
          {date ? (
            format(date, "PPP", { locale: dateFnsLocale })
          ) : (
            <span>{currentTranslation.placeholder}</span>
          )}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto p-0" align="start" dir={dir}>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={dayPickerLocale}
          disabled={disableDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}