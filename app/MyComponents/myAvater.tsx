import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import Image from 'next/image'
import React from 'react'
type Props = {
  src?: string
  fallback?: string
}
export default function MyAvater({ src, fallback }: Props) {
  return (<>
    {
      src ? <Dialog>
        <DialogTrigger>

        </DialogTrigger>
        <DialogContent>
          <DialogHeader>

            <Image src={src || undefined} alt={fallback || "your photo"} width={100} height={100} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
        : <Avatar>
          <AvatarImage src={src} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>


    }



  </>
  )
}
