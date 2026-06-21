import { NextRequest } from 'next/server';
import { AuthController } from '@/app/(Back_End)/controllers/auth.controller';
/**
 * @openapi
 * /api/auth/me:
 *  get:
 *   description: gets the me
 *   responses:
 *     200:
 *      description: success
 *      content:
 *       application/json:
 *        schema:
 *          type: object
 *          properties:
 *            status:
 *              type: string
 *            user:
 *              type: object
 *              properties:
 *                id:
 *                  type: string
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                role:
 *                  type: string
 */
export async function GET(req:NextRequest){
    return AuthController.me(req);
}