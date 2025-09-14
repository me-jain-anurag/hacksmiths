// scripts/test-audit.js - Test the audit logging functionality
const { PrismaClient } = require('@prisma/client');

async function testAuditLogging() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Audit Logging...');
    
    // Simulate audit events like the API would create
    const testEvents = [
      {
        action: 'terminology.search',
        outcome: 'success',
        ipAddress: '192.168.1.100',
        clientId: 'emr-client-123',
        doctorId: 'doctor-456',
        queryTerm: 'diabetes',
        namasteCode: 'NM-001',
        icdCode: 'E11',
        fhirEvent: {
          resourceType: 'AuditEvent',
          action: 'E',
          recorded: new Date().toISOString(),
          outcome: '0'
        }
      },
      {
        action: 'terminology.search',
        outcome: 'error',
        ipAddress: '192.168.1.101',
        clientId: 'emr-client-124',
        queryTerm: 'nonexistent-term',
        fhirEvent: {
          resourceType: 'AuditEvent',
          action: 'E',
          recorded: new Date().toISOString(),
          outcome: '4'
        }
      }
    ];

    // Create test audit events
    for (const event of testEvents) {
      const auditLog = await prisma.auditLog.create({ data: event });
      console.log(`✅ Created audit log ${auditLog.id}: ${event.outcome} - ${event.queryTerm || 'no query'}`);
    }

    // Query recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: {
        id: true,
        timestamp: true,
        action: true,
        outcome: true,
        queryTerm: true,
        doctorId: true,
        clientId: true
      }
    });

    console.log('\n📊 Recent Audit Logs:');
    console.table(recentLogs);

    // Get stats
    const stats = await prisma.auditLog.groupBy({
      by: ['outcome'],
      _count: { outcome: true }
    });

    console.log('\n📈 Audit Statistics:');
    stats.forEach(stat => {
      console.log(`${stat.outcome}: ${stat._count.outcome} events`);
    });

    console.log('\n✅ Audit logging test completed successfully!');
    
  } catch (error) {
    console.error('❌ Audit test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuditLogging();