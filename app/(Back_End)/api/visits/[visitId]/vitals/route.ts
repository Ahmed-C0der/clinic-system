import { NextRequest } from 'next/server';
import { visitsController } from '@/app/(Back_End)/controllers/visits.controller';

/**
 * @swagger
 * /api/v2/visits/{visitId}/vitals:
 *   patch:
 *     summary: Update vitals
 *     description: Update visit vitals (weight, height, blood pressure, temperature). Can be updated by receptionists and doctors.
 *     tags:
 *       - Visits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visitId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the visit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weightKg:
 *                 type: number
 *               heightCm:
 *                 type: number
 *               bloodPressure:
 *                 type: string
 *               temperatureC:
 *                 type: number
 *               chiefComplaint:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vitals updated successfully
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ visitId: string }> }) {
    const { visitId } = await params;
    return visitsController.patchVital(request, visitId);
}
