// lib/audit-queries.ts - Helper functions for querying audit logs
import { prisma } from './prisma';

export interface AuditLogFilter {
  action?: string;
  outcome?: 'success' | 'error';
  doctorId?: string;
  clientId?: string;
  queryTerm?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(filter: AuditLogFilter = {}) {
  const {
    action,
    outcome,
    doctorId,
    clientId,
    queryTerm,
    startDate,
    endDate,
    limit = 50,
    offset = 0
  } = filter;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (action) where.action = action;
  if (outcome) where.outcome = outcome;
  if (doctorId) where.doctorId = doctorId;
  if (clientId) where.clientId = clientId;
  if (queryTerm) where.queryTerm = { contains: queryTerm, mode: 'insensitive' };
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total, hasMore: offset + limit < total };
}

/**
 * Get audit statistics
 */
export async function getAuditStats(startDate?: Date, endDate?: Date) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  const [
    total,
    successful,
    failed,
    searchCount,
    uniqueUsers,
    topQueries
  ] = await Promise.all([
    // Total audit logs
    prisma.auditLog.count({ where }),
    
    // Successful operations
    prisma.auditLog.count({ 
      where: { ...where, outcome: 'success' } 
    }),
    
    // Failed operations  
    prisma.auditLog.count({ 
      where: { ...where, outcome: 'error' } 
    }),
    
    // Search operations
    prisma.auditLog.count({ 
      where: { ...where, action: 'terminology.search' } 
    }),
    
    // Unique users (doctors)
    prisma.auditLog.findMany({
      where: { ...where, doctorId: { not: null } },
      select: { doctorId: true },
      distinct: ['doctorId']
    }).then(results => results.length),
    
    // Top search queries
    prisma.auditLog.groupBy({
      by: ['queryTerm'],
      where: { 
        ...where, 
        action: 'terminology.search',
        queryTerm: { not: null }
      },
      _count: { queryTerm: true },
      orderBy: { _count: { queryTerm: 'desc' } },
      take: 10
    })
  ]);

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    searchCount,
    uniqueUsers,
    topQueries: topQueries.map(q => ({
      query: q.queryTerm,
      count: q._count.queryTerm
    }))
  };
}

/**
 * Clean up old audit logs (for maintenance)
 */
export async function cleanupOldAuditLogs(olderThanDays: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const result = await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: cutoffDate }
    }
  });
  
  return result.count;
}