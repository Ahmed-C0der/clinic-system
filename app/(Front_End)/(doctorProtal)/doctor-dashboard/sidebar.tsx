"use client"
import { getImgProfile } from "@/app/(Front_End)/actions/imgProfile"
import { useUserStore } from "@/app/(Front_End)/sotres/userStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { CalendarClock, CalendarDays, FolderHeart, LayoutDashboard, Link, Users } from "lucide-react"
import { usePathname } from "next/navigation"


export default function DoctorDashboardSidebar() {
    const { user } = useUserStore(state => state)
    const [profileImg, setProfileImg] = useState<string>("null")
    const pathname = usePathname();
    const navItem = [
        {
            title: "لوحتي",
            href: "/doctor-dashboard",
            icon: LayoutDashboard,
            isActive: pathname === "/doctor-dashboard/"
        },
        {
            title: "جدول اليوم",
            href: "/doctor-dashboard/dayScheduel",
            icon: CalendarDays,
            isActive: pathname === "/doctor-dashboard/dayScheduel"
        },
        {
            title: "المرضى",
            href: "/doctor-dashboard/patients",
            icon: Users,
            isActive: pathname === "/doctor-dashboard/patients"
        },
        {
            title: "المواعيد",
            href: "/doctor-dashboard/appointments",
            icon: CalendarClock,
            isActive: pathname === "/doctor-dashboard/appointments"
        },
        {
            title: "السجلات",
            href: "/doctor-dashboard/records",
            icon: FolderHeart,
            isActive: pathname === "/doctor-dashboard/records"
        }
    ]
    useEffect(() => {
        async function getProfileImg() {
            const res = await getImgProfile();
            if (res.success) {
                if (!res.userImg) {
                    setProfileImg(res.gender == "male" ? "/doctor_male.png" : "/doctor_female.png")
                } else {
                    setProfileImg(res.userImg)
                }
            }
        }
        getProfileImg()
    }, [user])
    return (
        <>
            <Sidebar side="right">
                <SidebarHeader className="flex items-center justify-center gap-2 py-6">
                    <Avatar className="h-12 w-12 ring-2 ring-sidebar-primary ring-offset-2 ring-offset-sidebar">
                        <AvatarImage src={profileImg} />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{user?.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {navItem.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={item.isActive}
                                            className="h-12"
                                        >
                                            <Link href={item.href} className="flex items-center w-full gap-2 relative">
                                                {item.isActive && (
                                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-sidebar-primary rounded-l-full" />
                                                )}
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    )
}
