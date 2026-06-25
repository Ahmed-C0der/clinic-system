import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";

/**
 * @openapi
 * /api/prescriptions/{id}/items/{itemId}:
 *   patch:
 *     tags:
 *       - Prescriptions
 *     summary: Update a medication item
 *     description: >
 *       Updates one or more fields of an existing medication item. At least one
 *       field must be provided. Accessible to admin, doctor, and receptionist roles.
 *     operationId: updatePrescriptionItem
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
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: Unique identifier (UUID) of the prescription medication item.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "f1e2d3c4-b5a6-7890-cd12-ab34ef567890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
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
 *       200:
 *         description: Medication item updated successfully.
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
 *         description: Validation error, or no fields provided for update.
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
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string; prescriptionId: string }> }) {
    const { itemId, prescriptionId } = await params;
    const body = await req.json();
    return PrescriptionService.updateItem(req, prescriptionId, itemId, body);
}

/**
 * @openapi
 * /api/prescriptions/{id}/items/{itemId}:
 *   delete:
 *     tags:
 *       - Prescriptions
 *     summary: Remove a medication item
 *     description: >
 *       Removes a medication item from a prescription. Cannot be used to remove
 *       the last remaining item; the prescription itself must be deleted instead.
 *       Accessible to admin, doctor, and receptionist roles.
 *     operationId: removePrescriptionItem
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
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: Unique identifier (UUID) of the prescription medication item.
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "f1e2d3c4-b5a6-7890-cd12-ab34ef567890"
 *     responses:
 *       200:
 *         description: Medication item removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Cannot remove the last item of a prescription. Delete the prescription instead.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Cannot remove the last item. Delete the prescription instead."
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string; prescriptionId: string }> }) {
    const { itemId, prescriptionId } = await params;
    return PrescriptionService.removeItem(req, prescriptionId, itemId);
}
