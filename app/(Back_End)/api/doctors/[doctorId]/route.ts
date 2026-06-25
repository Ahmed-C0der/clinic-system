import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/v2/doctors/{id}:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get a single doctor's profile
 *     description: Returns the full profile of an active, non-deleted doctor by their UUID.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *     responses:
 *       200:
 *         description: Doctor profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Doctor not found"
 */
export async function GET(req:NextRequest,{ params }: { params: Promise<{doctorId : string}> }) {
    return Doctor.getById(req,(await params).doctorId)
}

/**
 * @swagger
 * /api/v2/doctors/{id}:
 *   put:
 *     tags:
 *       - Doctors
 *     summary: Update doctor profile
 *     description: >
 *       Partially updates a doctor's profile. At least one field must be provided.
 *       User-level fields (name, phone, isActive) and doctor-level fields (specialty,
 *       licenseNumber, bio, consultationFee) are updated in a single atomic transaction.
 *       Roles allowed: admin (any doctor) or doctor (own profile only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 150
 *                 description: Doctor's display name
 *               phone:
 *                 type: string
 *                 maxLength: 30
 *                 description: Contact phone number
 *               isActive:
 *                 type: boolean
 *                 description: Activate or deactivate the doctor's account
 *               licenseNumber:
 *                 type: string
 *                 maxLength: 100
 *                 description: Medical license number
 *               specialty:
 *                 type: string
 *                 maxLength: 100
 *                 description: Doctor's specialty
 *               bio:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Short biography
 *               consultationFee:
 *                 type: number
 *                 description: Consultation fee amount
 *     responses:
 *       200:
 *         description: Updated doctor profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Validation error or no fields provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No fields provided to update"
 *       401:
 *         description: Missing or invalid Bearer token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Insufficient role (not admin and not own profile)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Doctor not found"
 */
export async function PATCH(req: NextRequest , { params }: { params: Promise<{doctorId : string}> }) {
    const body = await req.json()
    return Doctor.update(req, (await params).doctorId, body)
}
