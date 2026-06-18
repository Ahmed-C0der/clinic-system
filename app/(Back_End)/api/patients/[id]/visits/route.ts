import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../controllers/patients.controller';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.listVisits(req, resolvedParams);
}
