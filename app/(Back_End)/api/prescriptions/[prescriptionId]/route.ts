import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";

/**
 * @openapi
 * /api/prescriptions/{id}:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: Get a prescription by ID
 *     description: >
 *       Retrieves a single prescription with its medication items. Accessible to
 *       admin, doctor, receptionist, and the owning patient.
 *     operationId: getPrescriptionById
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique identifier (UUID) of the prescription.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "a1b2c3d4-e5f6-7890-ab12-cd34ef567890"
 *     responses:
 *       200:
 *         description: Prescription retrieved successfully.
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
 *         description: Requested resource was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Resource not found."
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ prescriptionId: string } > }) {
    const { prescriptionId } = await params;
    return PrescriptionService.getById(req, prescriptionId, []);
}

/**
 * @openapi
 * /api/prescriptions/{id}:
 *   patch:
 *     tags:
 *       - Prescriptions
 *     summary: Update prescription notes
 *     description: >
 *       Updates the free-text notes field on a prescription. Accessible to admin,
 *       doctor, and receptionist roles.
 *     operationId: updatePrescriptionNotes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Unique identifier (UUID) of the prescription.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "a1b2c3d4-e5f6-7890-ab12-cd34ef567890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2000
 *                 example: "Patient advised to take medication after meals."
 *     responses:
 *       200:
 *         description: Prescription notes updated successfully.
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
 *         description: Requested resource was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Resource not found."
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ prescriptionId: string } > }) {
    const { prescriptionId } = await params;
    return PrescriptionService.updateNotes(req, prescriptionId, []);
}