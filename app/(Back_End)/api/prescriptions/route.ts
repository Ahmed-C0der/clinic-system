import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";
// TODO : test this api and all sub apis and there swagger ui 
/**
 * @openapi
 * /api/prescriptions:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: List prescriptions
 *     description: >
 *       Returns a paginated list of prescriptions including their medication items.
 *       Accessible to admin, doctor, and receptionist roles.
 *     operationId: listPrescriptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number to retrieve.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         example: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page.
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         example: 10
 *     responses:
 *       200:
 *         description: Paginated list of prescriptions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Prescription'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Missing or invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Unauthorized: missing or invalid token."
 *       403:
 *         description: Authenticated user does not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Forbidden: insufficient permissions."
 */
export async function GET(request: NextRequest) {
    return PrescriptionService.list(request);
}

/**
 * @openapi
 * /api/prescriptions:
 *   post:
 *     tags:
 *       - Prescriptions
 *     summary: Create a new prescription
 *     description: >
 *       Creates a new prescription linked to a clinic visit, including one or more
 *       medication items. Accessible to admin, doctor, and receptionist roles.
 *     operationId: createPrescription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitId
 *               - items
 *             properties:
 *               visitId:
 *                 type: string
 *                 format: uuid
 *                 example: "9876fedc-ba98-7654-3210-fedcba987654"
 *               notes:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Patient advised to take medication after meals."
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineName
 *                   properties:
 *                     medicineName:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 150
 *                       example: "Amoxicillin"
 *                     dosage:
 *                       type: string
 *                       maxLength: 50
 *                       example: "500mg"
 *                     frequency:
 *                       type: string
 *                       maxLength: 100
 *                       example: "Twice daily"
 *                     duration:
 *                       type: string
 *                       maxLength: 50
 *                       example: "7 days"
 *                     instructions:
 *                       type: string
 *                       maxLength: 2000
 *                       example: "Take after meals with a full glass of water."
 *     responses:
 *       201:
 *         description: Prescription created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Prescription'
 *       400:
 *         description: Validation error in request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Unauthorized: missing or invalid token."
 *       403:
 *         description: Authenticated user does not have permission to perform this action.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Forbidden: insufficient permissions."
 *       404:
 *         description: Referenced visit was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { notes , items} = body;
    let {visitId } = body
    if (!visitId){
        const searchParams = request.nextUrl.searchParams;
        visitId = searchParams.get("visit_id");
    }
    return PrescriptionService.create(request, {visitId , notes , items});
}