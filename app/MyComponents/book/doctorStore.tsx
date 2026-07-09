import { create } from "zustand"
import { DoctorEntry } from "./selectDoctor"
import { Decimal } from "@prisma/client/runtime/client";
// Doctore Schema




interface DoctorService {
    id: string
    isActive: boolean
    doctorId: string
    serviceId: string
    price: Decimal,
    service: {
        name: string,
        id: string,
        description: string | null,
        durationMin: number,
    }
}


interface doctoreStore {
    doctore: {
        specialty: string | null;
        bio: string | null;
        consultationFee: Decimal | null;
        slotDuration: number;
        user: {
            name: string;
            id: string;
        };
        id: string;
    } | null,
    doctoreServices: DoctorService[],
    actions: {
        setDoctore: (doctore: DoctorEntry) => void
        setDoctoreServices: (services: DoctorService[]) => void
    }

}

export const doctoreStore = create<doctoreStore>(set => {
    return {
        // Heree Data
        doctore: null,
        doctoreServices: [],
        // Here action
        actions: {
            setDoctore(doctore: DoctorEntry) {
                set({ doctore })
            },
            setDoctoreServices(services: DoctorService[]) {
                set({ doctoreServices: services })
            },
        }
    }
})