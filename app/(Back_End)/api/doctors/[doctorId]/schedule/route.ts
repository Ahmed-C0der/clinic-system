import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/v2/doctors/{id}/schedule:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: Get doctor's weekly schedule
 *     description: Returns all schedule day entries for the doctor, ordered by dayOfWeek ascending (0=Sun … 6=Sat).
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
 *         description: Array of schedule day objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DoctorScheduleDay'
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
export async function GET({ params }: { params: Promise<{doctorId : string}> }) {
    return Doctor.getSlots((await params).doctorId)
}

/**
 * @swagger
 * /api/v2/doctors/{id}/schedule:
 *   put:
 *     tags:
 *       - Doctors
 *     summary: Replace full weekly schedule
 *     description: >
 *       Wipes the doctor's existing schedule rows and rewrites them in a single atomic transaction.
 *       The response is the new schedule ordered by dayOfWeek.
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
 *               - days
 *             properties:
 *               days:
 *                 type: array
 *                 minItems: 1
 *                 description: At least one day entry; no duplicate dayOfWeek values allowed
 *                 items:
 *                   type: object
 *                   required:
 *                     - dayOfWeek
 *                     - startTime
 *                     - endTime
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       description: "Day of week: 0=Sunday, 1=Monday … 6=Saturday"
 *                     startTime:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}$'
 *                       example: "09:00"
 *                       description: Start of working hours (HH:mm)
 *                     endTime:
 *                       type: string
 *                       pattern: '^\d{2}:\d{2}$'
 *                       example: "17:00"
 *                       description: End of working hours (HH:mm)
 *                     isActive:
 *                       type: boolean
 *                       default: true
 *                       description: Whether this day is active
 *     responses:
 *       200:
 *         description: New schedule array ordered by dayOfWeek
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DoctorScheduleDay'
 *       400:
 *         description: Validation error or duplicate dayOfWeek entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Duplicate dayOfWeek entries in schedule payload"
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
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{doctorId : string}> }) {
    const body = await req.json()
    return Doctor.replaceSchedule(req, (await params).doctorId, body)
}

/**
 * @swagger
 * /api/v2/doctors/{id}/schedule/{dayId}:
 *   patch:
 *     tags:
 *       - Doctors
 *     summary: Update a single schedule day's hours or active status
 *     description: >
 *       Partially updates one schedule day entry. At least one field must be provided.
 *       If dayOfWeek is changed, it must not conflict with an existing entry for this doctor.
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
 *       - in: path
 *         name: dayId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Schedule day entry UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 description: "Day of week: 0=Sunday … 6=Saturday"
 *               startTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "08:30"
 *                 description: New start time (HH:mm)
 *               endTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "16:30"
 *                 description: New end time (HH:mm)
 *               isActive:
 *                 type: boolean
 *                 description: Enable or disable this schedule day
 *     responses:
 *       200:
 *         description: Updated schedule day
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DoctorScheduleDay'
 *       400:
 *         description: Validation error or conflicting dayOfWeek
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "dayOfWeek 3 already exists for this doctor"
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
 *         description: Doctor or schedule day not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Schedule day not found"
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{doctorId : string}> }) {
    const body = await req.json()
    return Doctor.updateSchedule(req, (await params).doctorId, body)
}
