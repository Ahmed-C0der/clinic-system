import { NextRequest } from 'next/server';
import { PatientsController } from '../../../controllers/patients.controller';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.get(req, resolvedParams);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.update(req, resolvedParams);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.delete(req, resolvedParams);
}
