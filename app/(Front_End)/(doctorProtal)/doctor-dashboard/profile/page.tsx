import { GetDoctorId } from '@/app/(Front_End)/actions/doctor'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileDoctorClient from './ProfileDoctorClient'

export default async function Profile() {
    let doctorId =await GetDoctorId()
    if(!doctorId){
        // return redirect("/login")
        console.log("no doctor ID ")
        return <div>No doctor ID</div>
    }
    let  doctor = await getDoctorProfile(doctorId)
    if(!doctor){
        // return redirect("/login")
        console.log("no doctor in DB for this ID")
        return <div>No doctor in DB</div>
    }
    async function getDoctorProfile(doctorId: string){
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        if(!accessToken){
            return null
        }
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL  || "http://localhost:3000"
        const res = await fetch(`${baseUrl}/api/doctors/${doctorId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "cookie": `access_token=${accessToken}`,
            },
        })
        if(!res.ok){
            console.log("response not OK", res)
            return null
        }
        const data = await res.json()
        if(data.success){
            console.log("doctor data", data)
            return data.data
        }
        return null
    } catch (error) {
        console.log(error instanceof Error ? error.message : error)
        throw new Error(error instanceof Error ? error.message : "An unknown error occurred")
    }
    }
  return (
    <ProfileDoctorClient doctor={doctor} />
  )
}
