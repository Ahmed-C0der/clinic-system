import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';

export async function POST(req: NextRequest) {
  return AuthController.resetPassword(req);
}
