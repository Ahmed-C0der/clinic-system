import { NextRequest } from 'next/server';
import { visitsController } from '@/app/(Back_End)/controllers/visits.controller';

/**
 * @swagger
 * /api/v2/visits/{visitId}/diagnosis:
 *   patch:
 *     summary: Update clinical notes and diagnosis
 *     description: Update visit diagnosis and clinical notes. Restricted to doctors.
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
 *               diagnosis:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Diagnosis updated successfully
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ visitId: string }> }) {
    const { visitId } = await params;
    return visitsController.patchDiagnosis(request, visitId);
}
