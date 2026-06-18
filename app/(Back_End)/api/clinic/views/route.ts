import { Clinic } from "@/app/(Back_End)/controllers/clinic.controller";
import { NextRequest } from 'next/server';

export async function GET(req:NextRequest){
    return Clinic.GetTestimonials(req);
}
export async function POST(req:NextRequest){
    return Clinic.PostTestimonials(req);
}
export async function PUT(req:NextRequest){
    return Clinic.ApproveTestimonials(req);
}