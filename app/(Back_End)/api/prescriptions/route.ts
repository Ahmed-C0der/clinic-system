import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";
/**
 * @openapi
 * /api/prescriptions:
 *   get:
 *     description: Gets the prescriptions
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     prescriptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           visitId:
 *                             type: string
 *                           notes:
 *                             type: string
 *                             nullable: true
 *                           deletedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 prescriptionId:
 *                                   type: string
 *                                 medicineName:
 *                                   type: string
 *                                 dosage:
 *                                   type: string
 *                                   nullable: true
 *                                 frequency:
 *                                   type: string
 *                                   nullable: true
 *                                 duration:
 *                                   type: string
 *                                   nullable: true
 *                                 instructions:
 *                                   type: string
 *                                   nullable: true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         total:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 */
export async function GET(request: NextRequest) {
    return PrescriptionService.list(request);
}
/**
 * @openapi
 * /api/prescriptions:
 *  post:
 *   description: creates a new prescription
 *   requestBody:
 *    required: true
 *    content:
 *     application/json:
 *      schema:
 *        type: object
 *        properties:
 *          patient_id:
 *            type: string
 *          doctor_id:
 *            type: string
 *          visit_id:
 *            type: string
 *          items:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                medicine_name:
 *                  type: string
 *                dosage:
 *                  type: string
 *                frequency:
 *                  type: string
 *                duration:
 *                  type: string
 *                instructions:
 *                  type: string
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
 *            data:
 *              $ref: '#/components/schemas/Prescription'
 */
export async function POST(request: NextRequest) {
    return PrescriptionService.create(request);
}