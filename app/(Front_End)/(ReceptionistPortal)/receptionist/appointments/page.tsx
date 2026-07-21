import { getAppointments } from "./actions"
import { AppointmentQueue } from "./appointment-queue"

export default async function ReceptionistAppointmentsPage() {
  const result = await getAppointments()
  const initialAppointments = result.success ? result.data : []

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            إدارة قائمة الانتظار
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            ابحث عن المريض بالكود لإضافته لقائمة الانتظار، وتابع المرضى
            المنتظرين النهاردة
          </p>
        </header>

        {!result.success && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {result.error}
          </div>
        )}

        <AppointmentQueue initialAppointments={initialAppointments} />
      </div>
    </div>
  )
}