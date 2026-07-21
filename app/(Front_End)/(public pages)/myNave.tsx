"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Home, Users, Info, Mail, LogIn, UserPlus, Menu, X } from "lucide-react";

const MyNavLinks = [
  { title: "الرئيسية", href: "/", icon: Home },
  { title: "اطباؤنا", href: "/doctors", icon: Users },
  { title: "عن المركز", href: "/about", icon: Info },
  { title: "اتصل بنا", href: "/contact", icon: Mail },
  { title: "تسجيل الدخول", href: "/login", icon: LogIn },
  { title: "إنشاء حساب", href: "/register", icon: UserPlus },
];

export default function MyNave() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-card shadow-sm border-b border-border" dir="rtl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {MyNavLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink href={link.href} className={`${navigationMenuTriggerStyle()} flex items-center gap-2 text-[#1A6B5A]`}>
                      <link.icon className="h-4 w-4" />
                      {link.title}
                    </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="flex-shrink-0">
          <Image src="/logo.png" alt="logo" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border p-4 bg-background">
          <div className="flex flex-col gap-2">
            {MyNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}