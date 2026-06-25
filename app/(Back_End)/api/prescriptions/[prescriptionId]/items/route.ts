import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";

/**
 * @openapi
 * /api/prescriptions/{id}/items:
 *   post:
 *     tags:
 *       - Prescriptions
 *     summary: Add a medication item to a prescription
 *     description: >
 *       Adds a new medication item to an existing prescription. Accessible to
 *       admin, doctor, and receptionist roles.
 *     operationId: addPrescriptionItem
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
 *             required:
 *               - medicineName
 *             properties:
 *               medicineName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *                 example: "Amoxicillin"
 *               dosage:
 *                 type: string
 *                 maxLength: 50
 *                 example: "500mg"
 *               frequency:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Twice daily"
 *               duration:
 *                 type: string
 *                 maxLength: 50
 *                 example: "7 days"
 *               instructions:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "Take after meals with a full glass of water."
 *     responses:
 *       201:
 *         description: Medication item created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PrescriptionItem'
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
 *         description: Prescription not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ prescriptionId: string } > }) {
    const { prescriptionId } = await params;
    return PrescriptionService.addItem(req, prescriptionId, []);
}