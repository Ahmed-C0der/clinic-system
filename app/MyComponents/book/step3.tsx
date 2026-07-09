import React from 'react'
import BookinSummary from './bookingSummary'
import { Button } from '@/components/ui/button'

export default function Step3({setStep,
step}) {
  return (
    <>
    <section>
        {/* patient info Card */}


        {/* booking summary */}
        <BookinSummary/>

    </section>
     <Button onClick={()=>setStep(step + 1)}>
                الخطوة التالية
            </Button>
         <Button onClick={()=>setStep(step - 1)}>
             السابق
            </Button>
    </>
  )
}
