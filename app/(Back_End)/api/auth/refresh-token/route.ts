import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';
/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     description: Refreshes the access token.
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function POST() {
  return AuthController.refreshToken();
}
