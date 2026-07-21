"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Table2, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/analytics", label: "تحليلات", icon: BarChart3 },
  { href: "/tables", label: "جداول", icon: Table2 },
  { href: "/settings", label: "الاعدادات", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      dir="rtl"
      className="w-[260px] shrink-0 bg-[#1a6b5a] text-white flex flex-col py-6"
    >
      <div className="px-5 pb-6">
        <h1 className="text-[18px] font-bold">لوحة التحكم</h1>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 h-12 px-3 rounded-[8px] text-[14px] font-medium transition-colors",
                isActive
                  ? "bg-white/[0.12] border-e-[3px] border-[#2dbfa0]"
                  : "hover:bg-white/[0.08]"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-4 border-t border-white/10">
        <Link
          href="/adminProfile"
          className={cn(
            "flex items-center gap-2 h-12 px-3 rounded-[8px] text-[14px] font-medium transition-colors",
            pathname?.startsWith("/admin/profile")
              ? "bg-white/[0.12] border-e-[3px] border-[#2dbfa0]"
              : "hover:bg-white/[0.08]"
          )}
        >
          <UserCircle className="h-5 w-5" />
          الملف الشخصي
        </Link>
      </div>
    </aside>
  );
}
