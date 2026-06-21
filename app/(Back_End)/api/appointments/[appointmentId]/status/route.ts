
import { NextRequest } from "next/server";
import { AppointmentsController } from "@/app/(Back_End)/controllers/appointments.controller";



/**
 * @openapi
 * /api/appointments/{appointmentId}:
 *   put:
 *     summary: Update appointment status
 *     description: Updates the status of a specific appointment.
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, waiting, in_progress, done, cancelled, no_show]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Bad request (missing status)
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Appointment not found
 */
export async function PUT (req:NextRequest,{ params }: { params: Promise<{ appointmentId: string }> }){
    const {appointmentId} = await params
    return AppointmentsController.updateStatus(req , appointmentId)
}
