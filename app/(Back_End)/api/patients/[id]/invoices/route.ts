import { NextRequest } from 'next/server';
// import { PatientsController } from '@/app/api/v2/controllers/patients.controller';
import { PatientsController } from "@/app/(Back_End)/controllers/patients.controller"
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.listInvoices(req, resolvedParams);
}
