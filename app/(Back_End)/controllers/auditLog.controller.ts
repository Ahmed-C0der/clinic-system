// TODO : review audit log controller
// src/app/controllers/auditLog.controller.ts
import { z }                         from "zod";
import { prisma }                    from "@/lib/prisma";
import { authenticate }              from "@/lib/auth";
import { getPaginationParams }       from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Role }                      from "@/lib/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildDateFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (from) filter.gte = from;
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setUTCHours(23, 59, 59, 999);
    filter.lte = endOfDay;
  }
  return filter;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────────────────────────────────────

const auditQuerySchema = z.object({
  table_name:   z.string().trim().min(1).optional(),
  record_id:    z.string().uuid().optional(),
  performed_by: z.string().uuid().optional(),
  action:       z.enum(["create", "update", "delete"]).optional(),
  from:         z.coerce.date().optional(),
  to:           z.coerce.date().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Controller
// ─────────────────────────────────────────────────────────────────────────────

export class AuditLogController {

  // ── GET /api/v2/audit-logs ───────────────────────────────────────────────

  /**
   * Paginated, filterable audit log.
   * Restricted to admin only.
   */
  static async list(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);

    const query = auditQuerySchema.parse({
      table_name:   searchParams.get("table_name")   ?? undefined,
      record_id:    searchParams.get("record_id")    ?? undefined,
      performed_by: searchParams.get("performed_by") ?? undefined,
      action:       searchParams.get("action")       ?? undefined,
      from:         searchParams.get("from")         ?? undefined,
      to:           searchParams.get("to")           ?? undefined,
    });

    const { page, limit, skip } = getPaginationParams(req);

    const performedAtFilter = buildDateFilter(query.from, query.to);

    const where = {
      ...(query.table_name   && { tableName:   query.table_name }),
      ...(query.record_id    && { recordId:    query.record_id }),
      ...(query.performed_by && { performedBy: query.performed_by }),
      ...(query.action       && { action:      query.action }),
      ...(performedAtFilter  && { performedAt: performedAtFilter }),
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { performedAt: "desc" },
        take:    limit,
        skip,
        include: {
          performer: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}