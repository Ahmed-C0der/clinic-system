import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; 

interface UserStore {
    user: { id: string; email: string; name: string; role: string } | null;
    patientId: string | null;
    
    // الدوال (Actions) - مباشرة وليس داخل كائن
    setUser: (user: { id: string; email: string; name: string; role: string } | null) => void;
    setPatientId: (patientId: string | null) => void;
}

export const useUserStore = create<UserStore>()(
    devtools(
        (set) => ({
            user: null,
            patientId: null,
            
            // تعريف الدوال مباشرة
            setUser: (user) => set({ user }, false, 'user/setUser'),
            setPatientId: (patientId) => set({ patientId }, false, 'user/setPatientId'),
        }),
        { name: 'UserStore' }
    )
);   