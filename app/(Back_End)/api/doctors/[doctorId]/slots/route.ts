import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/doctors/{doctorId}/slots:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: List available booking slots for a specific date
 *     description: >
 *       Computes all open time slots for the given doctor on a specific date.
 *       If no date is provided, defaults to today. If no duration is provided,
 *       uses the doctor's configured slot duration from the database.
 *       Returns an empty array if the doctor has no active schedule for that day.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-06-29"
 *         description: ISO date (YYYY-MM-DD) — defaults to today if omitted
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: integer
 *           maximum: 480
 *         description: Slot length in minutes — defaults to doctor's slotDuration from DB if omitted
 *     responses:
 *       200:
 *         description: Array of available slots (empty if doctor has no schedule that day)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *       403:
 *         description: Forbidden — role not allowed
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
 */export async function GET(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
    const query = req.nextUrl.searchParams;
    const {doctorId} = await params
    return Doctor.getSlots(req,doctorId, {
        date: query.get("date"),
        duration: query.get("duration"),
    });
   
}
