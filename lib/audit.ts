import { prisma } from './prisma';

export type AuditAction = 'create' | 'update' | 'delete';

export async function logAction(params: {
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValue?: any;
  newValue?: any;
  performedBy: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        tableName: params.tableName,
        recordId: params.recordId,
        action: params.action,
        oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
        newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
        performedBy: params.performedBy,
      }
    });
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}
