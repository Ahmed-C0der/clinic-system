import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/v2/doctors/{id}/slots:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: List available booking slots for a specific date
 *     description: >
 *       Computes all open time slots for the given doctor on a specific date.
 *       Slots are calculated from the doctor's weekly schedule, minus time blocks (vacation/leave)
 *       and already-booked appointments. Returns an empty array if the doctor has no active
 *       schedule entry for that day.
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Doctor UUID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         description: ISO date (YYYY-MM-DD) to retrieve slots for
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 30
 *           maximum: 480
 *         description: Desired slot length in minutes (max 480)
 *     responses:
 *       200:
 *         description: Array of available slots (empty if doctor has no schedule that day)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slot'
 *       400:
 *         description: Missing or invalid `date` query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "date is required"
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
export async function GET(req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
    const query = req.nextUrl.searchParams;
    return Doctor.getSlots((await params).doctorId, {
        date: query.get("date"),
        duration: query.get("duration"),
    });
}
