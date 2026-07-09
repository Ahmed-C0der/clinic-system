'use client'
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useState, useEffect, useActionState, } from 'react'
import Link from 'next/link';
import { Decimal } from '@prisma/client/runtime/client';
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Loading from '../Loding';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from 'next/image';
import { DatePickerRtl } from '../datePicker';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Gender } from '@/lib/generated/prisma/enums';

export interface PaginatedDoctorsResponse {
  success: boolean;
  data: {
    specialty: string | null;
    user: {
      name: string;
      id: string;
      gender: Gender | null;
      profileImg: string | null;
    };
    id: string;
    bio: string | null;
    consultationFee: Decimal | null;
    slotDuration: number;
  }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type DoctorEntry = PaginatedDoctorsResponse['data'][number];

export default function SelectDoctor() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [date, setDate] = useState<Date>(searchParams.get("available") ? new Date(searchParams.get("available") as string) : new Date());
  const [doctors, setDoctors] = useState<DoctorEntry[]>([])
  const [speciality, setSpeciality] = useState<string[]>(searchParams.get("specialty") ? [searchParams.get("specialty") as string] : ["أمراض القلب والأوعية الدموية", "الأمراض الجلدية والتجميل", "الطب العام والأسري"])
  const [isLoading, setIsloading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, action, isPending] = useActionState(getFilterdDoctore, null)


  async function getFilterdDoctore(previousState: unknown, formData: FormData) {
    const doctorName = formData.get("doctorName") as string
    const specialty = formData.get("specialty") as string
    const date = formData.get("date") as string
    const query = new URLSearchParams(searchParams)

    try {
      if (doctorName.trim() !== "") { query.set("name", doctorName) } else { query.delete("name") }
      if (specialty.trim() !== "") { query.set("specialty", specialty) } else { query.delete("specialty") }
      if (date) { query.set("available", date) } else { query.delete("available") }
      router.replace(`${pathname}?${query.toString()}`)
      const res = await fetch(`/api/doctors?${query.toString()}`)
      if (!res.ok) return console.log("Unexpected Error , status code : " + res.status)
      const body: PaginatedDoctorsResponse = await res.json()
      if (!body.success) { setDoctors([]); return setError("UnExpected Error ; try later") }
      setDoctors(body.data)
      return { message: "Success", doctors: body.data, speciality: body.data.map((doctor: DoctorEntry) => doctor.specialty || "") }
    } catch (error) {
      setError(error instanceof Error ? error.message : "UnExpected Error")

    }
  }
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`/api/doctors`)
        if (!res.ok) return console.log("Unexpected Error , status code : " + res.status)
        const body: PaginatedDoctorsResponse = await res.json()
        if (!body.success) { setDoctors([]); return setError("UnExpected Error ; try later") }
        setDoctors(body.data)
        setSpeciality(body.data.map((doctor: DoctorEntry) => doctor.specialty || ""))
      } catch (error) {
        setError(error instanceof Error ? error.message : "UnExpected Error")
      }
      finally {
        setIsloading(false)
      }
    }

    fetchDoctors()
  }, [])
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-10 lg:mb-12">
          <div className="text-right">
            <h1 className="font-heading text-[28px] font-bold leading-[1.3] text-on-surface lg:text-[32px]">
              ابحث عن طبيب
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface/60 lg:mt-4">
              اكتشف أفضل الكفاءات الطبية في عيادة النخبة. نحن نوفر لك نخبة من الاستشاريين والأخصائيين في كافة التخصصات الطبية لضمان رعاية صحية متكاملة تليق بك.
            </p>
          </div>
          <form action={action} className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm lg:mt-10 lg:p-8">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fieldgroup-name">اسم الطبيب</FieldLabel>
                <Input id="fieldgroup-name" name="doctorName" placeholder="ايهاب محمد " className="h-11" />
              </Field>
              <Field>
                <FieldLabel htmlFor="fieldgroup-email">التخصص</FieldLabel>
                <Select defaultValue={searchParams.get("specialty") || "all"} name="specialty">
                  <SelectTrigger className="w-full h-11">
                    <SelectValue placeholder="Select a specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الخدمات</SelectItem>
                    {speciality.map((specialty: string, index: number) => (
                      <SelectItem key={index} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal">
                <DatePickerRtl date={date} setDate={setDate} />
                <div className="flex gap-3">
                  {/* <Button type="reset" variant="outline" className="rounded-lg">
                    إعادة تعيين
                  </Button> */}
                  <Button type="submit" className="rounded-lg">
                    بحث
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? <Loading />
            : error ? <p className="text-right text-on-surface/60">{error instanceof Error ? error.message : error}</p>
              : doctors.length == 0 ? <p className="text-right text-on-surface/60">لم يتم العثور على أطباء</p> :
                doctors.map((doctor: DoctorEntry) => (
                  <Card key={doctor.id} className="shadow-sm rounded-lg border-border bg-white">
                    <div className="relative mx-(--card-spacing) mt-(--card-spacing) aspect-[4/3] overflow-hidden rounded-lg">
                      <Image
                        src={doctor.user.profileImg || doctor.user.gender === Gender.female ? "/doctor_female.png" : "/doctor_male.png"}
                        alt={doctor.user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="text-right">
                      <p className="inline-block rounded-full bg-[rgba(45,191,160,0.15)] px-3 py-1 text-xs font-semibold text-[#1a6b5a]">
                        {doctor.specialty}
                      </p>
                      <h3 className="font-heading mt-3 text-lg font-semibold text-on-surface">
                        {doctor.user.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface/60">
                        {doctor.bio}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/doctors/${doctor.id}`} className="w-full">
                        <Button className="w-full rounded-lg">
                          اختر الطبيب
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
        </div>
      </div>
    </div>
  )
}
