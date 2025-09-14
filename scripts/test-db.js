// scripts/test-db.js - Test database connection
const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test creating an audit log entry
    const testAudit = await prisma.auditLog.create({
      data: {
        action: 'test.connection',
        outcome: 'success',
        queryTerm: 'test-query',
        fhirEvent: {
          resourceType: 'AuditEvent',
          action: 'E',
          recorded: new Date().toISOString()
        }
      }
    });
    
    console.log('✅ Test audit log created:', testAudit.id);
    
    // Count audit logs
    const count = await prisma.auditLog.count();
    console.log(`📊 Total audit logs in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();