// import { getOwnProfile } from "../_actions/profile";
// import { ProfileForm } from "../_components/profile/profile-form";
// import { PasswordForm } from "../_components/profile/password-form";

import EditableAvatar from "@/app/MyComponents/editableAvatar";
import { PasswordForm } from "../_components/profile/password-form";
import { ProfileForm } from "../_components/profile/profile-form";
import { getOwnProfile } from "./profile";

export default async function AdminProfilePage() {
  const profile = await getOwnProfile();
  console.log(profile);
  return (
    <div dir="rtl" className="flex flex-col gap-6 max-w-[720px]">
      <h1 className="text-[28px] font-bold text-[#1c1c1e]">الملف الشخصي</h1>

      <div className="rounded-[8px] border border-[#e0dce5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h2 className="text-[18px] font-semibold mb-4">البيانات الشخصية</h2>
       <EditableAvatar src={profile.profileImg as string| undefined} name={profile.name.slice(0, 2)}/>

        <ProfileForm profile={profile} />
      </div>

      <div className="rounded-[8px] border border-[#e0dce5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h2 className="text-[18px] font-semibold mb-4">كلمة المرور</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
