import { NextRequest, NextResponse } from 'next/server';
import { Clinic } from '@/app/(Back_End)/controllers/clinic.controller';

export async function GET(req: NextRequest) {
    return await Clinic.GetCommonQuestions(req);
}

export async function POST(req: NextRequest) {
    return await Clinic.CreateCommonQuestion(req);
}

export async function PUT(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    return await Clinic.UpdateCommonQuestion(req, id);
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    return await Clinic.DeleteCommonQuestion(req, id!);
}