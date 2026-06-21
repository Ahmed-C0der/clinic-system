import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';
/**
* @openapi
* /api/auth/reset-password:
*  post:
*    summary: Reset a user's password
*    description: This endpoint resets the password for a user after verifying a valid token.
*    parameters:
*      - name: token
*        in: query
*        required: true
*        description: The token sent to the user's email for password reset.
*        schema:
*          type: string
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            required:
*              - password
*            properties:
*              password:
*                type: string
*                format: password
*                description: The new password for the user.
*                minLength: 8
*                example: "StrongP@ssw0rd!"
*    responses:
*      '200':
*        description: Password reset successful
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                success:
*                  type: boolean
*                  example: true
*                message:
*                  type: string
*                  example: "Password reset successful"
*      '400':
*        description: Invalid request or expired/invalid token
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Invalid or expired token"
*      '500':
*        description: Internal server error
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                error:
*                  type: string
*                  example: "Internal Server Error"
*/
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const token = searchParams.get("token") as string;
  return AuthController.resetPassword(req,token);
}
