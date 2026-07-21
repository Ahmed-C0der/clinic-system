import React from 'react'
import MyNave from './myNave'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <MyNave />
             <div className='container mx-auto'>
            {children}
             </div>
        </div>
    )
}
