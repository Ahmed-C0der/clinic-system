import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients/{id}/files/{fileId}:
 *   delete:
 *     summary: Delete a patient's medical file
 *     description: Permanently delete the medical file record. Restricted to admin, receptionist, and doctor roles.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient.
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the medical file to delete.
 *     responses:
 *       200:
 *         description: Medical file deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: File not found
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const resolvedParams = await params;
  return PatientsController.deleteFile(req, resolvedParams);
}
