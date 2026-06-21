import { NextRequest } from 'next/server';
// import { PatientsController } from '@/app/api/v2/controllers/patients.controller';
import { PatientsController } from "@/app/(Back_End)/controllers/patients.controller"

/**
 * @openapi
 * /api/patients/{id}/invoices:
 *   get:
 *     summary: List invoices for a specific patient
 *     description: Retrieve a paginated list of invoices associated with the patient. Accessible by admin, receptionist, doctor, and the patient themselves.
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
 *         description: A paginated list of invoices
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
 *                       patientId:
 *                         type: string
 *                         format: uuid
 *                       doctorId:
 *                         type: string
 *                         format: uuid
 *                       invoiceNumber:
 *                         type: string
 *                       subtotal:
 *                         type: string
 *                       discount:
 *                         type: string
 *                       total:
 *                         type: string
 *                       paidAmount:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, partial, paid]
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
 *                             invoiceId:
 *                               type: string
 *                               format: uuid
 *                             description:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             unitPrice:
 *                               type: string
 *                             total:
 *                               type: string
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
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
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.listInvoices(req, resolvedParams);
}
