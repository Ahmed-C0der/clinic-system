import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     description: Changes the password of the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: true
 *                 message: "Password changed successfully"
 */
export async function POST(req: NextRequest) {
  return AuthController.changePassword(req);
}
