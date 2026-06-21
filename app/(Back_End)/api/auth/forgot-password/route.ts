import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     description: Sends a reset password link to the user's email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset password link sent successfully
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
  return AuthController.forgotPassword(req);
}
