"use client"

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react"
import { changePassword } from "./action"


type FormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const initialState: FormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function ChangePasswordForm() {
  const [formData, setFormData] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setError("كلمة المرور الجديدة وتأكيدها غير متطابقين")
      return
    }

    startTransition(async () => {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccessMsg("تم تغيير كلمة المرور بنجاح")
      setFormData(initialState)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900">تغيير كلمة المرور</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          كلمة المرور الحالية
        </label>
        <input
          type="password"
          value={formData.currentPassword}
          onChange={handleChange("currentPassword")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={formData.newPassword}
          onChange={handleChange("newPassword")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          تأكيد كلمة المرور الجديدة
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange("confirmPassword")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          disabled={isPending}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {successMsg && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:opacity-50"
      >
        {isPending ? "جارِ الحفظ..." : "تغيير كلمة المرور"}
      </button>
    </form>
  )
}
