"use client"

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react"
import {
  updateProfile,
  updateProfileImage,
  type UserProfile,
} from "./action"
import { ChangePasswordForm } from "./change-password-form"
import EditableAvatar from "@/app/MyComponents/editableAvatar"
// import { ChangePasswordForm } from "@/components/profile/change-password-form"

interface ProfilePageClientProps {
  initialProfile: UserProfile
}

type FormState = {
  name: string
  email: string
  phone: string
  gender: string
}

export function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [formData, setFormData] = useState<FormState>({
    name: initialProfile.name,
    email: initialProfile.email,
    phone: initialProfile.phone ?? "",
    gender: initialProfile.gender,
  })
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const result = await updateProfile(formData as any)
      if (!result.success) {
        setError(result.error)
        return
      }
      setProfile(result.data)
      setSuccessMsg("تم تحديث بياناتك بنجاح")
    })
  }

  /**
   * ⚠️ الدالة دي بتتنفذ بعد ما EditableAvatar يرفع الصورة الفعلية (S3 / Cloudinary / API route)
   * وترجع رابط الصورة الجديدة. عدّل اسم الـ prop (onUpload) لو مختلف في المكون عندك.
   */
  const handleImageUpload = async (newImageUrl: string) => {
    setImageError(null)
    setIsUploadingImage(true)
    const result = await updateProfileImage(newImageUrl)
    setIsUploadingImage(false)

    if (!result.success) {
      setImageError(result.error)
      return
    }

    setProfile((prev) => ({ ...prev, profileImg: result.data.profileImg }))
    setSuccessMsg("تم تحديث الصورة الشخصية")
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-sm">
        <EditableAvatar
          src={profile.profileImg ?? undefined}
          name={profile.name}
        
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      {imageError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{imageError}</div>
      )}

      {/* Profile fields */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">البيانات الشخصية</h3>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">الاسم</label>
          <input
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">رقم الهاتف</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={handleChange("phone")}
            placeholder="اختياري"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">النوع</label>
          <select
            value={formData.gender}
            onChange={handleChange("gender")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            disabled={isPending}
          >
            <option value="male">ذكر</option>
            <option value="female">أنثى</option>
          </select>
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
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "جارِ الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>

      <ChangePasswordForm />
    </div>
  )
}
