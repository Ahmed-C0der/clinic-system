import { NextRequest } from 'next/server';
import { PrescriptionService } from "@/app/(Back_End)/controllers/prescription.controller";

/**
 * @openapi
 * /api/prescriptions/{id}/pdf:
 *   get:
 *     tags:
 *       - Prescriptions
 *     summary: Export prescription as PDF
 *     description: >
 *       Generates a PDF document for the prescription and returns a hosted file URL.
 *       Accessible to admin, doctor, receptionist, and the owning patient.
 *     operationId: exportPrescriptionPdf
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
 *         description: PDF generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 fileUrl:
 *                   type: string
 *                   format: uri
 *                   example: "https://res.cloudinary.com/clinic/prescriptions/rx_123.pdf"
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
 *       500:
 *         description: PDF generation failed on the server.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ prescriptionId: string } > }) {
    const { prescriptionId } = await params;
    return PrescriptionService.generatePdf(req, prescriptionId);
}
