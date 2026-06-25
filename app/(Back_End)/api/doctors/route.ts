import { NextRequest } from "next/server";
import { Doctor } from "@/app/(Back_End)/controllers/doctor.controller";

/**
 * @swagger
 * /api/v2/doctors:
 *   get:
 *     tags:
 *       - Doctors
 *     summary: List all doctors
 *     description: Returns a paginated list of doctors. Supports filtering by name/specialty, exact specialty match, and availability on a given date.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter by doctor name or specialty (case-insensitive, partial match)
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Exact specialty filter
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-08-15"
 *         description: ISO date (YYYY-MM-DD) — only return doctors with at least one open slot on this day
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated list of doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Validation error (e.g. invalid date format for `available`)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid date format for available"
 */
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams;
    return Doctor.list(req, {
        search: query.get("search"),
        specialty: query.get("specialty"),
        available: query.get("available"),
    });
}

