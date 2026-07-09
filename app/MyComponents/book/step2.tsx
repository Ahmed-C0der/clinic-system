import React from 'react'
import CalendarRtl from '../arabicCalender'
import BookinSummary from './bookingSummary'
import { Button } from '@/components/ui/button'

export default function step2({setStep,
step}) {
  return (
    <section>
        {/* booking summary with doctor img*/}
        <BookinSummary/>

        {/* Arabic Callender with availabe times */}
        <div>
            <CalendarRtl/>
            {/* available times */}
        </div>
         <Button onClick={()=>setStep(step + 1)}>
                الخطوة التالية
            </Button>
         <Button onClick={()=>setStep(step - 1)}>
             السابق
            </Button>
    </section>
  )
}
