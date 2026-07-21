"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateOwnProfile, type AdminProfile, type ProfileActionState } from "../../_actions/profile";
import EditableAvatar from "@/app/MyComponents/editableAvatar";

const initialState: ProfileActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-[8px] bg-[#1a6b5a] hover:bg-[#155546] text-white h-10 px-4"
    >
      {pending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
      حفظ التغييرات
    </Button>
  );
}

export function ProfileForm({ profile }: { profile: AdminProfile }) {
  const [state, formAction] = useActionState(updateOwnProfile, initialState);

  return (
    <form action={formAction} dir="rtl" className="flex flex-col gap-5">
      {/* <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="profileImg" className="text-[12px] font-medium">
            رابط الصورة الشخصية
          </Label>
          <Input
            id="profileImg"
            name="profileImg"
            defaultValue={profile.profileImg ?? ""}
            placeholder="https://..."
            className="rounded-[8px] border-[#e0dce5] text-right mt-1"
          />
          <p className="text-[11px] text-[#9e9e9e] mt-1">
            الصق رابط صورة، أو اربط لاحقاً بخدمة رفع ملفات (S3 / Cloudinary).
          </p>
        </div>
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-[12px] font-medium">
            الاسم الكامل
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={profile.name}
            required
            className="rounded-[8px] border-[#e0dce5] text-right mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-[12px] font-medium">
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            defaultValue={profile.email}
            disabled
            className="rounded-[8px] border-[#e0dce5] text-right mt-1 bg-[#f4f1f7] text-[#9e9e9e]"
          />
          <p className="text-[11px] text-[#9e9e9e] mt-1">
            لتغيير البريد الإلكتروني تواصل مع الدعم التقني.
          </p>
        </div>

        <div>
          <Label htmlFor="phone" className="text-[12px] font-medium">
            الهاتف
          </Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="rounded-[8px] border-[#e0dce5] text-right mt-1"
          />
        </div>

        <div>
          <Label htmlFor="gender" className="text-[12px] font-medium">
            الجنس
          </Label>
          <Select name="gender" defaultValue={profile.gender}>
            <SelectTrigger className="rounded-[8px] border-[#e0dce5] text-right mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
              <SelectItem value="other">آخر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.status !== "idle" && (
        <p
          className={`text-[13px] font-medium ${
            state.status === "success" ? "text-[#1a6b5a]" : "text-[#c0392b]"
          }`}
        >
          {state.message}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
