import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react'
import MySideBar from './receptionist/appsidebar';

export default function ReceptionistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='w-full '>
    {/* TODO: SideBar */}
    <SidebarProvider>
        <MySideBar/>
    
    <SidebarTrigger />
    <main className='w-full'>
    {children}
    </main>
    </SidebarProvider>
    </div>;
}
