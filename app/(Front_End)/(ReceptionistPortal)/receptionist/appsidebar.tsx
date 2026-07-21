"use client"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar';
import { Calendar, Stethoscope, Users, Clock, Settings, ClipboardList, LogOut, ChartPie, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react'
import { useUserStore } from '../../sotres/userStore';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getImgProfile } from '../../actions/imgProfile';
import MyAvatar from '@/app/MyComponents/myAvater';
import { Role } from '@/lib/generated/prisma/enums';
import { Button } from '@/components/ui/button';

export default function MySideBar() {
    const pathname = usePathname();
    const myLinks = [
        // appointments , analysis , 

        {
            name: 'appointments',
            href: '/receptionist/appointments',
            icon: Calendar,
            isActive: pathname === "/receptionist/appointments",
        },
        {
            name: 'analysis',
            href: '/receptionist/analysis',
            icon: ChartPie,
            isActive: pathname === "/receptionist/analysis",

        },
        {
            name: "profile",
            href: "/receptionist/profile",
            icon: User,
            isActive: pathname === "/receptionist/profile",
        }

    ]
    const router = useRouter()
    const user = useUserStore(state => state.user)
    if (!user || user.role !== Role.receptionist) {
        toast.error("ليس لديك صلاحية الوصول إلى هذه الصفحة")
        // return router.push('/login')
    }

    const imgUrl = async () => {
        const imgUrl = await getImgProfile()
        return imgUrl.userImg as string || undefined
    }
    const [img, setImg] = useState<string | undefined>(undefined)
    useEffect(() => {
        imgUrl().then((img) => {
            setImg(img)
        })
    }, [])
    const onLogout = async (e: React.SubmitEvent) => {
        e.preventDefault();
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        if (res.ok) {
            router.push('/login');
        }
    }

    return (
        <Sidebar className="h-screen" dir='rtl' side='right' collapsible="icon">
            <SidebarHeader >
                <MyAvatar src={img as string || undefined} fallback={user?.name?.slice(0, 2) as string} className="w-20 h-20 border-2 border-[#2DBFA0]/30 shadow-md transition-transform duration-300 hover:scale-105" />
                <p className='font-bold text-primary '>{user?.name}</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="flex flex-col space-y-2">

                    {
                        myLinks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={item.isActive}
                                        className={`w-full font-sans text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${item.isActive
                                            ? "bg-[#2DBFA0]/20 text-white hover:bg-[#2DBFA0]/30"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <Link href={item.href} className="flex items-center w-full gap-2">
                                            {item.isActive && (
                                                <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#2DBFA0] rounded-l-full" />
                                            )}

                                            <Icon
                                                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.isActive ? "text-[#2DBFA0]" : "text-slate-400 group-hover:text-white"
                                                    }`}
                                            />
                                            <span className="font-cairo text-sm font-medium">{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })
                    }
                </SidebarMenu>

            </SidebarContent>
            <SidebarFooter className="border-t border-slate-50">
                {/* Footer / Log out */}
                <form onSubmit={onLogout} >
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full flex items-center justify-start gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 font-cairo text-sm font-semibold"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                    </Button>
                </form>
            </SidebarFooter>
        </Sidebar>
    )
}
