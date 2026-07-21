"use client"
import { getDoctorDaySchedule } from '@/app/(Front_End)/actions/doctor';
import { useEffect, useState } from 'react';
import ScheduelClient from './scheduelClient';
import { useParams } from 'next/navigation';
import { Appointment } from '@/lib/generated/prisma/client';
import { toast } from 'sonner';
import Loading from '@/app/MyComponents/Loding';

export default  function DaySchedulePage() {
  // const params = useParams()
  // const {appointmentId} = params;
  const now = new Date()
  const today = new Date(now.getFullYear(),now.getMonth(),now.getDate())
  const [date , setDate] = useState<Date|undefined>(today);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading , setLoading] = useState<boolean>(true)

  useEffect(() => {
    try {
      const fetchAppointments = async () => {
      const response = await getDoctorDaySchedule({date});
      if (response.success) {
        setAppointments(response.appointments);
      }
    }
    fetchAppointments();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
      }
      else{
        console.log(error)
      }
        toast.error("حدث خطأ , يرجى المحاولة مرة اخرى")

    }
    finally{
      setLoading(false)
    }
    
  }, [date]);
  return loading ? (
    <div className="flex items-center justify-center">
      <Loading />
    </div>
  ) : (
    
      <ScheduelClient appointments={appointments} date={date} setDate={setDate}/>

  )
}