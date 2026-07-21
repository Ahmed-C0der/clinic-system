import { Prisma } from '@/lib/generated/prisma/client';
import { Gender, Role } from '@/lib/generated/prisma/enums';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PatientDetailClient from './patientDetailClient';
import { allPatientVisit } from '@/app/(Front_End)/actions/doctor';
import Loading from '@/app/MyComponents/Loding';

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: {
    doctor: {
      select: {
        specialty: true,
        user: {
          select: {
            name: true
          }
        }
      }
    },
    patient: true
  }
}>;
async function getAppointmentDetails(appointmentId: string) {
  // 1. Get the token
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) redirect("/login");

  // 2. Call the API
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/appointments/${appointmentId}`, {
    headers: {
      Cookie: `access_token=${token}`,
    },
  });
  console.log("res",res)
  if (!res.ok) return null;

  const data = await res.json();
  return data as AppointmentWithRelations | null;
}
export default async function PatientDetailPage({ params }: { params: Promise<{ appointmentId: string }> }) {
    const { appointmentId } = await params
    let loading = true;
    const appointment = await getAppointmentDetails(appointmentId);
    const dataVisits = await allPatientVisit(appointment?.patientId!)
    console.log(dataVisits)
    loading = false
  return(
    <>
        {loading ? (
            <div className="flex items-center justify-center">
                <Loading />
            </div>
        ) : (
          appointment ?  
            <PatientDetailClient patientData={appointment.patient} appointmentId={appointmentId} visits = {dataVisits.visits} />
          : <div> لم يتم العثور علي الموعد</div>  
        )}
    </>
  )
}


