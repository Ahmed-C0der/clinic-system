// "use client"
// import { getImgProfile } from '@/app/(Front_End)/actions/imgProfile'
// import React, { useEffect, useState } from 'react'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Card, CardContent, CardHeader } from '@/components/ui/card'
// import { CalendarCheck, Droplet, History } from 'lucide-react'
// import { Separator } from '@/components/ui/separator'
// import { Button } from '@/components/ui/button'
// import { Textarea } from '@/components/ui/textarea'
// import { Gender } from '@/lib/generated/prisma/enums'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { toast } from 'sonner'
// import { useRouter } from 'next/navigation'
// type Patient = {
//     name: string;
//     id: string;
//     createdAt: Date;
//     userId: string | null;
//     patientCode: string;
//     dateOfBirth: Date | null;
//     gender: Gender | null;
//     phone: string | null;
//     address: string | null;
//     bloodType: string | null;
//     chronicDiseases: string | null;
//     allergies: string | null;
//     deletedAt: Date | null;
// } 

// export default function PatientDetailClient({ patientData,appointmentId  , visits }: { patientData: Patient,appointmentId:string ,visits:any[]}) {
//     const calculateAge = (dateOfBirth: Date) => {
//         const today = new Date();
//         const birthDate = new Date(dateOfBirth);
//         const age = today.getFullYear() - birthDate.getFullYear();
//         const monthDiff = today.getMonth() - birthDate.getMonth();
//         if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//             return age - 1;
//         }
//         return age;
//     }
//     const [visitBody , setVisitBody] = useState<{
//         appointmentId:string
//         chiefComplaint:string
//         diagnosis:string
//         notes:string
//         weightKg:number|null
//         heightCm:number|null
//         temperatureC:number|null
//         bloodPressure:string|null
//         medicines:{
//             name:string
//             dosage:string
//             duration:string
//             frequency:string
//             prescription:File|null
//         }[]
//     }>({
//         appointmentId:appointmentId,
//         chiefComplaint:"",
//         diagnosis:"",
//         notes:"",
//         weightKg:null,
//         heightCm:null,
//         temperatureC:null,
//         bloodPressure:"",
//         medicines:[]
//     })
//     const [age,setAge] = useState<string|number>("غير معروف")
//     const router = useRouter()
//     // const age= calculateAge(patientData!.dateOfBirth)
//     useEffect(()=>{
//         if (patientData?.dateOfBirth) {
//             const calcAge= calculateAge(patientData?.dateOfBirth as Date)
//             setAge(calcAge)
//         }
//     },[patientData])
//     const onchangeHandler = (e:React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>)=>{
//         const {name , value} = e.target
//         setVisitBody(prev=>({
//             ...prev,
//             [name]:value
//         }))
//     }
//     const onSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
//         e.preventDefault()
//         // POST Visit
//         const res = await fetch(`/api/doctor/visit`,{
//             method:"POST",
//             headers:{
//                 "Content-Type":"application/json",
//                 "credentials": "include"
//             },
//             body:JSON.stringify({...visitBody,appointmentId})
//         })
//         const data = await res.json()
//         if (data.success) {
//             toast.success("تم حفظ الزيارة بنجاح")
//             router.push("/doctor-dashboard/appointments")
//         }else{
//             toast.error("فشل حفظ الزيارة")
//         }
//     }
//     const [patientImg, setPatientImg] = useState<string | null>(null);
//     useEffect(() => {
//         const fetchPatientImg = async () => {
//             const res = await getImgProfile();
//             if (res.success && res.userImg) {
//                 setPatientImg(res.userImg) 

//             }
//         }
//         fetchPatientImg()
//     }, [patientData])
//     return (
//         <main>
//             <header>
//                 <Card>
//                     <CardContent>
//                         <div className="state-1 flex items-center gap-4">
//                         <Avatar className="h-24 w-24">
//                         {patientImg &&<AvatarImage src={patientImg} /> }
//                         <AvatarFallback>{patientData?.user?.name?.slice(0, 2)}</AvatarFallback>
//                     </Avatar>
//                     <div className="info flex flex-col ">
//                         <h1 className="text-xl font-bold">{patientData?.user?.name}</h1>
//                         <div className="extra flex ">
//                             <p className="text-sm text-muted-foreground">{patientData?.patientCode}</p>
//                             <div className="text-sm text-muted-foreground">
//                                 <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
//                                     {patientData?.bloodType}
//                                 </span>
//                                 <Droplet className='text-red-500 w-6 h-6' />
//                             </div>
//                         </div>
//                     </div>
//                         </div>
//                         <div className="state-2">
//                             <Separator orientation="vertical" className='w-px'/>
//                             <div className="info flex flex-col">
//                                 <span>العمر</span>
//                                 <span>
//                                     {age} سنة
//                                 </span>
//                             </div>
//                             <div className="info flex flex-col">
//                             <span>الجنس</span>
//                             <span>
//                             {patientData?.gender}
//                             </span>
//                             </div>
//                         </div>
//                         <div className="action">
//                             {/* TODO: add modal to show patient prescriptions */}
//                             <Button>

//                                 <span>سجل الوصفات الطبية</span> <History/>
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//                 {/* Patient image and name and gender and phone */}
//             </header>
//             <div className="container">
//                 <section>
//                 <Card>
//                     <CardContent>
//                         {/* secondary info like , weight , height , allergies , chronic diseases , address , phone */}
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent>
//                         {/* الشكوي الرئيسية input: text */}
//                         <h1 >الشكوي الرئيسية</h1>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent>
//                         {/* التشخيص الطبي  */}
//                         <h1 >التشخيص الطبي</h1>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent>
//                         {/* doctor Notes , input:text */}
//                         <h1>ملاحظات الطبيب</h1>
//                     </CardContent>
//                 </Card>
//                 <Card>
//                     <CardContent>
//                         {/* الأدوية و الجرعات  , inputs , 4*inputs:Text + input:file*/}
//                         <h1>الأدوية و الجرعات</h1>
//                         <div className="flex gap-4">
//                             <input type="text" placeholder="اسم الدواء" />
//                             <input type="text" placeholder="الجرعة" />
//                             <input type="text" placeholder="المدة" />
//                             <input type="text" placeholder="عدد المرات" />
//                             <input type="file" />
//                         </div>
//                     </CardContent>
//                 </Card>
//                 <Button type="submit" onClick={onSubmit}>
//                     حفظ الزيارة
//                 </Button>
                

//                 </section>
//                 <section>
//                 {/* Patient Visits */}
//                 <h1>
//                     <CalendarCheck/>
//                     الزيارات السابقة
//                 </h1>
//                 <ScrollArea>
//                     {/* TODO: add pagination to take in default 4 then after click the button get all visits  */}
//                     {visits.map((visit) => (
//                         <Card key={visit.id}>
//                             <CardContent>
//                                 <p>تاريخ الزيارة: {visit.visitDate}</p>
//                                 <p>الشكوي الرئيسية: {visit.chiefComplaint}</p>
//                                 <p>ملاحظات الطبيب: {visit.notes}</p>
//                             </CardContent>
//                         </Card>
//                     ))}
//                 </ScrollArea>
//                 </section>
//             </div>
//         </main>
//     )
// }





"use client"
import { getImgProfile } from '@/app/(Front_End)/actions/imgProfile'
import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CalendarCheck, Droplet, History, Plus, Trash2, Loader2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Gender } from '@/lib/generated/prisma/enums'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { calculateAge } from '@/lib/additional'

type Patient = {
    name: string;
    id: string;
    createdAt: Date;
    userId: string | null;
    patientCode: string;
    dateOfBirth: Date | null;
    gender: Gender | null;
    phone: string | null;
    address: string | null;
    bloodType: string | null;
    chronicDiseases: string | null;
    allergies: string | null;
    deletedAt: Date | null;
}

type Medicine = {
    name: string
    dosage: string
    duration: string
    frequency: string
    prescription: File | null
}

type Visit = {
    id: string
    visitDate: string
    chiefComplaint: string
    notes: string
    [key: string]: any
}

const VISITS_PAGE_SIZE = 4

const emptyMedicine: Medicine = {
    name: "",
    dosage: "",
    duration: "",
    frequency: "",
    prescription: null,
}

export default function PatientDetailClient({ patientData, appointmentId, visits }: { patientData: Patient, appointmentId: string, visits: Visit[] }) {
    

    const [visitBody, setVisitBody] = useState<{
        appointmentId: string
        chiefComplaint: string
        diagnosis: string
        notes: string
        weightKg: number | null
        heightCm: number | null
        temperatureC: number | null
        bloodPressure: string | null
        medicines: Medicine[]
    }>({
        appointmentId: appointmentId,
        chiefComplaint: "",
        diagnosis: "",
        notes: "",
        weightKg: null,
        heightCm: null,
        temperatureC: null,
        bloodPressure: "",
        medicines: [],
    })

    const [age, setAge] = useState<string | number>("غير معروف")
    const [submitting, setSubmitting] = useState(false)
    const [visitsToShow, setVisitsToShow] = useState(VISITS_PAGE_SIZE)
    const router = useRouter()

    useEffect(() => {
        if (patientData?.dateOfBirth) {
            const calcAge = calculateAge(patientData.dateOfBirth as Date)
            setAge(calcAge)
        } else {
            setAge("غير معروف")
        }
    }, [patientData])

    // Generic handler for simple text/textarea fields
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setVisitBody(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    // Handler for numeric fields (weight, height, temperature) - keeps null when empty
    const onNumberChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setVisitBody(prev => ({
            ...prev,
            [name]: value === "" ? null : Number(value),
        }))
    }

    // ---- Medicines management ----
    const addMedicine = () => {
        setVisitBody(prev => ({
            ...prev,
            medicines: [...prev.medicines, { ...emptyMedicine }],
        }))
    }

    const removeMedicine = (index: number) => {
        setVisitBody(prev => ({
            ...prev,
            medicines: prev.medicines.filter((_, i) => i !== index),
        }))
    }

    const updateMedicineField = (index: number, field: keyof Omit<Medicine, "prescription">, value: string) => {
        setVisitBody(prev => ({
            ...prev,
            medicines: prev.medicines.map((med, i) =>
                i === index ? { ...med, [field]: value } : med
            ),
        }))
    }

    const updateMedicineFile = (index: number, file: File | null) => {
        setVisitBody(prev => ({
            ...prev,
            medicines: prev.medicines.map((med, i) =>
                i === index ? { ...med, prescription: file } : med
            ),
        }))
    }

    // ---- Validation ----
    const validate = (): string | null => {
        if (!visitBody.chiefComplaint.trim()) return "يرجى إدخال الشكوى الرئيسية"
        if (!visitBody.diagnosis.trim()) return "يرجى إدخال التشخيص الطبي"
        for (const [i, med] of visitBody.medicines.entries()) {
            if (!med.name.trim()) return `يرجى إدخال اسم الدواء رقم ${i + 1}`
        }
        return null
    }

    // ---- Submit ----
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const validationError = validate()
        if (validationError) {
            toast.error(validationError)
            return
        }

        setSubmitting(true)
        try {
            // Use FormData because medicines may include File objects (prescriptions)
            const formData = new FormData()
            formData.append("appointmentId", appointmentId)
            formData.append("chiefComplaint", visitBody.chiefComplaint)
            formData.append("diagnosis", visitBody.diagnosis)
            formData.append("notes", visitBody.notes)
            formData.append("weightKg", visitBody.weightKg === null ? "" : String(visitBody.weightKg))
            formData.append("heightCm", visitBody.heightCm === null ? "" : String(visitBody.heightCm))
            formData.append("temperatureC", visitBody.temperatureC === null ? "" : String(visitBody.temperatureC))
            formData.append("bloodPressure", visitBody.bloodPressure ?? "")

            // Send medicines metadata as JSON, files separately keyed by index
            const medicinesMeta = visitBody.medicines.map((med, i) => ({
                name: med.name,
                dosage: med.dosage,
                duration: med.duration,
                frequency: med.frequency,
                hasPrescription: !!med.prescription,
                prescriptionFieldName: med.prescription ? `medicine_prescription_${i}` : null,
            }))
            formData.append("medicines", JSON.stringify(medicinesMeta))

            visitBody.medicines.forEach((med, i) => {
                if (med.prescription) {
                    formData.append(`medicine_prescription_${i}`, med.prescription)
                }
            })

            const res = await fetch(`/api/doctor/visit`, {
                method: "POST",
                credentials: "include",
                body: formData,
            })
            const data = await res.json()

            if (res.ok && data.success) {
                toast.success("تم حفظ الزيارة بنجاح")
                router.push("/doctor-dashboard/appointments")
            } else {
                toast.error(data.message || "فشل حفظ الزيارة")
            }
        } catch (err) {
            console.error(err)
            toast.error("حدث خطأ أثناء حفظ الزيارة")
        } finally {
            setSubmitting(false)
        }
    }

    const [patientImg, setPatientImg] = useState<string | null>(null);
    useEffect(() => {
        const fetchPatientImg = async () => {
            const res = await getImgProfile();
            if (res.success && res.userImg) {
                setPatientImg(res.userImg)
            }
        }
        fetchPatientImg()
    }, [patientData])

    const genderLabel = useMemo(() => {
        if (!patientData?.gender) return "غير محدد"
        return patientData.gender === "male" ? "ذكر" : patientData.gender === "female" ? "أنثى" : String(patientData.gender)
    }, [patientData])

    const visibleVisits = visits.slice(0, visitsToShow)
    const hasMoreVisits = visitsToShow < visits.length

    return (
        <main>
            <header>
                <Card>
                    <CardContent>
                        <div className="state-1 flex items-center gap-4">
                            <Avatar className="h-24 w-24">
                                {patientImg && <AvatarImage src={patientImg} />}
                                <AvatarFallback>{patientData?.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="info flex flex-col ">
                                <h1 className="text-xl font-bold">{patientData?.name}</h1>
                                <div className="extra flex items-center gap-2">
                                    <p className="text-sm text-muted-foreground">{patientData?.patientCode}</p>
                                    {patientData?.bloodType && (
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                                                {patientData.bloodType}
                                            </span>
                                            <Droplet className='text-red-500 w-5 h-5' />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="state-2 flex items-center gap-6">
                            <Separator orientation="vertical" className='w-px h-10' />
                            <div className="info flex flex-col">
                                <span className="text-sm text-muted-foreground">العمر</span>
                                <span>{age} سنة</span>
                            </div>
                            <div className="info flex flex-col">
                                <span className="text-sm text-muted-foreground">الجنس</span>
                                <span>{genderLabel}</span>
                            </div>
                        </div>
                        <div className="action">
                            {/* TODO: add modal to show patient prescriptions */}
                            <Button type="button" variant="outline">
                                <span>سجل الوصفات الطبية</span> <History className="mr-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </header>

            <form onSubmit={onSubmit}>
                <div className="container flex flex-col md:flex-row gap-4">
                    <section className="flex-1 flex flex-col gap-4">

                        {/* Secondary info: weight, height, allergies, chronic diseases, address, phone */}
                        <Card>
                            <CardHeader>
                                <h1 className="font-bold">معلومات إضافية</h1>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input id="phone" value={patientData?.phone ?? "غير متوفر"} disabled />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="address">العنوان</Label>
                                    <Input id="address" value={patientData?.address ?? "غير متوفر"} disabled />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="allergies">الحساسية</Label>
                                    <Input id="allergies" value={patientData?.allergies ?? "لا يوجد"} disabled />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="chronicDiseases">الأمراض المزمنة</Label>
                                    <Input id="chronicDiseases" value={patientData?.chronicDiseases ?? "لا يوجد"} disabled />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="weightKg">الوزن (كجم)</Label>
                                    <Input
                                        id="weightKg"
                                        name="weightKg"
                                        type="number"
                                        step="0.1"
                                        value={visitBody.weightKg ?? ""}
                                        onChange={onNumberChangeHandler}
                                        placeholder="مثال: 70"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="heightCm">الطول (سم)</Label>
                                    <Input
                                        id="heightCm"
                                        name="heightCm"
                                        type="number"
                                        step="0.1"
                                        value={visitBody.heightCm ?? ""}
                                        onChange={onNumberChangeHandler}
                                        placeholder="مثال: 175"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="temperatureC">درجة الحرارة (°C)</Label>
                                    <Input
                                        id="temperatureC"
                                        name="temperatureC"
                                        type="number"
                                        step="0.1"
                                        value={visitBody.temperatureC ?? ""}
                                        onChange={onNumberChangeHandler}
                                        placeholder="مثال: 37"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="bloodPressure">ضغط الدم</Label>
                                    <Input
                                        id="bloodPressure"
                                        name="bloodPressure"
                                        type="text"
                                        value={visitBody.bloodPressure ?? ""}
                                        onChange={onChangeHandler}
                                        placeholder="مثال: 120/80"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* الشكوى الرئيسية */}
                        <Card>
                            <CardHeader>
                                <h1 className="font-bold">الشكوى الرئيسية</h1>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="chiefComplaint"
                                    value={visitBody.chiefComplaint}
                                    onChange={onChangeHandler}
                                    placeholder="اكتب الشكوى الرئيسية للمريض..."
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* التشخيص الطبي */}
                        <Card>
                            <CardHeader>
                                <h1 className="font-bold">التشخيص الطبي</h1>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="diagnosis"
                                    value={visitBody.diagnosis}
                                    onChange={onChangeHandler}
                                    placeholder="اكتب التشخيص الطبي..."
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* ملاحظات الطبيب */}
                        <Card>
                            <CardHeader>
                                <h1 className="font-bold">ملاحظات الطبيب</h1>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    name="notes"
                                    value={visitBody.notes}
                                    onChange={onChangeHandler}
                                    placeholder="ملاحظات إضافية..."
                                />
                            </CardContent>
                        </Card>

                        {/* الأدوية و الجرعات */}
                        <Card>
                            {/* TODO: add auplod files medicine prescription */}
                            <CardHeader className="flex flex-row items-center justify-between">
                                <h1 className="font-bold">الأدوية و الجرعات</h1>
                                <Button type="button" size="sm" onClick={addMedicine}>
                                    <Plus className="w-4 h-4 ml-1" /> إضافة دواء
                                </Button>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {visitBody.medicines.length === 0 && (
                                    <p className="text-sm text-muted-foreground">لم تتم إضافة أي أدوية بعد</p>
                                )}
                                {visitBody.medicines.map((med, index) => (
                                    <div key={index} className="flex flex-wrap items-center gap-3 border rounded-md p-3">
                                        <input
                                            type="text"
                                            placeholder="اسم الدواء"
                                            value={med.name}
                                            onChange={(e) => updateMedicineField(index, "name", e.target.value)}
                                            className="border rounded px-2 py-1 flex-1 min-w-[120px]"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="الجرعة"
                                            value={med.dosage}
                                            onChange={(e) => updateMedicineField(index, "dosage", e.target.value)}
                                            className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="المدة"
                                            value={med.duration}
                                            onChange={(e) => updateMedicineField(index, "duration", e.target.value)}
                                            className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                                        />
                                        <input
                                            type="text"
                                            placeholder="عدد المرات"
                                            value={med.frequency}
                                            onChange={(e) => updateMedicineField(index, "frequency", e.target.value)}
                                            className="border rounded px-2 py-1 flex-1 min-w-[100px]"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => updateMedicineFile(index, e.target.files?.[0] ?? null)}
                                            className="flex-1 min-w-[140px]"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeMedicine(index)}
                                            aria-label="حذف الدواء"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                "حفظ الزيارة"
                            )}
                        </Button>
                    </section>

                    <section className="flex-1 flex flex-col gap-2">
                        {/* Patient Visits */}
                        <h1 className="flex items-center gap-2 font-bold">
                            <CalendarCheck />
                            الزيارات السابقة
                        </h1>
                        <ScrollArea className="h-[500px] pl-2">
                            <div className="flex flex-col gap-3">
                                {visibleVisits.length === 0 && (
                                    <p className="text-sm text-muted-foreground">لا توجد زيارات سابقة</p>
                                )}
                                {visibleVisits.map((visit) => (
                                    <Card key={visit.id}>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">
                                                تاريخ الزيارة: {new Date(visit.visitDate).toLocaleDateString("ar-EG")}
                                            </p>
                                            <p><span className="font-semibold">الشكوى الرئيسية:</span> {visit.chiefComplaint}</p>
                                            <p><span className="font-semibold">ملاحظات الطبيب:</span> {visit.notes}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                        {hasMoreVisits && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setVisitsToShow(prev => prev + VISITS_PAGE_SIZE)}
                            >
                                عرض المزيد
                            </Button>
                        )}
                    </section>
                </div>
            </form>
        </main>
    )
}
