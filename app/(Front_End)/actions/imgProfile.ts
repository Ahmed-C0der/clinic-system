"use server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"
import { uploadMedicalFile } from "@/lib/cloudinary";
export async function UploadImg(preState:any,formData: FormData) {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get('access_token')?.value;
    
    if (!accessToken) {
        return {
            message: "Unauthorized: No session token found",
            userImg: null, 
            name: null,
            gender: null,
            success: false
        }
    }
    
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
        return {
            message: "Forbidden: Invalid user session",
            userImg: null, 
            name: null,
            gender: null,
            success: false
        }
    }
    const img=formData.get("image") as File
const arrayOfBuffer=await img.arrayBuffer()
const buffer=Buffer.from(arrayOfBuffer)
    const res = await uploadMedicalFile(buffer,"profileImg",payload.id.toString())
    if(res.secure_url){
        const result = await prisma.user.update({
            where: { id: payload.id },
            data: { profileImg: res.secure_url }
        })
        if(result){
            return {
                message: "Profile image uploaded successfully",
                userImg: result.profileImg, 
                name: result.name,
                gender: result.gender,
                success: true
            }
        }
    }
 
}
export async function getImgProfile() {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get('access_token')?.value;
    
    if (!accessToken) {
        return {
            message: "Unauthorized: No session token found",
            userImg: null, 
            name: null,
            gender: null,
            success: false
        }
    }
    
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
        return {
            message: "Forbidden: Invalid user session",
            userImg: null, 
            name: null,
            gender: null,
            success: false
        }
    }
    
    const userRole = payload.role

    switch (userRole) {
        case 'doctor': {
            const doctor = await prisma.doctor.findFirst({
                where: { userId: payload.id },
                include: {
                    user: {
                        select: {
                            name: true,
                            profileImg: true,
                            gender:true
                        }
                    }
                }
            });
            if (!doctor) {
                return {
                    message: "Doctor profile not found for this user",
                    userImg: null, 
                    name: null,
                    gender: null,
                    success: false
                }
            }
            return {
                userImg: doctor.user?.profileImg || null,
                name: doctor.user?.name || null,
                gender: doctor.user.gender,
                success: true
            }
        }
        case 'patient': {
            const patient = await prisma.patient.findFirst({
                where: { userId: payload.id },
                include: {
                    user: {
                        select: {
                            name: true,
                            profileImg: true,
                            gender:true
                        }
                    }
                }
            });
            if (!patient) {
                return {
                    message: "Patient profile not found for this user",
                    userImg: null, 
                    name: null,
                    gender: null,
                    success: false
                }
            }
            return {
                userImg: patient.user?.profileImg || null,
                name: patient.user?.name || null,
                gender: patient.gender,
                success: true
            }
        }
        case 'receptionist': {
            const receptionist = await prisma.user.findFirst({
                where: { id: payload.id },
                select: {
                    name: true,
                    profileImg: true,
                    gender:true
                }
            });
            if (!receptionist) {
                return {
                    message: "Receptionist profile not found for this user",
                    userImg: null, 
                    name: null,
                    gender: null,
                    success: false
                }
            }
            return {
                userImg: receptionist.profileImg || null,
                name: receptionist.name || null,
                gender: receptionist.gender,
                success: true
            }
        }
        default: {
            return {
                message: "Forbidden: Invalid user session",
                userImg: null, 
                name: null,
                gender: null,
                success: false
            }
        }
    }
}