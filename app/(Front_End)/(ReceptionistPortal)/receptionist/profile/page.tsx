import { redirect } from "next/navigation"
import { getCurrentUserProfile } from "./action"
import { ProfilePageClient } from "./profile-page-client"

export default async function ProfilePage() {
  const result = await getCurrentUserProfile()

  if (!result.success) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="mt-1 text-sm text-gray-500">
            عدّل بياناتك الشخصية وصورتك الشخصية من هنا
          </p>
        </header>

        <ProfilePageClient initialProfile={result.data} />
      </div>
    </div>
  )
}