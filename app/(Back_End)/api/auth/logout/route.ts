import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     responses:
 *       200:
 *         description: success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
*/
export async function POST(req: NextRequest) {
  return AuthController.logout(req);
}
