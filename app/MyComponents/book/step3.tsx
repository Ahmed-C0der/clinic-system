// import React from 'react'
// import BookinSummary from './bookingSummary'
// import { Button } from '@/components/ui/button'

// export default function Step3({setStep,
// step}) {
//   return (
//     <>
//     <section>
//         {/* patient info Card */}


//         {/* booking summary */}
//         <BookinSummary/>

//     </section>
//      <Button onClick={()=>setStep(step + 1)}>
//                 الخطوة التالية
//             </Button>
//          <Button onClick={()=>setStep(step - 1)}>
//              السابق
//             </Button>
//     </>
//   )
// }

'use client'

import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export type AppointmentType = 'new' | 'follow_up'

interface Step3Props {
    notes: string
    onNotesChange: (notes: string) => void
    type: AppointmentType
    onTypeChange: (type: AppointmentType) => void
}

export default function Step3({ notes, onNotesChange, type, onTypeChange }: Step3Props) {
    return (
        <div className="space-y-6 text-right">
            <h3 className="text-lg font-semibold text-on-surface">تفاصيل الزيارة</h3>

            <FieldGroup>
                <Field>
                    <FieldLabel htmlFor="appointment-type">نوع الزيارة</FieldLabel>
                    <Select value={type} onValueChange={(v) => onTypeChange(v as AppointmentType)}>
                        <SelectTrigger id="appointment-type" className="w-full h-11">
                            <SelectValue placeholder="اختر نوع الزيارة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">زيارة جديدة</SelectItem>
                            <SelectItem value="follow_up">متابعة</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field>
                    <FieldLabel htmlFor="notes">ملاحظات (اختياري)</FieldLabel>
                    {/* Plain textarea styled to match the shadcn Input look, in case
                        '@/components/ui/textarea' isn't in this project — swap it in if it is. */}
                    <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        placeholder="أخبرنا بأي أعراض أو ملاحظات قبل الزيارة..."
                        rows={4}
                        className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                </Field>
            </FieldGroup>
        </div>
    )
}
