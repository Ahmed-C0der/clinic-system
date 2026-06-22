import { NextRequest, NextResponse } from 'next/server';
import { visitsController } from '../../controllers/visits.controller';
import { AppointmentStatus } from '@/lib/generated/prisma/enums';


/**
 * @swagger
 * /api/v2/visits:
 *   get:
 *     summary: List visits
 *     description: Retrieve a list of visits, with optional filtering by doctor, status, and date range.
 *     tags:
 *       - Visits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: ID of the doctor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, waiting, in_progress, done, cancelled, no_show]
 *         description: Status of the appointment
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter visits from this date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter visits up to this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: A paginated list of visits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get('doctorId') as string;
    const status = searchParams.get('status') as AppointmentStatus;
    const from = searchParams.get('from') as Date | string;
    const to = searchParams.get('to') as Date | string;
    return visitsController.list(request, doctorId, status, from, to);
}


/**
 * @swagger
 * /api/v2/visits:
 *   post:
 *     summary: Start a new visit
 *     description: Create a new visit linked to an appointment.
 *     tags:
 *       - Visits
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentId:
 *                 type: string
 *               chiefComplaint:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               notes:
 *                 type: string
 *               weightKg:
 *                 type: number
 *               heightCm:
 *                 type: number
 *               bloodPressure:
 *                 type: string
 *               temperatureC:
 *                 type: number
 *             required:
 *               - appointmentId
 *     responses:
 *       200:
 *         description: Visit created successfully
 */
export async function POST(request: NextRequest) {
    return visitsController.postVisit(request);
}
