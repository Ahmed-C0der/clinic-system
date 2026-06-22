import { NextRequest, NextResponse } from 'next/server';
import { Clinic } from '@/app/(Back_End)/controllers/clinic.controller';

/**
 * @openapi
 * /api/clinic/CommonQuestion:
 *   get:
 *     summary: Retrieve all common questions
 *     description: Returns a list of all common questions. Accessible by anyone (public).
 *     responses:
 *       200:
 *         description: A list of common questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommonQuestion'
 *       500:
 *         description: Server error
 */
export async function GET(req: NextRequest) {
    return await Clinic.GetCommonQuestions(req);
}

/**
 * @openapi
 * /api/clinic/CommonQuestion:
 *   post:
 *     summary: Create a new common question
 *     description: Creates a new common question. Only accessible by admins.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question text.
 *               answer:
 *                 type: string
 *                 description: The answer text.
 *     responses:
 *       201:
 *         description: Common question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonQuestion'
 *       400:
 *         description: Bad Request - question and answer are required
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions (requires admin)
 *       500:
 *         description: Server error
 * 
 * components:
 *   schemas:
 *     CommonQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         question:
 *           type: string
 *         answer:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *       required:
 *         - id
 *         - question
 *         - answer
 */
export async function POST(req: NextRequest) {
    return await Clinic.CreateCommonQuestion(req);
}

/**
 * @openapi
 * /api/clinic/CommonQuestion:
 *   put:
 *     summary: Update an existing common question
 *     description: Updates the question or answer of an existing common question by its ID. Only accessible by admins.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the common question to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The updated question text.
 *               answer:
 *                 type: string
 *                 description: The updated answer text.
 *     responses:
 *       200:
 *         description: Common question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommonQuestion'
 *       400:
 *         description: Bad Request - Missing ID parameter or neither question nor answer provided
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions (requires admin)
 *       404:
 *         description: Not Found - Common question not found
 *       500:
 *         description: Server error
 */
export async function PUT(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    return await Clinic.UpdateCommonQuestion(req, id);
}

/**
 * @openapi
 * /api/clinic/CommonQuestion:
 *   delete:
 *     summary: Delete a common question
 *     description: Deletes an existing common question by its ID. Only accessible by admins.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the common question to delete.
 *     responses:
 *       200:
 *         description: Common question deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Common question deleted successfully
 *       400:
 *         description: Bad Request - Missing ID parameter
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       403:
 *         description: Forbidden - Insufficient permissions (requires admin)
 *       404:
 *         description: Not Found - Common question not found
 *       500:
 *         description: Server error
 */
export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    return await Clinic.DeleteCommonQuestion(req, id!);
}