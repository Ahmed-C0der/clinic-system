import { NextRequest } from 'next/server';
import { PatientsController } from '../../controllers/patients.controller';

/**
 * @openapi
 * /api/patients:
 *   get:
 *     summary: Retrieve a paginated list of patients
 *     description: Returns a list of patients. Only accessible by users with admin, doctor, or receptionist roles. Supports pagination and searching.
 *     parameters:
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching name, phone number, or patient code.
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, other]
 *         description: Filter patients by gender.
 *       - in: query
 *         name: blood_type
 *         schema:
 *           type: string
 *         description: Filter patients by blood type (e.g. A+, O-).
 *       - in: query
 *         name: created_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by registration date starting from (inclusive).
 *       - in: query
 *         name: created_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by registration date up to (inclusive).
 *     responses:
 *       200:
 *         description: A paginated list of patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patient'
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
export async function GET(req: NextRequest) {
  return PatientsController.list(req);
}

/**
 * @openapi
 * /api/patients:
 *   post:
 *     summary: Create a new patient profile
 *     description: Creates a new patient. The patient code is automatically generated. Only accessible by admin and receptionist.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user account to link to this patient profile (must be unique).
 *               name:
 *                 type: string
 *                 description: Full name of the patient.
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth (YYYY-MM-DD).
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Gender of the patient.
 *               phone:
 *                 type: string
 *                 description: Contact phone number.
 *               address:
 *                 type: string
 *                 description: Home address.
 *               bloodType:
 *                 type: string
 *                 description: Blood type (e.g., A+, B-, O+).
 *               chronicDiseases:
 *                 type: string
 *                 description: Details of any chronic diseases.
 *               allergies:
 *                 type: string
 *                 description: Details of any allergies.
 *     responses:
 *       201:
 *         description: Patient profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Patient'
 *       400:
 *         description: Bad Request - Missing name or user already linked
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions
 * 
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         patientCode:
 *           type: string
 *         name:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           nullable: true
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           nullable: true
 *         phone:
 *           type: string
 *           nullable: true
 *         address:
 *           type: string
 *           nullable: true
 *         bloodType:
 *           type: string
 *           nullable: true
 *         chronicDiseases:
 *           type: string
 *           nullable: true
 *         allergies:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *       required:
 *         - id
 *         - patientCode
 *         - name
 *     MedicalFile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patientId:
 *           type: string
 *           format: uuid
 *         visitId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         sourceType:
 *           type: string
 *           enum: [visit, onboarding, manual]
 *         fileType:
 *           type: string
 *           enum: [lab, xray, report, other]
 *         fileName:
 *           type: string
 *         fileUrl:
 *           type: string
 *         fileSizeBytes:
 *           type: integer
 *           nullable: true
 *         uploadedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - patientId
 *         - sourceType
 *         - fileType
 *         - fileName
 *         - fileUrl
 */
export async function POST(req: NextRequest) {
  return PatientsController.create(req);
}
