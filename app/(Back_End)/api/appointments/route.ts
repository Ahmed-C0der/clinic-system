import { NextRequest } from "next/server";
import { AppointmentsController } from "@/app/(Back_End)/controllers/appointments.controller";
import {
  AppointmentStatus,
  AppointmentType,
} from "@/lib/generated/prisma/enums";
/**
 * @openapi
 * /api/appointments:
 *   get:
 *     description: Get user appointments with pagination.
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
 *     responses:
 *       200:
 *         description: A paginated list of appointments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       patientId:
 *                         type: string
 *                       doctorId:
 *                         type: string
 *                       serviceId:
 *                         type: string
 *                       scheduledAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       type:
 *                         type: string
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                       reminderSent:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       doctor:
 *                         type: object
 *                         properties:
 *                           specialty:
 *                             type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                       patient:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           patientCode:
 *                             type: string
 *                           phone:
 *                             type: string
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
 *         description: Unauthorized - Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Unauthorized: Invalid or expired token'
 *       403:
 *         description: Forbidden - Insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Forbidden: Insufficient permissions'
 */

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const doctorId = searchParams.get("doctorId") as string;
  const patientId = searchParams.get("patientId") as string;
  const status = searchParams.get("status") as AppointmentStatus;
  const date = searchParams.get("date") as string;
  const from = searchParams.get("from") as string;
  const to = searchParams.get("to") as string;
  const type = searchParams.get("type") as AppointmentType;
  return AppointmentsController.list(
    req,
    doctorId,
    patientId,
    status,
    date,
    from,
    to,
    type,
  );
}

/**
 * @openapi
 * /api/book:
 *   post:
 *     summary: End point to book an appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - scheduledAt
 *             properties:
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *               patientId:
 *                 type: string
 *                 format: uuid
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 patientId:
 *                   type: string
 *                   format: uuid
 *                 doctorId:
 *                   type: string
 *                   format: uuid
 *                 serviceId:
 *                   type: string
 *                   format: uuid
 *                 scheduledAt:
 *                   type: string
 *                   format: date-time
 *                 status:
 *                   type: string
 *                 type:
 *                   type: string
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 reminderSent:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *               example:
 *                 id: "18b20c8d-3a27-41fb-b6d4-1a6ecae58a9a"
 *                 patientId: "b427f2b9-971c-4a9c-85d5-915dcdc40adf"
 *                 doctorId: "0a3d15e9-44ba-4583-a05b-f9741acc48c0"
 *                 serviceId: "dbe7e586-c612-448d-9dc7-f066d152e66e"
 *                 scheduledAt: "2026-06-20T18:54:55.490Z"
 *                 status: "scheduled"
 *                 type: "new"
 *                 notes: "Patient requesting a routine annual physical and renewal of prescription."
 *                 reminderSent: false
 *                 createdAt: "2026-06-20T18:54:55.497Z"
 *       400:
 *         description: Bad Request - Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "doctorId and scheduledAt are required"
 *       401:
 *         description: Unauthorized - Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: Invalid or expired token"
 *       403:
 *         description: Forbidden - Insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Forbidden: Insufficient permissions"
 *       404:
 *         description: Not Found - Patient profile missing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Patient profile not found for this user account"
 *       409:
 *         description: Conflict - Slot unavailable.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Slot unavailable"
 */
export const POST = async (req: NextRequest) => {
  return AppointmentsController.book(req);
};
