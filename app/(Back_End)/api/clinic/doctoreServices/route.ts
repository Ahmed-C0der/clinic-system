import { NextRequest } from 'next/server';
import { Clinic } from '@/app/(Back_End)/controllers/clinic.controller';

export async function GET(req:NextRequest){
    return Clinic.GetDoctorServices(req);
}
export async function POST(req:NextRequest){
    return Clinic.PostDoctorServices(req);
}
export async function PUT(req:NextRequest){
    return Clinic.PutDoctorServices(req);
}
export async function DELETE(req:NextRequest){
    return Clinic.DeleteDoctorServices(req);
}