import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog'
import Image from 'next/image'
import React from 'react'

type Props = {
  src?: string
  fallback?: string
  className?: string
}

export default function MyAvatar({ src, fallback, className }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <Avatar className={className}>
            <AvatarImage src={src} />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Profile Image</DialogTitle>
          <DialogDescription className="sr-only">
            Enlarged view of the user profile avatar.
          </DialogDescription>
          <div className="flex justify-center p-4">
            {src ? (
              <Image 
                src={src} 
                alt={fallback || "Avatar"} 
                width={400} 
                height={400} 
                className="rounded-full"
              />
            ) : (
              <Avatar className="h-40 w-40">
                <AvatarFallback className="text-4xl">{fallback}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}