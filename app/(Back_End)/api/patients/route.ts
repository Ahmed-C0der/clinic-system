import { NextRequest } from 'next/server';
import { PatientsController } from '../../controllers/patients.controller';

export async function GET(req: NextRequest) {
  return PatientsController.list(req);
}

export async function POST(req: NextRequest) {
  return PatientsController.create(req);
}
