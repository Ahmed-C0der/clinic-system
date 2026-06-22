import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients/{id}/prescriptions:
 *   get:
 *     summary: List prescriptions for a specific patient
 *     description: Retrieve a paginated list of prescriptions written for the patient. Patients can retrieve their own prescriptions; admins, receptionists, and doctors can retrieve them for any patient.
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
 *         description: A paginated list of prescriptions
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
 *                       visitId:
 *                         type: string
 *                         format: uuid
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             prescriptionId:
 *                               type: string
 *                               format: uuid
 *                             medicineName:
 *                               type: string
 *                             dosage:
 *                               type: string
 *                               nullable: true
 *                             frequency:
 *                               type: string
 *                               nullable: true
 *                             duration:
 *                               type: string
 *                               nullable: true
 *                             instructions:
 *                               type: string
 *                               nullable: true
 *                       visit:
 *                         type: object
 *                         properties:
 *                           appointment:
 *                             type: object
 *                             properties:
 *                               doctor:
 *                                 type: object
 *                                 properties:
 *                                   user:
 *                                     type: object
 *                                     properties:
 *                                       name:
 *                                         type: string
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
  return PatientsController.listPrescriptions(req, patientId);
}
