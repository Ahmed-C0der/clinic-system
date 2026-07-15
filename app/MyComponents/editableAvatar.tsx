import React, { useActionState } from 'react'
import { UploadImg } from '../(Front_End)/actions/imgProfile'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface EditableAvatarProps {
    name?: string;
    profileImg?: string;
}
export default function EditableAvatar({ name, profileImg }: EditableAvatarProps) {
      const [state , actionImg , isPendingImg]=useActionState(
        UploadImg,
        null
      )
  return (
    <div>

        <form action={actionImg}>

                <Field>
                  <FieldLabel htmlFor="picture">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  {profileImg || state?.userImg ? (
                    <AvatarImage src={ state?.userImg||profileImg} alt={name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-[#1A6B5A] text-white text-2xl font-bold font-cairo">
                    {name?.slice(0, 2) || "مر"}
                  </AvatarFallback>
                </Avatar>
                
                  </FieldLabel>
                  <Input name="image" id="picture" type="file" />
                  <FieldDescription>Select a picture to upload.</FieldDescription>
                </Field>
                <Button
                  type="submit"
                  disabled={isPendingImg}
                  className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-bold rounded-lg px-8 py-3 transition-transform duration-300 hover:scale-105"
                >
                  {isPendingImg ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span>حفظ التغييرات</span>
                  )}
                </Button>
                </form>

    </div>
  )
}
