import { NextRequest } from 'next/server';
import { Clinic } from '@/app/(Back_End)/controllers/clinic.controller';

export async function GET(req:NextRequest){
    return Clinic.GettopServices(req);
}
export async function POST(req:NextRequest){
    return Clinic.PosttopServices(req);
}
export async function PUT(req:NextRequest){
    return Clinic.PuttopServices(req);
}
export async function DELETE(req:NextRequest){
    return Clinic.DeletetopServices(req);
}