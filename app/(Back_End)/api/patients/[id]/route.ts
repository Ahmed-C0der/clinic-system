import { NextRequest } from 'next/server';
import { PatientsController } from '../../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient profile by ID
 *     description: Retrieve detailed profile information for a specific patient. Patients can retrieve their own profile, while admins, doctors, and receptionists can retrieve any profile.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient profile.
 *     responses:
 *       200:
 *         description: Patient profile details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions to access this patient profile
 *       404:
 *         description: Patient not found
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.get(req, resolvedParams);
}

/**
 * @openapi
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient profile
 *     description: Update profile fields of an existing patient. Allowed roles: admin, receptionist, doctor, and the patient themselves (if linked to their user account).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient profile to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               bloodType:
 *                 type: string
 *               chronicDiseases:
 *                 type: string
 *               allergies:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions to update this patient profile
 *       404:
 *         description: Patient not found
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.update(req, resolvedParams);
}

/**
 * @openapi
 * /api/patients/{id}:
 *   delete:
 *     summary: Soft delete a patient profile
 *     description: Sets the `deletedAt` field on the patient profile. Only accessible by admin and receptionist roles.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the patient profile to delete.
 *     responses:
 *       200:
 *         description: Patient profile deleted successfully
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
 *                   example: Patient soft deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Patient not found
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return PatientsController.delete(req, resolvedParams);
}
