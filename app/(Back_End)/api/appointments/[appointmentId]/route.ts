import { NextRequest } from "next/server";
import { AppointmentsController } from "@/app/(Back_End)/controllers/appointments.controller";

/**
 * @openapi
 * /api/appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment details
 *     description: Retrieve detailed information about a specific appointment.
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment.
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDetails'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Appointment not found
 */
export async function GET (req:NextRequest,{ params }: { params: Promise<{ appointmentId: string }> }){
    const {appointmentId} = await params
    return AppointmentsController.get(req , appointmentId)
}

/**
 * @openapi
 * /api/appointments/{appointmentId}:
 *   delete:
 *     summary: Cancel an appointment
 *     description: Cancels a specific appointment.
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the appointment to cancel.
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: Appointment not found
 */
export async function DELETE (req:NextRequest,{ params }: { params: Promise<{ appointmentId: string }> }){
    const {appointmentId} = await params
    return AppointmentsController.cancel(req , appointmentId)
}

export async function PUT (req:NextRequest,{ params }: { params: Promise<{ appointmentId: string }> }){
    const {appointmentId:id} = await params
    return AppointmentsController.update(req , id)
}