"use client"

import { useState, useTransition } from "react"
import {
  searchByPatientCode,
  type AppointmentWithPatient,
} from "./actions"

interface AppointmentQueueProps {
  initialAppointments: AppointmentWithPatient[]
}

export function AppointmentQueue({ initialAppointments }: AppointmentQueueProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [patientCode, setPatientCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!patientCode.trim()) {
      setError("من فضلك أدخل كود المريض")
      return
    }

    startTransition(async () => {
      const result = await searchByPatientCode(patientCode)

      if (!result.success) {
        setError(result.error)
        return
      }

      setAppointments((prev) => {
        const alreadyExists = prev.some((a) => a.id === result.data.id)
        return alreadyExists ? prev : [...prev, result.data]
      })
      setSuccessMsg(
        `تمت إضافة ${result.data.patient.name} إلى قائمة الانتظار`
      )
      setPatientCode("")
    })
  }

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex gap-2 rounded-lg bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          value={patientCode}
          onChange={(e) => setPatientCode(e.target.value)}
          placeholder="أدخل كود المريض"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "جارِ البحث..." : "بحث وإضافة للانتظار"}
        </button>
      </form>

      {/* Feedback messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Queue list */}
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="font-semibold text-gray-900">
            قائمة الانتظار النهاردة ({appointments.length})
          </h2>
        </div>

        {appointments.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-400">
            لا يوجد مرضى في قائمة الانتظار حالياً
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {appointment.patient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    كود: {appointment.patient.patientCode} &middot;{" "}
                    {new Date(appointment.scheduledAt).toLocaleTimeString(
                      "ar-EG",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  في الانتظار
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
