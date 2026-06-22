import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients/{id}/visits:
 *   get:
 *     summary: List visits for a specific patient
 *     description: Retrieve a paginated list of medical visits for the specified patient. Patients can retrieve their own visits, while admins, doctors, and receptionists can retrieve visits for any patient.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items per page.
 *     responses:
 *       200:
 *         description: A paginated list of patient visits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       appointmentId:
 *                         type: string
 *                         format: uuid
 *                       chiefComplaint:
 *                         type: string
 *                         nullable: true
 *                       diagnosis:
 *                         type: string
 *                         nullable: true
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                       weightKg:
 *                         type: number
 *                         nullable: true
 *                       heightCm:
 *                         type: number
 *                         nullable: true
 *                       bloodPressure:
 *                         type: string
 *                         nullable: true
 *                       temperatureC:
 *                         type: number
 *                         nullable: true
 *                       visitDate:
 *                         type: string
 *                         format: date-time
 *                       appointment:
 *                         type: object
 *                         properties:
 *                           doctor:
 *                             type: object
 *                             properties:
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   specialty:
 *                                     type: string
 *                                     nullable: true
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const {patientId} = await params;
  return PatientsController.listVisits(req, patientId);
}
