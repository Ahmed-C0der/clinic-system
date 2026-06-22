import { NextRequest } from 'next/server';
import { visitsController } from '../../../controllers/visits.controller';


/**
 * @swagger
 * /api/v2/visits/{visitId}:
 *   get:
 *     summary: Get visit details
 *     description: Retrieve detailed information about a specific visit.
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
 *     responses:
 *       200:
 *         description: Visit details
 *       404:
 *         description: Visit not found
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ visitId: string }> }) {
    const { visitId } = await params;
    return visitsController.getVisitDetail(request, visitId);
}

