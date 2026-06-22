import { NextRequest } from 'next/server';
import { PatientsController } from '../../../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients/{id}/files:
 *   get:
 *     summary: List medical files for a patient
 *     description: Retrieve a paginated list of medical files (lab results, x-rays, reports, etc.) uploaded for the patient. Patients can retrieve their own files, while admins, receptionists, and doctors can retrieve them for any patient.
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
 *       - in: query
 *         name: file_type
 *         schema:
 *           type: string
 *           enum: [lab, xray, report, other]
 *         description: Filter by medical file type.
 *       - in: query
 *         name: visit_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by visit ID.
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by upload date starting from (inclusive).
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by upload date up to (inclusive).
 *     responses:
 *       200:
 *         description: A paginated list of medical files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicalFile'
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
  return PatientsController.listFiles(req, resolvedParams);
}

/**
 * @openapi
 * /api/patients/{id}/files:
 *   post:
 *     summary: Upload a medical file for a patient
 *     description: Upload a new medical file (multipart/form-data) associated with the patient. Restricted to admin, receptionist, and doctor roles. Max file size: 20MB.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - file_type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The medical file to upload (e.g. PDF, Image).
 *               file_type:
 *                 type: string
 *                 enum: [lab, xray, report, other]
 *                 description: The category/type of the medical file.
 *               visit_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional visit ID to associate with the file.
 *               source_type:
 *                 type: string
 *                 enum: [visit, onboarding, manual]
 *                 default: manual
 *                 description: The source origin of the file.
 *     responses:
 *       201:
 *         description: Medical file uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicalFile'
 *       400:
 *         description: Bad Request - Missing file/file_type or file size too large
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.uploadFile(req, resolvedParams);
}
