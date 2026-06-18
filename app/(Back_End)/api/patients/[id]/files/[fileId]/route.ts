import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../../controllers/patients.controller';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const resolvedParams = await params;
  return PatientsController.deleteFile(req, resolvedParams);
}
