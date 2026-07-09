import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";


/**
 * @swagger
 * /api/doctors/{doctorId}/time-blocks/{time-blockId}:
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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ doctorId: string, timeBlockId: string }> }) {
    const { doctorId, timeBlockId } = await params;
    return Doctor.removeTimeBlock(req, doctorId, timeBlockId);
}
