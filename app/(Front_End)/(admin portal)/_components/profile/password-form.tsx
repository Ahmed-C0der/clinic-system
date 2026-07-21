"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { updateOwnPassword, type ProfileActionState } from "../../_actions/profile";
import { useActionState } from "react";

const initialState: ProfileActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="outline"
      className="rounded-[8px] border-[#1a6b5a] text-[#1a6b5a] h-10 px-4"
    >
      {pending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
      تغيير كلمة المرور
    </Button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(updateOwnPassword, initialState);

  return (
    <form
      action={formAction}
      dir="rtl"
      className="flex flex-col gap-4"
      // Clears password fields after a successful submit
      key={state.status === "success" ? "reset" : "form"}
    >
      <div>
        <Label htmlFor="currentPassword" className="text-[12px] font-medium">
          كلمة المرور الحالية
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          className="rounded-[8px] border-[#e0dce5] text-right mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="newPassword" className="text-[12px] font-medium">
            كلمة المرور الجديدة
          </Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="rounded-[8px] border-[#e0dce5] text-right mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword" className="text-[12px] font-medium">
            تأكيد كلمة المرور
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="rounded-[8px] border-[#e0dce5] text-right mt-1"
          />
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
