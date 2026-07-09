"use client"

import * as React from "react"
import { arSA, he } from "react-day-picker/locale"

// import {
//   useTranslation,
//   type Translations,
// } from "@/components/language-selector"
import { Calendar } from "@/components/ui/calendar"

const translations: Translations = {
  en: {
    dir: "ltr",
    values: {},
  },
  ar: {
    dir: "rtl",
    values: {},
  },
  he: {
    dir: "rtl",
    values: {},
  },
}



export default function CalendarRtl() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border [--cell-size:--spacing(9)]"
      captionLayout="dropdown"
      dir={"rtl"}
      locale={
       arSA
      }
    />
  )
}
