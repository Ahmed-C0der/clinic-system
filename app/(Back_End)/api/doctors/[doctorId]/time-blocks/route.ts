import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/v2/doctors/{id}/time-blocks:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: List all time blocks for a doctor
 *     description: Returns all vacation / leave blocks for the doctor, ordered by startsAt ascending.
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
 *         description: Array of time blocks ordered by startsAt ascending
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeBlock'
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
export async function GET({ params }: { params: Promise<{ doctorId: string }> }) {
    return Doctor.listTimeBlocks((await params).doctorId);
}

/**
 * @swagger
 * /api/v2/doctors/{id}/time-blocks:
 *   post:
 *     tags:
 *       - Doctors
 *     summary: Add a time block (mark doctor unavailable for a period)
 *     description: >
 *       Creates a time block that marks the doctor as unavailable between startAt and endAt.
 *       Returns 409 if the new block overlaps any existing block.
 *       Roles allowed: admin or doctor.
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
 *             required:
 *               - startAt
 *               - endAt
 *             properties:
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-01T08:00:00Z"
 *                 description: Start of the unavailability period (ISO 8601)
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-08-07T18:00:00Z"
 *                 description: End of the unavailability period (ISO 8601) — must be after startAt
 *               reason:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Annual leave"
 *                 description: Optional reason for the block
 *     responses:
 *       201:
 *         description: Created time block
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeBlock'
 *       400:
 *         description: Validation error (e.g. endAt before startAt)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "endAt must be after startAt"
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
 *         description: Insufficient role
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
 *       409:
 *         description: Overlaps an existing time block
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Time block overlaps an existing one"
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
    const body = await req.json();
    return Doctor.addTimeBlock((await params).doctorId, body, req);
}

/**
 * @swagger
 * /api/v2/doctors/{id}/time-blocks/{blockId}:
 *   delete:
 *     tags:
 *       - Doctors
 *     summary: Remove a time block
 *     description: Permanently deletes a time block. The block must belong to the specified doctor. Roles allowed: admin or doctor.
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
 *       - in: path
 *         name: blockId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Time block UUID
 *     responses:
 *       200:
 *         description: Time block deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *         description: Insufficient role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: Doctor or time block not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Time block not found"
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
    return Doctor.removeTimeBlock((await params).doctorId, req);
}
